import { createReportFromTemplate } from "@/lib/report-templates";
import type { GenerateReportInput, GenerateReportResult } from "@/lib/ai/types";
import { ProductType } from "@/types/yardbrief";
import type { YardBriefTemplateLabel } from "@/data/yardbriefTemplates";

const YARDBRIEF_TEMPLATE_LABELS = new Set<YardBriefTemplateLabel>([
  "Client Brief",
  "Site Visit Report",
  "Scope of Work",
  "Quote-Ready Summary",
  "Change Request Note",
  "Before/After Report",
  "Aftercare Guide",
  "Client Approval Message",
]);

function isYardBriefTemplateLabel(value: string): value is YardBriefTemplateLabel {
  return YARDBRIEF_TEMPLATE_LABELS.has(value as YardBriefTemplateLabel);
}

function buildGenericTemplateMarkdown({
  project,
  reportType,
  siteVisit,
  tone,
}: GenerateReportInput) {
  return [
    `# ${reportType} - ${project.clientNickname || "To be confirmed"}`,
    `Prepared in a ${tone.toLowerCase()} tone using user-provided project and site visit notes only.`,
    "",
    "## Document Note",
    "- This draft is based only on user-provided information.",
    '- Any missing item should be treated as "To be confirmed".',
    "- This draft does not provide legal, engineering, structural, plumbing, electrical, or compliance advice.",
    "",
    "## Project Snapshot",
    `- Project name: ${project.name || "To be confirmed"}`,
    `- Client nickname: ${project.clientNickname || "To be confirmed"}`,
    `- Site type: ${project.siteType || "To be confirmed"}`,
    `- Project stage: ${project.stage || "To be confirmed"}`,
    `- Suburb / area: ${project.location || "To be confirmed"}`,
    `- Visit date: ${siteVisit.form?.visitDate || siteVisit.scheduledFor || "To be confirmed"}`,
    "",
    "## Source Notes",
    project.notes || siteVisit.form?.roughNote || "To be confirmed",
  ].join("\n");
}

export function buildTemplateMarkdown(input: GenerateReportInput): string {
  if (
    input.productType === ProductType.YardBrief &&
    isYardBriefTemplateLabel(input.reportType)
  ) {
    return (
      createReportFromTemplate({
        project: {
          ...input.project,
          siteVisit: input.siteVisit,
        },
        reportType: input.reportType,
        tone: input.tone,
      }).markdown ?? buildGenericTemplateMarkdown(input)
    );
  }

  return buildGenericTemplateMarkdown(input);
}

export async function generateTemplateReport(
  input: GenerateReportInput,
): Promise<GenerateReportResult> {
  return {
    contentMarkdown: buildTemplateMarkdown(input),
    providerUsed: "template",
    modelUsed: "local-template",
    fallbackUsed: false,
  };
}
