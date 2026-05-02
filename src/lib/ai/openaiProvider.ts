import OpenAI from "openai";

import { buildReportPrompt, REPORT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildTemplateMarkdown } from "@/lib/ai/templateProvider";
import type { GenerateReportInput, GenerateReportResult } from "@/lib/ai/types";

const DEFAULT_OPENAI_MODEL = "gpt-5.2";

export async function generateOpenAIReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model,
    instructions: REPORT_SYSTEM_PROMPT,
    input: buildReportPrompt(input, buildTemplateMarkdown(input)),
    max_output_tokens: 1800,
    store: false,
    temperature: 0.2,
  });

  const text = response.output_text?.trim() || "";

  if (!text) {
    throw new Error("OpenAI returned an empty report draft.");
  }

  return {
    contentMarkdown: text,
    providerUsed: "openai",
    modelUsed: model,
    fallbackUsed: false,
  };
}
