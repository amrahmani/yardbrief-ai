import type {
  Project,
  ProjectStage,
  RecentSiteVisit,
  SiteObservation,
  SitePhotoPlaceholder,
  SiteVisitFormData,
} from "@/types/yardbrief";

const siteVisitStageOptions: ProjectStage[] = [
  "First visit",
  "Quote preparation",
  "Work in progress",
  "Completed",
  "Follow-up",
];

export interface UploadedPhotoDraft {
  id: string;
  fileName: string;
  caption: string;
  photoType: SitePhotoPlaceholder["photoType"] extends infer T
    ? Exclude<T, undefined>
    : never;
  previewUrl: string;
}

export function normalizeSiteVisitStage(stage: ProjectStage): ProjectStage {
  if (siteVisitStageOptions.includes(stage)) {
    return stage;
  }

  if (stage === "Site visit") {
    return "First visit";
  }

  if (stage === "Design brief") {
    return "Quote preparation";
  }

  if (stage === "Client review") {
    return "Follow-up";
  }

  return "First visit";
}

function splitEntries(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createObservationList(form: SiteVisitFormData): SiteObservation[] {
  const items = [
    ["Drainage", form.siteConditions.drainageNotes],
    ["Slope", form.siteConditions.slopeNotes],
    ["Sun / Shade", form.siteConditions.shadeSunNotes],
    ["Soil / Lawn", form.siteConditions.soilLawnConditionNotes],
  ];

  return items
    .filter(([, value]) => value.trim())
    .map(([label, value]) => ({
      label,
      value: value.trim(),
    }));
}

function formatLongDate(date: Date) {
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

function buildSavedPhotos(photos: UploadedPhotoDraft[]): SitePhotoPlaceholder[] {
  return photos.map((photo) => ({
    label: photo.fileName,
    caption: photo.caption.trim(),
    photoType: photo.photoType,
    fileName: photo.fileName,
    previewUrl: photo.previewUrl || undefined,
  }));
}

function buildRecentSiteVisit({
  now,
  form,
  project,
  summary,
}: {
  now: Date;
  form: SiteVisitFormData;
  project: Project;
  summary: string;
}): RecentSiteVisit {
  const lastUpdated = formatLongDate(now);

  return {
    id: `visit-${now.getTime().toString(36)}`,
    title: `${form.projectStage} site visit`,
    date: form.visitDate.trim() || lastUpdated,
    lead:
      project.siteVisit.lead && project.siteVisit.lead !== "To be assigned"
        ? project.siteVisit.lead
        : "YardBrief user",
    summary,
  };
}

export function applySiteVisitFormToProject({
  form,
  now = new Date(),
  project,
  uploadedPhotos,
}: {
  form: SiteVisitFormData;
  now?: Date;
  project: Project;
  uploadedPhotos: UploadedPhotoDraft[];
}) {
  const lastUpdated = formatLongDate(now);
  const stage = form.projectStage;
  const recentVisitSummary =
    form.roughNote.trim() ||
    form.clientRequirements.mainClientGoals.trim() ||
    "Structured site visit details saved.";
  const savedPhotos = buildSavedPhotos(uploadedPhotos);

  return {
    ...project,
    stage,
    budgetRange: form.clientRequirements.budgetRange.trim() || project.budgetRange,
    notes: form.roughNote.trim() || project.notes,
    lastUpdated,
    goals:
      splitEntries(form.clientRequirements.mainClientGoals).length > 0
        ? splitEntries(form.clientRequirements.mainClientGoals)
        : project.goals,
    deliverables:
      splitEntries(form.workNotes.requiredWork).length > 0
        ? splitEntries(form.workNotes.requiredWork)
        : project.deliverables,
    tags:
      splitEntries(form.clientRequirements.priorityAreas).length > 0
        ? splitEntries(form.clientRequirements.priorityAreas)
        : project.tags,
    timeline: [
      {
        label: "Site visit saved",
        date: form.visitDate.trim() || formatShortDate(now),
        detail: "Structured site visit notes were saved to the active project.",
      },
      ...project.timeline.filter((item) => item.label !== "Site visit saved"),
    ],
    siteVisit: {
      ...project.siteVisit,
      scheduledFor: form.visitDate.trim() || "Not scheduled yet",
      constraints: [
        form.siteConditions.accessConstraints,
        form.siteConditions.petsChildrenConsiderations,
        form.siteConditions.existingIssues,
      ].filter((item) => item.trim()),
      observations: createObservationList(form),
      checklist: [
        form.workNotes.requiredWork,
        form.workNotes.sitePreparationNeeded,
        form.workNotes.clientResponsibilities,
      ].filter((item) => item.trim()),
      photos: savedPhotos,
      form,
    },
    recentSiteVisits: [
      buildRecentSiteVisit({
        now,
        form,
        project,
        summary: recentVisitSummary,
      }),
      ...project.recentSiteVisits,
    ].slice(0, 5),
  } satisfies Project;
}
