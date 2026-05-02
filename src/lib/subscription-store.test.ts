import { describe, expect, it } from "vitest";

import { createProjectFromInput, writeLocalProjects } from "@/lib/project-store";
import {
  canCreateProject,
  canGenerateReport,
  createDefaultSubscriptionState,
  getSubscriptionPlanDefinition,
  writeSubscriptionState,
} from "@/lib/subscription-store";
import { createFixtureProject } from "@/test/fixtures";

describe("subscription limits", () => {
  it("enforces the free plan project limit at two projects", () => {
    writeLocalProjects([
      createFixtureProject(),
      createProjectFromInput({
        name: "Second project",
        clientNickname: "Client two",
        siteType: "Front yard",
        stage: "First visit",
        area: "Lane Cove, NSW",
        notes: "",
      }),
    ]);

    const usage = canCreateProject(getSubscriptionPlanDefinition("free"));

    expect(usage.allowed).toBe(false);
    expect(usage.current).toBe(2);
    expect(usage.limit).toBe(2);
    expect(usage.remaining).toBe(0);
  });

  it("enforces the free plan report limit at five reports per month", () => {
    writeSubscriptionState({
      ...createDefaultSubscriptionState(),
      reports_generated_this_month: 5,
    });

    const usage = canGenerateReport(getSubscriptionPlanDefinition("free"));

    expect(usage.allowed).toBe(false);
    expect(usage.current).toBe(5);
    expect(usage.limit).toBe(5);
    expect(usage.remaining).toBe(0);
  });

  it("keeps watermarking enabled for the free plan", () => {
    const freePlan = getSubscriptionPlanDefinition("free");
    const soloPlan = getSubscriptionPlanDefinition("solo");

    expect(freePlan.watermark_enabled).toBe(true);
    expect(soloPlan.watermark_enabled).toBe(false);
  });
});
