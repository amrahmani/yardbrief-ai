import type { SupabaseClient, User } from "@supabase/supabase-js";

import { activeProductConfig } from "@/data/productTypes";
import {
  createDefaultAppSettings,
  DEFAULT_REPORT_DISCLAIMER,
} from "@/lib/app-settings-store";
import { createEmptySiteVisitForm } from "@/lib/project-store";
import { createDefaultSubscriptionState } from "@/lib/subscription-store";
import type {
  LocalAppSettings,
  LocalSubscriptionState,
  Project,
  ProjectMetric,
  ProjectStage,
  RecentSiteVisit,
  Report,
  ReportSection,
  SiteObservation,
  SitePhotoPlaceholder,
  SiteVisit,
  SiteVisitFormData,
  TimelineItem,
} from "@/types/yardbrief";

interface UserRow {
  id: string;
  email: string | null;
  business_name: string;
  contact_email: string;
  phone: string;
  default_tone: LocalAppSettings["reportPreferences"]["defaultTone"];
  default_disclaimer: string;
  default_product_type: LocalAppSettings["reportPreferences"]["defaultProductType"];
  use_client_nickname_by_default: boolean;
  do_not_require_exact_address: boolean;
  remove_image_metadata_before_upload: boolean;
  cloud_sync_enabled: boolean;
}

interface SubscriptionRow {
  user_id: string;
  product_type: string;
  plan: LocalSubscriptionState["plan"];
  status: LocalSubscriptionState["status"];
  billing_interval: LocalSubscriptionState["billing_interval"];
  usage_month: string;
  reports_generated_this_month: number;
  ai_generations_this_month: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface ProjectRow {
  id: string;
  user_id: string;
  product_type: string;
  name: string;
  client_name: string;
  client_nickname: string;
  location: string;
  site_type: string;
  brief_type: string;
  summary: string;
  notes: string;
  stage: string;
  status: Project["status"];
  budget_range: string;
  due_date: string;
  last_updated: string;
  tags: unknown;
  metrics: unknown;
  goals: unknown;
  deliverables: unknown;
  timeline: unknown;
  recent_site_visits: unknown;
}

interface SiteVisitRow {
  id: string;
  project_id: string;
  user_id: string;
  scheduled_for: string;
  lead: string;
  attendees: unknown;
  checklist: unknown;
  observations: unknown;
  constraints: unknown;
  opportunities: unknown;
  equipment: unknown;
  form: unknown;
}

interface PhotoRow {
  site_visit_id: string;
  label: string;
  caption: string;
  photo_type: SitePhotoPlaceholder["photoType"];
  file_name: string;
}

interface ReportRow {
  id: string;
  project_id: string;
  product_type: string;
  title: string;
  type: string;
  tone: Report["tone"] | null;
  markdown: string | null;
  status: Report["status"];
  created_at_label: string;
  updated_at_label: string;
  audience: string;
  summary: string;
  highlights: unknown;
  sections: unknown;
  next_steps: unknown;
}

export interface CloudWorkspaceData {
  settings: LocalAppSettings;
  subscription: LocalSubscriptionState;
  projects: Project[];
}

function ensureString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function ensureBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function ensureStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function ensureObjectArray<T>(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is T => typeof item === "object" && item !== null)
    : [];
}

function normalizeProjectStage(value: unknown, fallback: ProjectStage): ProjectStage {
  return typeof value === "string" ? (value as ProjectStage) : fallback;
}

function normalizeSiteVisitForm(value: unknown, stage: ProjectStage): SiteVisitFormData | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const parsed = value as Partial<SiteVisitFormData>;
  const defaults = createEmptySiteVisitForm(stage);

  return {
    ...defaults,
    visitDate: ensureString(parsed.visitDate, defaults.visitDate),
    projectStage: normalizeProjectStage(parsed.projectStage, stage),
    clientRequirements: {
      ...defaults.clientRequirements,
      ...(parsed.clientRequirements ?? {}),
    },
    siteConditions: {
      ...defaults.siteConditions,
      ...(parsed.siteConditions ?? {}),
    },
    workNotes: {
      ...defaults.workNotes,
      ...(parsed.workNotes ?? {}),
    },
    voiceNoteFileName: ensureString(parsed.voiceNoteFileName, ""),
    voiceNoteFileType: ensureString(parsed.voiceNoteFileType, ""),
    roughNote: ensureString(parsed.roughNote, ""),
  };
}

function mapUserRowToSettings(userRow: UserRow | null, authUser: User) {
  const defaults = createDefaultAppSettings();

  if (!userRow) {
    return {
      ...defaults,
      businessProfile: {
        ...defaults.businessProfile,
        contactEmail: authUser.email ?? defaults.businessProfile.contactEmail,
      },
      privacySettings: {
        ...defaults.privacySettings,
        cloudSyncEnabled: true,
      },
    } satisfies LocalAppSettings;
  }

  return {
    businessProfile: {
      businessName: userRow.business_name || defaults.businessProfile.businessName,
      contactEmail:
        userRow.contact_email || userRow.email || authUser.email || defaults.businessProfile.contactEmail,
      phone: userRow.phone || defaults.businessProfile.phone,
    },
    reportPreferences: {
      defaultTone: userRow.default_tone || defaults.reportPreferences.defaultTone,
      defaultDisclaimer: userRow.default_disclaimer || DEFAULT_REPORT_DISCLAIMER,
      defaultProductType:
        userRow.default_product_type || defaults.reportPreferences.defaultProductType,
    },
    privacySettings: {
      useClientNicknameByDefault: ensureBoolean(
        userRow.use_client_nickname_by_default,
        defaults.privacySettings.useClientNicknameByDefault,
      ),
      doNotRequireExactAddress: ensureBoolean(
        userRow.do_not_require_exact_address,
        defaults.privacySettings.doNotRequireExactAddress,
      ),
      removeImageMetadataBeforeUpload: ensureBoolean(
        userRow.remove_image_metadata_before_upload,
        defaults.privacySettings.removeImageMetadataBeforeUpload,
      ),
      cloudSyncEnabled: true,
    },
  } satisfies LocalAppSettings;
}

function mapSubscriptionRowToState(row: SubscriptionRow | null) {
  const defaults = createDefaultSubscriptionState();

  if (!row) {
    return defaults;
  }

  return {
    plan: row.plan || defaults.plan,
    status: row.status || defaults.status,
    billing_interval: row.billing_interval ?? defaults.billing_interval,
    usage_month: row.usage_month || defaults.usage_month,
    reports_generated_this_month:
      typeof row.reports_generated_this_month === "number"
        ? row.reports_generated_this_month
        : defaults.reports_generated_this_month,
    ai_generations_this_month:
      typeof row.ai_generations_this_month === "number"
        ? row.ai_generations_this_month
        : defaults.ai_generations_this_month,
    stripe_customer_id: row.stripe_customer_id || defaults.stripe_customer_id,
    stripe_subscription_id:
      row.stripe_subscription_id || defaults.stripe_subscription_id,
    stripe_price_id: row.stripe_price_id || defaults.stripe_price_id,
    current_period_end:
      typeof row.current_period_end === "string" || row.current_period_end === null
        ? row.current_period_end
        : defaults.current_period_end,
    cancel_at_period_end:
      typeof row.cancel_at_period_end === "boolean"
        ? row.cancel_at_period_end
        : defaults.cancel_at_period_end,
  } satisfies LocalSubscriptionState;
}

function mapProjectRowToProject(
  row: ProjectRow,
  siteVisitRow: SiteVisitRow | null,
  reports: Report[],
  photos: SitePhotoPlaceholder[],
): Project {
  const stage = normalizeProjectStage(row.stage, "First visit");
  const siteVisit: SiteVisit = siteVisitRow
    ? {
        scheduledFor: siteVisitRow.scheduled_for || "Not scheduled yet",
        lead: siteVisitRow.lead || "To be assigned",
        attendees: ensureStringArray(siteVisitRow.attendees),
        checklist: ensureStringArray(siteVisitRow.checklist),
        observations: ensureObjectArray<SiteObservation>(siteVisitRow.observations),
        constraints: ensureStringArray(siteVisitRow.constraints),
        opportunities: ensureStringArray(siteVisitRow.opportunities),
        equipment: ensureStringArray(siteVisitRow.equipment),
        photos,
        form: normalizeSiteVisitForm(siteVisitRow.form, stage),
      }
    : {
        scheduledFor: "Not scheduled yet",
        lead: "To be assigned",
        attendees: [],
        checklist: [],
        observations: [],
        constraints: [],
        opportunities: [],
        equipment: [],
        photos,
        form: createEmptySiteVisitForm(stage),
      };

  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    clientNickname: row.client_nickname,
    location: row.location,
    siteType: row.site_type,
    briefType: row.brief_type,
    summary: row.summary,
    notes: row.notes,
    stage,
    status: row.status,
    budgetRange: row.budget_range,
    dueDate: row.due_date,
    lastUpdated: row.last_updated,
    tags: ensureStringArray(row.tags),
    metrics: ensureObjectArray<ProjectMetric>(row.metrics),
    goals: ensureStringArray(row.goals),
    deliverables: ensureStringArray(row.deliverables),
    timeline: ensureObjectArray<TimelineItem>(row.timeline),
    siteVisit,
    recentSiteVisits: ensureObjectArray<RecentSiteVisit>(row.recent_site_visits),
    reports,
  };
}

function mapReportRowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    tone: row.tone ?? undefined,
    markdown: row.markdown ?? undefined,
    status: row.status,
    createdAt: row.created_at_label,
    updatedAt: row.updated_at_label,
    audience: row.audience,
    summary: row.summary,
    highlights: ensureStringArray(row.highlights),
    sections: ensureObjectArray<ReportSection>(row.sections),
    nextSteps: ensureStringArray(row.next_steps),
  };
}

function mapPhotoRowToPhoto(row: PhotoRow): SitePhotoPlaceholder {
  return {
    label: row.label,
    caption: row.caption,
    photoType: row.photo_type ?? "Other",
    fileName: row.file_name || undefined,
  };
}

function hasExistingUserProfile(row: UserRow | null) {
  return Boolean(row?.id);
}

function hasExistingSubscription(row: SubscriptionRow | null) {
  return Boolean(row?.user_id);
}

export async function saveSettingsToSupabase(
  supabase: SupabaseClient,
  user: User,
  settings: LocalAppSettings,
) {
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      business_name: settings.businessProfile.businessName,
      contact_email: settings.businessProfile.contactEmail,
      phone: settings.businessProfile.phone,
      default_tone: settings.reportPreferences.defaultTone,
      default_disclaimer: settings.reportPreferences.defaultDisclaimer,
      default_product_type: settings.reportPreferences.defaultProductType,
      use_client_nickname_by_default: settings.privacySettings.useClientNicknameByDefault,
      do_not_require_exact_address: settings.privacySettings.doNotRequireExactAddress,
      remove_image_metadata_before_upload:
        settings.privacySettings.removeImageMetadataBeforeUpload,
      cloud_sync_enabled: true,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function saveSubscriptionToSupabase(
  supabase: SupabaseClient,
  user: User,
  subscription: LocalSubscriptionState,
  productType = activeProductConfig.product_type,
) {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      product_type: productType,
      plan: subscription.plan,
      status: subscription.status,
      billing_interval: subscription.billing_interval,
      usage_month: subscription.usage_month,
      reports_generated_this_month: subscription.reports_generated_this_month,
      ai_generations_this_month: subscription.ai_generations_this_month,
      stripe_customer_id: subscription.stripe_customer_id,
      stripe_subscription_id: subscription.stripe_subscription_id,
      stripe_price_id: subscription.stripe_price_id,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}

export async function saveProjectToSupabase(
  supabase: SupabaseClient,
  user: User,
  project: Project,
  productType = activeProductConfig.product_type,
) {
  const { error: projectError } = await supabase.from("projects").upsert(
    {
      id: project.id,
      user_id: user.id,
      product_type: productType,
      name: project.name,
      client_name: project.clientName,
      client_nickname: project.clientNickname,
      location: project.location,
      site_type: project.siteType,
      brief_type: project.briefType,
      summary: project.summary,
      notes: project.notes,
      stage: project.stage,
      status: project.status,
      budget_range: project.budgetRange,
      due_date: project.dueDate,
      last_updated: project.lastUpdated,
      tags: project.tags,
      metrics: project.metrics,
      goals: project.goals,
      deliverables: project.deliverables,
      timeline: project.timeline,
      recent_site_visits: project.recentSiteVisits,
    },
    {
      onConflict: "id",
    },
  );

  if (projectError) {
    throw projectError;
  }

  const { data: siteVisitRecord, error: siteVisitError } = await supabase
    .from("site_visits")
    .upsert(
      {
        project_id: project.id,
        user_id: user.id,
        scheduled_for: project.siteVisit.scheduledFor,
        lead: project.siteVisit.lead,
        attendees: project.siteVisit.attendees,
        checklist: project.siteVisit.checklist,
        observations: project.siteVisit.observations,
        constraints: project.siteVisit.constraints,
        opportunities: project.siteVisit.opportunities,
        equipment: project.siteVisit.equipment,
        form: project.siteVisit.form ?? null,
      },
      {
        onConflict: "project_id",
      },
    )
    .select("id")
    .single();

  if (siteVisitError) {
    throw siteVisitError;
  }

  const siteVisitId = ensureString(siteVisitRecord?.id);

  if (siteVisitId) {
    const { error: deletePhotoError } = await supabase
      .from("photos")
      .delete()
      .eq("site_visit_id", siteVisitId)
      .eq("user_id", user.id);

    if (deletePhotoError) {
      throw deletePhotoError;
    }

    if (project.siteVisit.photos.length > 0) {
      const { error: photoError } = await supabase.from("photos").insert(
        project.siteVisit.photos.map((photo) => ({
          site_visit_id: siteVisitId,
          user_id: user.id,
          label: photo.label,
          caption: photo.caption,
          photo_type: photo.photoType ?? "Other",
          file_name: photo.fileName ?? photo.label,
          storage_status: "local_only",
        })),
      );

      if (photoError) {
        throw photoError;
      }
    }
  }

  const reportIds = project.reports.map((report) => report.id);

  const staleReportsQuery = supabase
    .from("reports")
    .delete()
    .eq("project_id", project.id)
    .eq("user_id", user.id);

  const { error: staleReportsError } =
    reportIds.length > 0
      ? await staleReportsQuery.not("id", "in", `(${reportIds.map((id) => `"${id}"`).join(",")})`)
      : await staleReportsQuery;

  if (staleReportsError) {
    throw staleReportsError;
  }

  if (project.reports.length > 0) {
    const { error: reportError } = await supabase.from("reports").upsert(
      project.reports.map((report) => ({
        id: report.id,
        project_id: project.id,
        user_id: user.id,
        product_type: productType,
        title: report.title,
        type: report.type,
        tone: report.tone ?? null,
        markdown: report.markdown ?? null,
        status: report.status,
        created_at_label: report.createdAt,
        updated_at_label: report.updatedAt,
        audience: report.audience,
        summary: report.summary,
        highlights: report.highlights,
        sections: report.sections,
        next_steps: report.nextSteps,
      })),
      {
        onConflict: "id",
      },
    );

    if (reportError) {
      throw reportError;
    }
  }
}

export async function syncLocalDataToSupabase(args: {
  supabase: SupabaseClient;
  user: User;
  settings: LocalAppSettings;
  subscription: LocalSubscriptionState;
  projects: Project[];
}) {
  const { supabase, user, settings, subscription, projects } = args;
  const [existingUserResult, existingSubscriptionResult, existingProjectsResult] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("projects").select("id").eq("user_id", user.id),
    ]);

  if (existingUserResult.error) {
    throw existingUserResult.error;
  }

  if (existingSubscriptionResult.error) {
    throw existingSubscriptionResult.error;
  }

  if (existingProjectsResult.error) {
    throw existingProjectsResult.error;
  }

  const existingUser = (existingUserResult.data as UserRow | null) ?? null;
  const existingSubscription = (existingSubscriptionResult.data as SubscriptionRow | null) ?? null;
  const existingProjectIds = new Set(
    ((existingProjectsResult.data ?? []) as Array<{ id: string }>).map((project) => project.id),
  );
  const shouldPreserveStripeSubscription =
    Boolean(existingSubscription?.stripe_customer_id) ||
    Boolean(existingSubscription?.stripe_subscription_id) ||
    (existingSubscription?.status &&
      existingSubscription.status !== "demo" &&
      existingSubscription.status !== "checkout_pending");
  const subscriptionToPersist = shouldPreserveStripeSubscription
    ? mapSubscriptionRowToState(existingSubscription)
    : subscription;

  if (!hasExistingUserProfile(existingUser)) {
    await saveSettingsToSupabase(supabase, user, settings);
  }

  if (!hasExistingSubscription(existingSubscription)) {
    await saveSubscriptionToSupabase(
      supabase,
      user,
      subscriptionToPersist,
      settings.reportPreferences.defaultProductType,
    );
  }

  for (const project of projects) {
    if (existingProjectIds.has(project.id)) {
      continue;
    }

    await saveProjectToSupabase(
      supabase,
      user,
      project,
      settings.reportPreferences.defaultProductType,
    );
  }
}

export async function loadWorkspaceFromSupabase(
  supabase: SupabaseClient,
  user: User,
): Promise<CloudWorkspaceData> {
  const [userResult, subscriptionResult, projectsResult, siteVisitsResult, photosResult, reportsResult] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("site_visits")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("photos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);

  for (const result of [
    userResult,
    subscriptionResult,
    projectsResult,
    siteVisitsResult,
    photosResult,
    reportsResult,
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  const siteVisitsByProjectId = new Map(
    ((siteVisitsResult.data ?? []) as SiteVisitRow[]).map((siteVisit) => [siteVisit.project_id, siteVisit]),
  );
  const photosBySiteVisitId = new Map<string, SitePhotoPlaceholder[]>();

  for (const photo of (photosResult.data ?? []) as PhotoRow[]) {
    const current = photosBySiteVisitId.get(photo.site_visit_id) ?? [];
    current.push(mapPhotoRowToPhoto(photo));
    photosBySiteVisitId.set(photo.site_visit_id, current);
  }

  const reportsByProjectId = new Map<string, Report[]>();

  for (const report of (reportsResult.data ?? []) as ReportRow[]) {
    const current = reportsByProjectId.get(report.project_id) ?? [];
    current.push(mapReportRowToReport(report));
    reportsByProjectId.set(report.project_id, current);
  }

  const projects = ((projectsResult.data ?? []) as ProjectRow[]).map((projectRow) => {
    const siteVisitRow = siteVisitsByProjectId.get(projectRow.id) ?? null;
    const photos = siteVisitRow ? (photosBySiteVisitId.get(siteVisitRow.id) ?? []) : [];
    const reports = reportsByProjectId.get(projectRow.id) ?? [];

    return mapProjectRowToProject(projectRow, siteVisitRow, reports, photos);
  });

  return {
    settings: mapUserRowToSettings((userResult.data as UserRow | null) ?? null, user),
    subscription: mapSubscriptionRowToState(
      (subscriptionResult.data as SubscriptionRow | null) ?? null,
    ),
    projects,
  };
}
