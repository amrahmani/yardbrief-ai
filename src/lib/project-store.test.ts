import { describe, expect, it, vi } from "vitest";

import { createProjectFromInput } from "@/lib/project-store";

describe("createProjectFromInput", () => {
  it("creates a new project with the expected YardBrief defaults", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 2, 12, 0, 0));

    const project = createProjectFromInput({
      name: "Willow Lane Refresh",
      clientNickname: "Willow client",
      siteType: "Residential garden",
      stage: "First visit",
      area: "Willoughby, NSW",
      notes: "Refresh the lawn, drainage, and front entry planting.",
    });

    expect(project.id).toContain("willow-lane-refresh-");
    expect(project.name).toBe("Willow Lane Refresh");
    expect(project.clientNickname).toBe("Willow client");
    expect(project.location).toBe("Willoughby, NSW");
    expect(project.status).toBe("Awaiting site visit");
    expect(project.summary).toBe("Refresh the lawn, drainage, and front entry planting.");
    expect(project.tags).toEqual(["Willoughby, NSW"]);
    expect(project.reports).toEqual([]);
    expect(project.recentSiteVisits).toEqual([]);
    expect(project.siteVisit.form?.projectStage).toBe("First visit");
  });
});
