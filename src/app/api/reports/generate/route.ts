import { NextResponse } from "next/server";

import { generateReport, resolveAIProvider } from "@/lib/ai/generateReport";
import { ProductType } from "@/types/yardbrief";
import type { Project, ReportTone, SiteVisit } from "@/types/yardbrief";

export const dynamic = "force-dynamic";

function isValidProductType(value: unknown): value is ProductType {
  return Object.values(ProductType).includes(value as ProductType);
}

function isValidTone(value: unknown): value is ReportTone {
  return (
    value === "Professional" ||
    value === "Friendly" ||
    value === "Concise" ||
    value === "Detailed"
  );
}

interface GenerateReportRequestBody {
  productType: ProductType;
  project: Project;
  reportType: string;
  siteVisit: SiteVisit;
  tone: ReportTone;
  photoDescriptions?: string[];
}

function isValidPhotoDescriptions(value: unknown): value is string[] {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GenerateReportRequestBody>;
    const aiProvider = process.env.AI_PROVIDER ?? "";
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
    const selectedProvider = resolveAIProvider(aiProvider);

    if (
      typeof body.reportType !== "string" ||
      !body.project ||
      !body.siteVisit ||
      !isValidTone(body.tone) ||
      !isValidProductType(body.productType) ||
      !isValidPhotoDescriptions(body.photoDescriptions)
    ) {
      return NextResponse.json(
        { error: "Invalid report generation payload." },
        { status: 400 },
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[reports/generate] request", {
        aiProvider,
        hasGeminiKey,
        selectedProvider,
      });
    }

    const result = await generateReport({
      productType: body.productType,
      project: body.project,
      reportType: body.reportType,
      siteVisit: body.siteVisit,
      tone: body.tone,
      photoDescriptions: body.photoDescriptions,
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("[reports/generate] result", {
        providerUsed: result.providerUsed,
        modelUsed: result.modelUsed,
        fallbackUsed: result.fallbackUsed,
        errorMessage: result.errorMessage ?? null,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate the report right now.";

    if (process.env.NODE_ENV !== "production") {
      console.error("[reports/generate] error", {
        aiProvider: process.env.AI_PROVIDER ?? "",
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        selectedProvider: resolveAIProvider(),
        providerUsed: null,
        modelUsed: null,
        fallbackUsed: false,
        errorMessage: message,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
