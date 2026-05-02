"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  dispatchAllLocalDataEvents,
  exportLocalDataSnapshot,
  LOCAL_APP_SETTINGS_EVENT,
  readAppSettings,
  resetAllLocalData,
  writeAppSettings,
} from "@/lib/app-settings-store";
import { mockProjects } from "@/lib/mock-data";
import {
  LOCAL_PROJECTS_EVENT,
  mergeProjects,
  readLocalProjects,
  saveProjectToLocalStore,
} from "@/lib/project-store";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  loadWorkspaceFromSupabase,
  saveProjectToSupabase,
  saveSettingsToSupabase,
  saveSubscriptionToSupabase,
  syncLocalDataToSupabase,
} from "@/lib/supabase/workspace";
import {
  LOCAL_SUBSCRIPTION_EVENT,
  createDefaultSubscriptionState,
  readSubscriptionState,
  writeSubscriptionState,
} from "@/lib/subscription-store";
import type { LocalAppSettings, LocalSubscriptionState, Project } from "@/types/yardbrief";

export type WorkspaceMode = "demo" | "cloud";
export type CloudStatus = "idle" | "syncing" | "ready" | "error";

interface AuthCredentials {
  email: string;
  password: string;
}

interface WorkspaceDataContextValue {
  ready: boolean;
  authReady: boolean;
  mode: WorkspaceMode;
  cloudStatus: CloudStatus;
  cloudError: string;
  supabaseConfigured: boolean;
  user: User | null;
  projects: Project[];
  settings: LocalAppSettings;
  subscription: LocalSubscriptionState;
  projectCount: number;
  saveProject: (project: Project) => Promise<void>;
  updateSettings: (settings: LocalAppSettings) => Promise<void>;
  replaceSubscription: (subscription: LocalSubscriptionState) => Promise<void>;
  incrementSubscriptionUsage: (args: {
    reports?: number;
    aiGenerations?: number;
  }) => Promise<void>;
  exportLocalSnapshot: typeof exportLocalDataSnapshot;
  resetLocalWorkspace: () => void;
  signInWithPassword: (credentials: AuthCredentials) => Promise<void>;
  signUpWithPassword: (credentials: AuthCredentials) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const WorkspaceDataContext = createContext<WorkspaceDataContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function mergeProjectIntoList(projects: Project[], nextProject: Project) {
  return [nextProject, ...projects.filter((project) => project.id !== nextProject.id)];
}

export function WorkspaceDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseConfigured = isSupabaseConfigured();
  const [supabase] = useState(() =>
    supabaseConfigured ? createSupabaseBrowserClient() : null,
  );

  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [localSettings, setLocalSettings] = useState<LocalAppSettings>(readAppSettings());
  const [localSubscription, setLocalSubscription] = useState<LocalSubscriptionState>(
    createDefaultSubscriptionState(),
  );
  const [localReady, setLocalReady] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>("idle");
  const [cloudError, setCloudError] = useState("");
  const [cloudProjects, setCloudProjects] = useState<Project[]>([]);
  const [cloudSettings, setCloudSettings] = useState<LocalAppSettings>(readAppSettings());
  const [cloudSubscription, setCloudSubscription] = useState<LocalSubscriptionState>(
    createDefaultSubscriptionState(),
  );

  const localSnapshotRef = useRef({
    projects: localProjects,
    settings: localSettings,
    subscription: localSubscription,
  });

  useEffect(() => {
    localSnapshotRef.current = {
      projects: localProjects,
      settings: localSettings,
      subscription: localSubscription,
    };
  }, [localProjects, localSettings, localSubscription]);

  useEffect(() => {
    const syncLocalState = () => {
      setLocalProjects(readLocalProjects());
      setLocalSettings(readAppSettings());
      setLocalSubscription(readSubscriptionState());
      setLocalReady(true);
    };

    syncLocalState();
    window.addEventListener("storage", syncLocalState);
    window.addEventListener(LOCAL_APP_SETTINGS_EVENT, syncLocalState);
    window.addEventListener(LOCAL_PROJECTS_EVENT, syncLocalState);
    window.addEventListener(LOCAL_SUBSCRIPTION_EVENT, syncLocalState);

    return () => {
      window.removeEventListener("storage", syncLocalState);
      window.removeEventListener(LOCAL_APP_SETTINGS_EVENT, syncLocalState);
      window.removeEventListener(LOCAL_PROJECTS_EVENT, syncLocalState);
      window.removeEventListener(LOCAL_SUBSCRIPTION_EVENT, syncLocalState);
    };
  }, []);

  const connectCloud = useCallback(
    async (nextUser: User) => {
      if (!supabase) {
        return;
      }

      setCloudStatus("syncing");
      setCloudError("");

      try {
        const snapshot = localSnapshotRef.current;

        await syncLocalDataToSupabase({
          supabase,
          user: nextUser,
          settings: snapshot.settings,
          subscription: snapshot.subscription,
          projects: snapshot.projects,
        });

        const cloudData = await loadWorkspaceFromSupabase(supabase, nextUser);

        setCloudProjects(cloudData.projects);
        setCloudSettings(cloudData.settings);
        setCloudSubscription(cloudData.subscription);
        setCloudStatus("ready");
      } catch (error) {
        setCloudProjects([]);
        setCloudSettings(localSnapshotRef.current.settings);
        setCloudSubscription(localSnapshotRef.current.subscription);
        setCloudStatus("error");
        setCloudError(
          getErrorMessage(
            error,
            "Supabase connection failed, so YardBrief stayed in local demo mode.",
          ),
        );
      }
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    const initialize = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (error) {
        setCloudStatus("error");
        setCloudError(error.message);
      }

      const nextUser = data.user ?? null;
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser) {
        await connectCloud(nextUser);
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthReady(true);

      if (nextUser) {
        void connectCloud(nextUser);
        return;
      }

      setCloudProjects([]);
      setCloudSettings(localSnapshotRef.current.settings);
      setCloudSubscription(localSnapshotRef.current.subscription);
      setCloudStatus("idle");
      setCloudError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [connectCloud, supabase]);

  const mode: WorkspaceMode = user && cloudStatus === "ready" ? "cloud" : "demo";
  const projects = useMemo(() => {
    if (mode === "cloud") {
      return cloudProjects;
    }

    if (!localReady) {
      return mockProjects;
    }

    return mergeProjects(localProjects);
  }, [cloudProjects, localProjects, localReady, mode]);
  const settings = mode === "cloud" ? cloudSettings : localSettings;
  const subscription = mode === "cloud" ? cloudSubscription : localSubscription;
  const ready = localReady && authReady && (mode === "cloud" ? cloudStatus === "ready" : true);

  async function saveProject(project: Project) {
    if (mode === "cloud" && supabase && user) {
      await saveProjectToSupabase(
        supabase,
        user,
        project,
        settings.reportPreferences.defaultProductType,
      );
      setCloudProjects((current) => mergeProjectIntoList(current, project));
      return;
    }

    saveProjectToLocalStore(project);
  }

  async function updateSettings(nextSettings: LocalAppSettings) {
    if (mode === "cloud" && supabase && user) {
      await saveSettingsToSupabase(supabase, user, nextSettings);
      setCloudSettings(nextSettings);
      return;
    }

    writeAppSettings(nextSettings);
    setLocalSettings(nextSettings);
    dispatchAllLocalDataEvents();
  }

  async function replaceSubscription(nextSubscription: LocalSubscriptionState) {
    if (mode === "cloud" && supabase && user) {
      await saveSubscriptionToSupabase(
        supabase,
        user,
        nextSubscription,
        settings.reportPreferences.defaultProductType,
      );
      setCloudSubscription(nextSubscription);
      return;
    }

    writeSubscriptionState(nextSubscription);
    setLocalSubscription(nextSubscription);
    dispatchAllLocalDataEvents();
  }

  async function incrementSubscriptionUsage({
    reports = 0,
    aiGenerations = 0,
  }: {
    reports?: number;
    aiGenerations?: number;
  }) {
    const nextSubscription = {
      ...subscription,
      reports_generated_this_month: subscription.reports_generated_this_month + reports,
      ai_generations_this_month: subscription.ai_generations_this_month + aiGenerations,
    } satisfies LocalSubscriptionState;

    await replaceSubscription(nextSubscription);
  }

  function resetLocalWorkspace() {
    resetAllLocalData();
  }

  async function signInWithPassword({ email, password }: AuthCredentials) {
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }

  async function signUpWithPassword({ email, password }: AuthCredentials) {
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      throw error;
    }
  }

  async function sendMagicLink(email: string) {
    if (!supabase) {
      throw new Error("Supabase is not configured yet.");
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  const value: WorkspaceDataContextValue = {
    ready,
    authReady,
    mode,
    cloudStatus,
    cloudError,
    supabaseConfigured,
    user,
    projects,
    settings,
    subscription,
    projectCount: projects.length,
    saveProject,
    updateSettings,
    replaceSubscription,
    incrementSubscriptionUsage,
    exportLocalSnapshot: exportLocalDataSnapshot,
    resetLocalWorkspace,
    signInWithPassword,
    signUpWithPassword,
    sendMagicLink,
    signOut,
  };

  return (
    <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>
  );
}

export function useWorkspaceData() {
  const context = useContext(WorkspaceDataContext);

  if (!context) {
    throw new Error("useWorkspaceData must be used within WorkspaceDataProvider.");
  }

  return context;
}
