import { createEmptySiteVisitForm, createProjectFromInput } from "@/lib/project-store";
import type {
  Project,
  SitePhotoType,
  SiteVisitFormData,
} from "@/types/yardbrief";

export function createFixtureProject() {
  return createProjectFromInput({
    name: "Willow Lane Refresh",
    clientNickname: "Willow client",
    siteType: "Residential garden",
    stage: "First visit",
    area: "Willoughby, NSW",
    notes: "Refresh the lawn, drainage, and front entry planting.",
  });
}

export function createFixtureSiteVisitForm(): SiteVisitFormData {
  return {
    ...createEmptySiteVisitForm("First visit"),
    visitDate: "2 May 2026",
    projectStage: "Quote preparation",
    clientRequirements: {
      mainClientGoals: "Improve drainage\nRefresh the front entry",
      preferredOutdoorStyle: "Clean native planting",
      budgetRange: "AUD $18,000 - $24,000",
      priorityAreas: "Front entry, side path",
      mustKeepItems: "Existing maple tree",
      mustAvoidItems: "Synthetic turf",
    },
    siteConditions: {
      accessConstraints: "Narrow side gate access",
      drainageNotes: "Pooling near driveway edge",
      slopeNotes: "Gentle fall toward the street",
      shadeSunNotes: "Morning sun, afternoon shade",
      soilLawnConditionNotes: "Compacted lawn with patchy growth",
      petsChildrenConsiderations: "Small dog uses the lawn daily",
      existingIssues: "Broken edging and poor runoff",
    },
    workNotes: {
      requiredWork: "Drainage improvement\nRe-edge garden beds",
      exclusions: "Structural retaining",
      sitePreparationNeeded: "Clear loose debris before works",
      materialsToBeConfirmed: "Edging material, gravel finish",
      clientResponsibilities: "Confirm plant palette",
    },
    voiceNoteFileName: "site-walk.m4a",
    voiceNoteFileType: "audio/mp4",
    roughNote: "Client wants a neater arrival and less pooling after rain.",
  };
}

export function createFixtureUploadedPhoto(options?: {
  caption?: string;
  photoType?: SitePhotoType;
}) {
  return {
    id: "photo-1",
    fileName: "driveway-drainage.jpg",
    caption: options?.caption ?? "Pooling at the driveway edge",
    photoType: options?.photoType ?? "Drainage",
    previewUrl: "data:image/jpeg;base64,abc123",
  };
}

export function createMinimalProject(): Project {
  return createProjectFromInput({
    name: "Barebones Job",
    clientNickname: "Client A",
    siteType: "Backyard",
    stage: "First visit",
    area: "",
    notes: "",
  });
}
