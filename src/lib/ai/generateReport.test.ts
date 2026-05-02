import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/geminiProvider", () => ({
  generateGeminiReport: vi.fn(),
}));

vi.mock("@/lib/ai/openaiProvider", () => ({
  generateOpenAIReport: vi.fn(),
}));

vi.mock("@/lib/ai/templateProvider", () => ({
  generateTemplateReport: vi.fn(),
}));

import { generateGeminiReport } from "@/lib/ai/geminiProvider";
import { generateOpenAIReport } from "@/lib/ai/openaiProvider";
import { generateTemplateReport } from "@/lib/ai/templateProvider";
import { generateReport, resolveAIProvider } from "@/lib/ai/generateReport";
import { ProductType } from "@/types/yardbrief";
import { applySiteVisitFormToProject } from "@/lib/site-visit-form";
import {
  createFixtureProject,
  createFixtureSiteVisitForm,
  createFixtureUploadedPhoto,
} from "@/test/fixtures";

const geminiProviderMock = vi.mocked(generateGeminiReport);
const openAIProviderMock = vi.mocked(generateOpenAIReport);
const templateProviderMock = vi.mocked(generateTemplateReport);

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
  };
}

describe("resolveAIProvider", () => {
  it("defaults to gemini when no provider is configured", () => {
    expect(resolveAIProvider(undefined)).toBe("gemini");
  });

  it("returns template when explicitly selected", () => {
    expect(resolveAIProvider("template")).toBe("template");
  });
});

describe("generateReport", () => {
  beforeEach(() => {
    geminiProviderMock.mockReset();
    openAIProviderMock.mockReset();
    templateProviderMock.mockReset();
  });

  it("uses Gemini when AI_PROVIDER=gemini", async () => {
    process.env.AI_PROVIDER = "gemini";
    geminiProviderMock.mockResolvedValue({
      contentMarkdown: "# Gemini draft",
      providerUsed: "gemini",
      modelUsed: "gemini-2.5-flash",
      fallbackUsed: false,
    });

    const result = await generateReport(createInput());

    expect(geminiProviderMock).toHaveBeenCalledTimes(1);
    expect(openAIProviderMock).not.toHaveBeenCalled();
    expect(templateProviderMock).not.toHaveBeenCalled();
    expect(result.providerUsed).toBe("gemini");
    expect(result.modelUsed).toBe("gemini-2.5-flash");
    expect(result.fallbackUsed).toBe(false);
  });

  it("can still use OpenAI when AI_PROVIDER=openai", async () => {
    process.env.AI_PROVIDER = "openai";
    openAIProviderMock.mockResolvedValue({
      contentMarkdown: "# OpenAI draft",
      providerUsed: "openai",
      modelUsed: "gpt-5.2",
      fallbackUsed: false,
    });

    const result = await generateReport(createInput());

    expect(openAIProviderMock).toHaveBeenCalledTimes(1);
    expect(geminiProviderMock).not.toHaveBeenCalled();
    expect(templateProviderMock).not.toHaveBeenCalled();
    expect(result.providerUsed).toBe("openai");
    expect(result.modelUsed).toBe("gpt-5.2");
    expect(result.fallbackUsed).toBe(false);
  });

  it("falls back to template when Gemini fails", async () => {
    process.env.AI_PROVIDER = "gemini";
    geminiProviderMock.mockRejectedValue(new Error("Gemini upstream timeout"));
    templateProviderMock.mockResolvedValue({
      contentMarkdown: "# Template draft",
      providerUsed: "template",
      modelUsed: "local-template",
      fallbackUsed: false,
    });

    const result = await generateReport(createInput());

    expect(geminiProviderMock).toHaveBeenCalledTimes(1);
    expect(templateProviderMock).toHaveBeenCalledTimes(1);
    expect(result.providerUsed).toBe("template");
    expect(result.fallbackUsed).toBe(true);
    expect(result.errorMessage).toContain("Gemini generation failed");
  });

  it("uses only the template provider when AI_PROVIDER=template", async () => {
    process.env.AI_PROVIDER = "template";
    templateProviderMock.mockResolvedValue({
      contentMarkdown: "# Template draft",
      providerUsed: "template",
      modelUsed: "local-template",
      fallbackUsed: false,
    });

    const result = await generateReport(createInput());

    expect(templateProviderMock).toHaveBeenCalledTimes(1);
    expect(geminiProviderMock).not.toHaveBeenCalled();
    expect(openAIProviderMock).not.toHaveBeenCalled();
    expect(result.providerUsed).toBe("template");
    expect(result.fallbackUsed).toBe(false);
  });
});
