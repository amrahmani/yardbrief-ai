import { describe, expect, it } from "vitest";

import { generateYardBriefTemplate } from "@/data/yardbriefTemplates";
import { applySiteVisitFormToProject } from "@/lib/site-visit-form";
import {
  createFixtureProject,
  createFixtureSiteVisitForm,
  createFixtureUploadedPhoto,
  createMinimalProject,
} from "@/test/fixtures";

describe("yardbrief templates", () => {
  it("generates structured markdown for a YardBrief report", () => {
    const project = applySiteVisitFormToProject({
      form: createFixtureSiteVisitForm(),
      now: new Date(2026, 4, 2, 12, 0, 0),
      project: createFixtureProject(),
      uploadedPhotos: [createFixtureUploadedPhoto()],
    });

    const markdown = generateYardBriefTemplate("scope_of_work", {
      project,
      siteVisit: project.siteVisit,
      tone: "Professional",
    });

    expect(markdown).toContain("# Scope of Work");
    expect(markdown).toContain("## Included Work");
    expect(markdown).toContain("- Drainage improvement");
    expect(markdown).toContain("## Site Preparation And Confirmation Items");
  });

  it('uses "To be confirmed" when required details are missing', () => {
    const project = createMinimalProject();
    const markdown = generateYardBriefTemplate("client_brief", {
      project,
      siteVisit: project.siteVisit,
      tone: "Professional",
    });

    expect(markdown).toContain("To be confirmed");
    expect(markdown).not.toContain("Area withheld");
    expect(markdown).not.toContain("No notes added yet.");
  });
});
