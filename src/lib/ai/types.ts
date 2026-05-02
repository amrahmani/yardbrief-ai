import type { ProductType, Project, ReportTone, SiteVisit } from "@/types/yardbrief";

export type AIProvider = "gemini" | "openai" | "template";

export interface GenerateReportInput {
  reportType: string;
  project: Project;
  siteVisit: SiteVisit;
  tone: ReportTone;
  productType: ProductType;
  photoDescriptions?: string[];
}

export interface GenerateReportResult {
  contentMarkdown: string;
  providerUsed: AIProvider;
  modelUsed: string;
  fallbackUsed: boolean;
  errorMessage?: string;
}
