import { describe, expect, it, vi } from "vitest";

const { generateContentMock, googleGenAIMock } = vi.hoisted(() => {
  const generateContent = vi.fn();
  const googleGenAI = vi.fn(function GoogleGenAI() {
    return {
      models: {
        generateContent,
      },
    };
  });

  return {
    generateContentMock: generateContent,
    googleGenAIMock: googleGenAI,
  };
});

vi.mock("@google/genai", () => ({
  GoogleGenAI: googleGenAIMock,
}));

import { generateGeminiReport } from "@/lib/ai/geminiProvider";
import { ProductType } from "@/types/yardbrief";
import { applySiteVisitFormToProject } from "@/lib/site-visit-form";
import {
  createFixtureProject,
  createFixtureSiteVisitForm,
  createFixtureUploadedPhoto,
} from "@/test/fixtures";

function createInput() {
  const project = applySiteVisitFormToProject({
    form: createFixtureSiteVisitForm(),
    now: new Date(2026, 4, 2, 12, 0, 0),
    project: createFixtureProject(),
    uploadedPhotos: [createFixtureUploadedPhoto()],
  });

  return {
    reportType: "Client Brief",
    project,
    siteVisit: project.siteVisit,
    tone: "Professional" as const,
    productType: ProductType.YardBrief,
    photoDescriptions: ["Drainage: Pooling at the driveway edge"],
  };
}

describe("generateGeminiReport", () => {
  it("uses GEMINI_API_KEY and GEMINI_MODEL", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.GEMINI_MODEL = "gemini-2.5-flash";
    generateContentMock.mockResolvedValue({
      text: "# Client Brief\n\nGemini draft",
    });

    const result = await generateGeminiReport(createInput());

    expect(googleGenAIMock).toHaveBeenCalledWith({
      apiKey: "test-gemini-key",
    });
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
        contents: expect.stringContaining("Client Brief"),
      }),
    );
    expect(result.providerUsed).toBe("gemini");
    expect(result.modelUsed).toBe("gemini-2.5-flash");
    expect(result.fallbackUsed).toBe(false);
    expect(result.contentMarkdown).toContain("Gemini draft");
  });
});
