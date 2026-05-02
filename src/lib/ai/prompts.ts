import { getProductConfig } from "@/data/productTypes";
import type { GenerateReportInput } from "@/lib/ai/types";

export const REPORT_SYSTEM_PROMPT = [
  "You are a professional assistant for Australian landscaping professionals.",
  "Turn rough site visit notes into clear, client-ready reports.",
  "Be concise, practical, and careful.",
  "Do not invent facts.",
  'If information is missing, write "To be confirmed".',
  "Do not provide legal advice.",
  "Do not provide structural engineering advice.",
  "Do not provide plumbing advice.",
  "Do not provide electrical advice.",
  "Do not provide compliance certification.",
  "Do not provide exact pricing unless the user provided numbers.",
  "Use cautious wording.",
  "Return structured markdown.",
].join(" ");

function normalizeText(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

export function getPhotoDescriptions(input: GenerateReportInput) {
  const explicitDescriptions = (input.photoDescriptions ?? [])
    .map((description) => normalizeText(description))
    .filter((description): description is string => Boolean(description));

  if (explicitDescriptions.length > 0) {
    return explicitDescriptions;
  }

  return input.siteVisit.photos
    .map((photo) => {
      const parts = [
        normalizeText(photo.photoType),
        normalizeText(photo.caption),
        normalizeText(photo.fileName),
      ].filter((part): part is string => Boolean(part));

      if (parts.length === 0) {
        return normalizeText(photo.label);
      }

      return parts.join(": ");
    })
    .filter((description): description is string => Boolean(description))
    .filter((description) => description !== "Photo upload placeholder");
}

export function buildReportPrompt(
  input: GenerateReportInput,
  referenceMarkdown: string,
) {
  const productConfig = getProductConfig(input.productType);
  const photoDescriptions = getPhotoDescriptions(input);

  const promptPayload = {
    product: productConfig
      ? {
          product_type: productConfig.product_type,
          product_name: productConfig.product_name,
          target_user: productConfig.target_user,
          enabled: productConfig.enabled,
          report_types: productConfig.report_types,
        }
      : {
          product_type: input.productType,
        },
    report_request: {
      report_type: input.reportType,
      tone: input.tone,
    },
    project: {
      id: input.project.id,
      name: input.project.name,
      clientNickname: input.project.clientNickname,
      location: input.project.location,
      siteType: input.project.siteType,
      summary: input.project.summary,
      notes: input.project.notes,
      stage: input.project.stage,
      budgetRange: input.project.budgetRange,
      goals: input.project.goals,
      deliverables: input.project.deliverables,
      tags: input.project.tags,
    },
    siteVisit: input.siteVisit,
    photoDescriptions:
      photoDescriptions.length > 0 ? photoDescriptions : ["To be confirmed"],
  };

  return [
    "Create a client-ready report in structured markdown only.",
    "Use Australian English.",
    "Begin with one H1 title.",
    "Use H2 sections and bullet points where practical.",
    'If any information is missing, write "To be confirmed".',
    "Stay strictly within the supplied facts.",
    "",
    "Reference local template structure:",
    referenceMarkdown,
    "",
    "Structured project and site visit data JSON:",
    JSON.stringify(promptPayload, null, 2),
  ].join("\n");
}
