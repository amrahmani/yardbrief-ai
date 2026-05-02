import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/generateReport", () => ({
  generateReport: vi.fn(),
  resolveAIProvider: vi.fn(() => "gemini"),
}));

import { POST } from "@/app/api/reports/generate/route";
import { generateReport } from "@/lib/ai/generateReport";
import { ProductType } from "@/types/yardbrief";
import { applySiteVisitFormToProject } from "@/lib/site-visit-form";
import {
  createFixtureProject,
  createFixtureSiteVisitForm,
  createFixtureUploadedPhoto,
} from "@/test/fixtures";

const generateReportMock = vi.mocked(generateReport);

function createPayload() {
  const project = applySiteVisitFormToProject({
    form: createFixtureSiteVisitForm(),
    now: new Date(2026, 4, 2, 12, 0, 0),
    project: createFixtureProject(),
    uploadedPhotos: [createFixtureUploadedPhoto()],
  });

  return {
    productType: ProductType.YardBrief,
    reportType: "Client Brief",
    project,
    siteVisit: project.siteVisit,
    tone: "Professional" as const,
    photoDescriptions: ["Drainage: Pooling at the driveway edge"],
  };
}

describe("POST /api/reports/generate", () => {
  beforeEach(() => {
    generateReportMock.mockReset();
  });

  it("returns providerUsed and fallbackUsed in the response body", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    generateReportMock.mockResolvedValue({
      contentMarkdown: "# Client Brief\n\nGemini draft",
      providerUsed: "gemini",
      modelUsed: "gemini-2.5-flash",
      fallbackUsed: false,
    });

    const response = await POST(
      new Request("http://localhost:3000/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPayload()),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      providerUsed: "gemini",
      fallbackUsed: false,
      modelUsed: "gemini-2.5-flash",
    });
  });
});
