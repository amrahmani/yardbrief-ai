import { generateGeminiReport } from "@/lib/ai/geminiProvider";
import { generateOpenAIReport } from "@/lib/ai/openaiProvider";
import { generateTemplateReport } from "@/lib/ai/templateProvider";
import type {
  AIProvider,
  GenerateReportInput,
  GenerateReportResult,
} from "@/lib/ai/types";

export type { AIProvider, GenerateReportInput, GenerateReportResult } from "@/lib/ai/types";

function isAIProvider(value: string): value is AIProvider {
  return value === "gemini" || value === "openai" || value === "template";
}

export function resolveAIProvider(value = process.env.AI_PROVIDER): AIProvider {
  const normalized = value?.trim().toLowerCase() ?? "";
  return isAIProvider(normalized) ? normalized : "gemini";
}

function toSafeErrorMessage(provider: Exclude<AIProvider, "template">, error: unknown) {
  const detail =
    error instanceof Error && error.message
      ? error.message
      : `${provider} report generation failed.`;

  if (provider === "gemini") {
    return `Gemini generation failed: ${detail}`;
  }

  return `OpenAI generation failed: ${detail}`;
}

export async function generateReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  const selectedProvider = resolveAIProvider();

  if (selectedProvider === "template") {
    return generateTemplateReport(input);
  }

  try {
    if (selectedProvider === "gemini") {
      return await generateGeminiReport(input);
    }

    return await generateOpenAIReport(input);
  } catch (error) {
    const fallbackResult = await generateTemplateReport(input);

    return {
      ...fallbackResult,
      fallbackUsed: true,
      errorMessage: toSafeErrorMessage(selectedProvider, error),
    };
  }
}
