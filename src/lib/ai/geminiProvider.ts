import { GoogleGenAI } from "@google/genai";

import { buildReportPrompt, REPORT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildTemplateMarkdown } from "@/lib/ai/templateProvider";
import type { GenerateReportInput, GenerateReportResult } from "@/lib/ai/types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export async function generateGeminiReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: [
      REPORT_SYSTEM_PROMPT,
      "",
      buildReportPrompt(input, buildTemplateMarkdown(input)),
    ].join("\n"),
  });

  const text = response.text?.trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty report draft.");
  }

  return {
    contentMarkdown: text,
    providerUsed: "gemini",
    modelUsed: model,
    fallbackUsed: false,
  };
}
