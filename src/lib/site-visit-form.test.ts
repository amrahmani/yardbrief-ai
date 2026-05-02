import { describe, expect, it } from "vitest";

import { applySiteVisitFormToProject } from "@/lib/site-visit-form";
import {
  createFixtureProject,
  createFixtureSiteVisitForm,
  createFixtureUploadedPhoto,
} from "@/test/fixtures";

describe("applySiteVisitFormToProject", () => {
  it("saves structured site visit details back onto the project", () => {
    const project = createFixtureProject();
    const form = createFixtureSiteVisitForm();
    const updatedProject = applySiteVisitFormToProject({
      form,
      now: new Date(2026, 4, 2, 12, 0, 0),
      project,
      uploadedPhotos: [createFixtureUploadedPhoto()],
    });

    expect(updatedProject.stage).toBe("Quote preparation");
    expect(updatedProject.budgetRange).toBe("AUD $18,000 - $24,000");
    expect(updatedProject.notes).toBe(
      "Client wants a neater arrival and less pooling after rain.",
    );
    expect(updatedProject.tags).toEqual(["Front entry", "side path"]);
    expect(updatedProject.goals).toEqual([
      "Improve drainage",
      "Refresh the front entry",
    ]);
    expect(updatedProject.deliverables).toEqual([
      "Drainage improvement",
      "Re-edge garden beds",
    ]);
    expect(updatedProject.timeline[0]?.label).toBe("Site visit saved");
    expect(updatedProject.siteVisit.scheduledFor).toBe("2 May 2026");
    expect(updatedProject.siteVisit.constraints).toEqual([
      "Narrow side gate access",
      "Small dog uses the lawn daily",
      "Broken edging and poor runoff",
    ]);
    expect(updatedProject.siteVisit.observations).toEqual([
      { label: "Drainage", value: "Pooling near driveway edge" },
      { label: "Slope", value: "Gentle fall toward the street" },
      { label: "Sun / Shade", value: "Morning sun, afternoon shade" },
      { label: "Soil / Lawn", value: "Compacted lawn with patchy growth" },
    ]);
    expect(updatedProject.siteVisit.photos).toHaveLength(1);
    expect(updatedProject.siteVisit.photos[0]?.photoType).toBe("Drainage");
    expect(updatedProject.recentSiteVisits[0]?.title).toBe(
      "Quote preparation site visit",
    );
  });
});
