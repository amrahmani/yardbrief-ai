import { mockProjects } from "@/lib/mock-data";
import type {
  Project,
  ProjectStage,
  ProjectStatus,
  SiteVisitFormData,
} from "@/types/yardbrief";

export const LOCAL_PROJECTS_KEY = "yardbrief-ai-local-projects";
export const LOCAL_PROJECTS_EVENT = "yardbrief-ai-projects-updated";

export interface CreateProjectInput {
  name: string;
  clientNickname: string;
  siteType: string;
  stage: ProjectStage;
  area: string;
  notes: string;
}

export function createEmptySiteVisitForm(
  projectStage: ProjectStage,
): SiteVisitFormData {
  return {
    visitDate: "",
    projectStage,
    clientRequirements: {
      mainClientGoals: "",
      preferredOutdoorStyle: "",
      budgetRange: "",
      priorityAreas: "",
      mustKeepItems: "",
      mustAvoidItems: "",
    },
    siteConditions: {
      accessConstraints: "",
      drainageNotes: "",
      slopeNotes: "",
      shadeSunNotes: "",
      soilLawnConditionNotes: "",
      petsChildrenConsiderations: "",
      existingIssues: "",
    },
    workNotes: {
      requiredWork: "",
      exclusions: "",
      sitePreparationNeeded: "",
      materialsToBeConfirmed: "",
      clientResponsibilities: "",
    },
    voiceNoteFileName: "",
    voiceNoteFileType: "",
    roughNote: "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function mapStageToStatus(stage: ProjectStage): ProjectStatus {
  if (stage === "Completed") {
    return "Report ready";
  }

  if (stage === "First visit") {
    return "Awaiting site visit";
  }

  return "Active";
}

function buildSummary(siteType: string, notes: string) {
  if (notes.trim()) {
    return notes.trim();
  }

  return `New ${siteType.toLowerCase()} project created in YardBrief AI.`;
}

export function createProjectFromInput(input: CreateProjectInput): Project {
  const now = new Date();
  const longDate = formatDate(now);
  const shortDate = formatShortDate(now);
  const cleanName = input.name.trim();
  const nickname = input.clientNickname.trim();
  const cleanArea = input.area.trim();
  const cleanNotes = input.notes.trim();
  const idSeed = slugify(cleanName) || "yardbrief-project";
  const id = `${idSeed}-${Date.now().toString(36)}`;

  return {
    id,
    name: cleanName,
    clientName: nickname,
    clientNickname: nickname,
    location: cleanArea || "Area withheld",
    siteType: input.siteType,
    briefType: "Site visit report",
    summary: buildSummary(input.siteType, cleanNotes),
    notes: cleanNotes || "No notes added yet.",
    stage: input.stage,
    status: mapStageToStatus(input.stage),
    budgetRange: "Not set",
    dueDate: "Not scheduled",
    lastUpdated: longDate,
    tags: cleanArea ? [cleanArea] : [],
    metrics: [
      {
        label: "Stage",
        value: input.stage,
        detail: "Current project progress from intake.",
      },
      {
        label: "Site type",
        value: input.siteType,
        detail: "Selected during project creation.",
      },
      {
        label: "Reports",
        value: "0",
        detail: "No reports created yet.",
      },
    ],
    goals: cleanNotes ? [cleanNotes] : ["Document the first site visit and prepare the next client-ready output."],
    deliverables: ["Site visit report", "Client brief", "Quote-ready summary"],
    timeline: [
      {
        label: "Project created",
        date: shortDate,
        detail: "Started from the YardBrief create project form.",
      },
    ],
    siteVisit: {
      scheduledFor: "Not scheduled yet",
      lead: "To be assigned",
      attendees: nickname ? [nickname] : [],
      checklist: [],
      observations: cleanArea
        ? [
            {
              label: "Area",
              value: cleanArea,
            },
          ]
        : [],
      constraints: [],
      opportunities: [],
      equipment: [],
      photos: [],
      form: createEmptySiteVisitForm(input.stage),
    },
    recentSiteVisits: [],
    reports: [],
  };
}

export function readLocalProjects(): Project[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PROJECTS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as Project[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalProjects(projects: Project[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event(LOCAL_PROJECTS_EVENT));
}

export function saveProjectToLocalStore(project: Project) {
  const existing = readLocalProjects();
  const deduped = existing.filter((item) => item.id !== project.id);
  writeLocalProjects([project, ...deduped]);
}

export function mergeProjects(localProjects: Project[]) {
  const localIds = new Set(localProjects.map((project) => project.id));
  return [...localProjects, ...mockProjects.filter((project) => !localIds.has(project.id))];
}
