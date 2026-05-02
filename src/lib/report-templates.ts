import {
  generateYardBriefTemplateFromLabel,
  type YardBriefTemplateLabel,
} from "@/data/yardbriefTemplates";
import type {
  Project,
  Report,
  ReportSection,
  ReportTone,
} from "@/types/yardbrief";

export const reportTypeCatalog = [
  {
    name: "Client Brief",
    summary: "Frames the project direction, client priorities, and the recommended next step.",
    output: "A client-ready brief that turns site notes into a clear design and delivery summary.",
  },
  {
    name: "Site Visit Report",
    summary: "Captures what was observed on site and what needs to happen next.",
    output: "A structured record of the visit, conditions, and actions.",
  },
  {
    name: "Scope of Work",
    summary: "Turns site observations into a clean description of included work and assumptions.",
    output: "A scope summary you can use before pricing or scheduling.",
  },
  {
    name: "Quote-Ready Summary",
    summary: "Condenses the job into the points needed before preparing a quote.",
    output: "A practical summary of work, exclusions, and items still to confirm.",
  },
  {
    name: "Change Request Note",
    summary: "Documents a requested change and the impact it has on scope or delivery.",
    output: "A clear note that helps confirm requested changes with the client.",
  },
  {
    name: "Before/After Report",
    summary: "Packages the site context and intended outcome into a simple progress story.",
    output: "A structured update showing the starting point and the expected result.",
  },
  {
    name: "Aftercare Guide",
    summary: "Summarises what the client should do after works are completed.",
    output: "An easy handover guide for care, monitoring, and follow-up.",
  },
  {
    name: "Client Approval Message",
    summary: "Creates a ready-to-send approval message based on the current project context.",
    output: "A concise approval request message with the key points already assembled.",
  },
] as const;

export const reportToneOptions: ReportTone[] = [
  "Professional",
  "Friendly",
  "Concise",
  "Detailed",
];

const toneProfiles: Record<
  ReportTone,
  {
    lead: string;
    detailLabel: string;
    close: string;
  }
> = {
  Professional: {
    lead: "This report provides a clear, professional summary of the project.",
    detailLabel: "Clear and structured",
    close: "Please review the points below and confirm the preferred next step.",
  },
  Friendly: {
    lead: "Here is a friendly summary of the project and the latest site information.",
    detailLabel: "Warm and approachable",
    close: "When you are ready, we can confirm the next step together.",
  },
  Concise: {
    lead: "This report keeps the project summary short and to the point.",
    detailLabel: "Short and direct",
    close: "Please confirm the next step if this direction looks right.",
  },
  Detailed: {
    lead: "This report records the project in more detail so the client and team have fuller context.",
    detailLabel: "Expanded and thorough",
    close: "Please review the detail below so the next stage can be confirmed with confidence.",
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function splitEntries(value: string | undefined) {
  return (value ?? "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nonEmpty(value: string | undefined, fallback: string) {
  const clean = value?.trim();
  return clean ? clean : fallback;
}

function getForm(project: Project) {
  return project.siteVisit.form;
}

function getGoals(project: Project) {
  const formGoals = splitEntries(getForm(project)?.clientRequirements.mainClientGoals);
  return formGoals.length > 0 ? formGoals : project.goals;
}

function getPriorityAreas(project: Project) {
  const formAreas = splitEntries(getForm(project)?.clientRequirements.priorityAreas);
  return formAreas.length > 0 ? formAreas : project.tags;
}

function getRequiredWork(project: Project) {
  const formWork = splitEntries(getForm(project)?.workNotes.requiredWork);
  return formWork.length > 0 ? formWork : project.deliverables;
}

function getSiteConstraints(project: Project) {
  return project.siteVisit.constraints.length > 0
    ? project.siteVisit.constraints
    : ["No major constraints recorded yet."];
}

function getRecentVisitSummary(project: Project) {
  return (
    project.recentSiteVisits[0]?.summary ||
    getForm(project)?.roughNote ||
    project.notes ||
    "No recent site visit summary has been recorded yet."
  );
}

function getStyle(project: Project) {
  return nonEmpty(
    getForm(project)?.clientRequirements.preferredOutdoorStyle,
    "A preferred outdoor style has not been confirmed yet.",
  );
}

function getBudget(project: Project) {
  return nonEmpty(
    getForm(project)?.clientRequirements.budgetRange,
    project.budgetRange,
  );
}

function getArea(project: Project) {
  return nonEmpty(project.location, "Area withheld");
}

function getMustKeep(project: Project) {
  return nonEmpty(
    getForm(project)?.clientRequirements.mustKeepItems,
    "No must-keep items recorded yet.",
  );
}

function getMustAvoid(project: Project) {
  return nonEmpty(
    getForm(project)?.clientRequirements.mustAvoidItems,
    "No must-avoid items recorded yet.",
  );
}

function getExistingIssues(project: Project) {
  return nonEmpty(
    getForm(project)?.siteConditions.existingIssues,
    "No major existing issues have been documented yet.",
  );
}

function getClientResponsibilities(project: Project) {
  return nonEmpty(
    getForm(project)?.workNotes.clientResponsibilities,
    "Client responsibilities are still to be confirmed.",
  );
}

function getMaterialsToConfirm(project: Project) {
  return nonEmpty(
    getForm(project)?.workNotes.materialsToBeConfirmed,
    "Materials are still to be confirmed.",
  );
}

function getExclusions(project: Project) {
  return nonEmpty(
    getForm(project)?.workNotes.exclusions,
    "No exclusions have been recorded yet.",
  );
}

function getSitePreparation(project: Project) {
  return nonEmpty(
    getForm(project)?.workNotes.sitePreparationNeeded,
    "Site preparation requirements are still to be confirmed.",
  );
}

function getToneSummary(tone: ReportTone) {
  return toneProfiles[tone];
}

function buildSections(
  project: Project,
  reportType: string,
  tone: ReportTone,
): ReportSection[] {
  const goals = getGoals(project);
  const priorityAreas = getPriorityAreas(project);
  const requiredWork = getRequiredWork(project);
  const constraints = getSiteConstraints(project);
  const toneProfile = getToneSummary(tone);

  switch (reportType) {
    case "Client Brief":
      return [
        {
          title: "Project context",
          body: `${toneProfile.lead} The current ${project.siteType.toLowerCase()} project for ${project.clientNickname} in ${getArea(project)} is at the ${project.stage.toLowerCase()} stage.`,
          bullets: [
            `Site type: ${project.siteType}`,
            `Area: ${getArea(project)}`,
            `Budget range: ${getBudget(project)}`,
          ],
        },
        {
          title: "Client priorities",
          body: `The brief should stay focused on the client's main goals and the areas that matter most first.`,
          bullets: goals.length > 0 ? goals : ["No client goals recorded yet."],
        },
        {
          title: "Design and delivery considerations",
          body: `The preferred outdoor direction is currently noted as: ${getStyle(project)}`,
          bullets: [
            `Priority areas: ${priorityAreas.join(", ") || "Not recorded yet."}`,
            `Must keep: ${getMustKeep(project)}`,
            `Must avoid: ${getMustAvoid(project)}`,
          ],
        },
      ];
    case "Site Visit Report":
      return [
        {
          title: "Visit overview",
          body: `${toneProfile.lead} This site visit report records the latest observations and client priorities gathered for the project.`,
          bullets: [
            `Visit date: ${project.siteVisit.form?.visitDate || project.siteVisit.scheduledFor}`,
            `Project stage: ${project.siteVisit.form?.projectStage || project.stage}`,
            `Lead: ${project.siteVisit.lead}`,
          ],
        },
        {
          title: "Observed site conditions",
          body: `The following notes reflect the main access, drainage, slope, and environmental observations currently recorded.`,
          bullets: [
            `Access: ${nonEmpty(project.siteVisit.form?.siteConditions.accessConstraints, "Not recorded yet.")}`,
            `Drainage: ${nonEmpty(project.siteVisit.form?.siteConditions.drainageNotes, "Not recorded yet.")}`,
            `Shade / sun: ${nonEmpty(project.siteVisit.form?.siteConditions.shadeSunNotes, "Not recorded yet.")}`,
            `Existing issues: ${getExistingIssues(project)}`,
          ],
        },
        {
          title: "Immediate actions",
          body: `The visit points toward the next actions listed below before the project moves further.`,
          bullets: requiredWork.length > 0 ? requiredWork : ["No required work recorded yet."],
        },
      ];
    case "Scope of Work":
      return [
        {
          title: "Scope summary",
          body: `${toneProfile.lead} This scope of work translates the project goals and site notes into a cleaner delivery outline.`,
          bullets: [
            `Project stage: ${project.stage}`,
            `Budget range: ${getBudget(project)}`,
            `Priority areas: ${priorityAreas.join(", ") || "Not recorded yet."}`,
          ],
        },
        {
          title: "Included work",
          body: `The following items are the current included work items based on the latest notes.`,
          bullets: requiredWork.length > 0 ? requiredWork : ["No included work recorded yet."],
        },
        {
          title: "Exclusions and assumptions",
          body: `Any items below should be confirmed before the scope is treated as final.`,
          bullets: [
            `Exclusions: ${getExclusions(project)}`,
            `Site preparation: ${getSitePreparation(project)}`,
            `Materials to confirm: ${getMaterialsToConfirm(project)}`,
          ],
        },
      ];
    case "Quote-Ready Summary":
      return [
        {
          title: "Quote summary",
          body: `${toneProfile.lead} This summary gathers the main inputs needed before a formal quote is prepared.`,
          bullets: [
            `Site type: ${project.siteType}`,
            `Budget range: ${getBudget(project)}`,
            `Current stage: ${project.stage}`,
          ],
        },
        {
          title: "Work items and constraints",
          body: `The quote should reflect the required work items while keeping the following site constraints in view.`,
          bullets: [...requiredWork.slice(0, 3), ...constraints.slice(0, 2)],
        },
        {
          title: "Items still to confirm",
          body: `A few points should still be confirmed before pricing is finalised.`,
          bullets: [
            `Materials: ${getMaterialsToConfirm(project)}`,
            `Client responsibilities: ${getClientResponsibilities(project)}`,
            `Exclusions: ${getExclusions(project)}`,
          ],
        },
      ];
    case "Change Request Note":
      return [
        {
          title: "Requested change",
          body: `${toneProfile.lead} This note captures a proposed or requested change based on the latest project notes.`,
          bullets: goals.length > 0 ? goals.slice(0, 3) : ["No specific change items recorded yet."],
        },
        {
          title: "Impact on scope",
          body: `Any requested change should be reviewed against the current scope, budget range, and site constraints.`,
          bullets: [
            `Budget context: ${getBudget(project)}`,
            `Current constraints: ${constraints.join(" / ")}`,
            `Related work items: ${requiredWork.join(", ") || "Not recorded yet."}`,
          ],
        },
        {
          title: "Confirmation required",
          body: `${toneProfile.close}`,
          bullets: [
            "Confirm the requested change in writing.",
            "Review any budget or timeline effect.",
            "Update the scope before proceeding.",
          ],
        },
      ];
    case "Before/After Report":
      return [
        {
          title: "Before condition",
          body: `${toneProfile.lead} The starting point for the project is summarised below.`,
          bullets: [
            `Project summary: ${project.summary}`,
            `Existing issues: ${getExistingIssues(project)}`,
            `Recent site visit: ${getRecentVisitSummary(project)}`,
          ],
        },
        {
          title: "Proposed or completed changes",
          body: `The work below represents the main shifts from the starting condition toward the intended result.`,
          bullets: requiredWork.length > 0 ? requiredWork : ["No work items recorded yet."],
        },
        {
          title: "After outcome",
          body: `The intended after-state should reflect the client's priorities while improving the site's function and presentation.`,
          bullets: goals.length > 0 ? goals : ["No after-state priorities recorded yet."],
        },
      ];
    case "Aftercare Guide":
      return [
        {
          title: "What was addressed",
          body: `${toneProfile.lead} This guide summarises the work completed or planned and the care required after handover.`,
          bullets: requiredWork.length > 0 ? requiredWork : ["No work items recorded yet."],
        },
        {
          title: "Client care actions",
          body: `The client should follow the points below to help the site establish well after the works.`,
          bullets: [
            `Client responsibilities: ${getClientResponsibilities(project)}`,
            "Monitor any newly planted or newly finished areas closely.",
            "Raise concerns early if any site issue reappears.",
          ],
        },
        {
          title: "Follow-up watchpoints",
          body: `The following issues are worth monitoring after the main works are complete.`,
          bullets: constraints.length > 0 ? constraints : ["No follow-up watchpoints recorded yet."],
        },
      ];
    case "Client Approval Message":
      return [
        {
          title: "Suggested message",
          body: `${toneProfile.lead} Hi ${project.clientNickname}, here is the current direction for your ${project.siteType.toLowerCase()} project in ${getArea(project)}. The proposed next step is to move ahead with the items outlined below. ${toneProfile.close}`,
          bullets: requiredWork.slice(0, 3).length > 0 ? requiredWork.slice(0, 3) : ["No scoped items recorded yet."],
        },
        {
          title: "Approval points",
          body: `These are the main points the client should be confirming.`,
          bullets: [
            `Main goals: ${goals.join(", ") || "Not recorded yet."}`,
            `Priority areas: ${priorityAreas.join(", ") || "Not recorded yet."}`,
            `Budget range: ${getBudget(project)}`,
          ],
        },
      ];
    default:
      return [
        {
          title: "Project context",
          body: `${toneProfile.lead} This report has been generated from the current local project details.`,
          bullets: [
            `Project: ${project.name}`,
            `Client: ${project.clientNickname}`,
            `Site type: ${project.siteType}`,
          ],
        },
      ];
  }
}

function buildHighlights(project: Project, reportType: string) {
  const goals = getGoals(project);
  const requiredWork = getRequiredWork(project);
  const constraints = getSiteConstraints(project);

  switch (reportType) {
    case "Client Approval Message":
      return [
        `Summarises the current direction for ${project.clientNickname}.`,
        `Pulls in the top priorities for the ${project.siteType.toLowerCase()} project.`,
        "Keeps the approval request ready to send.",
      ];
    case "Aftercare Guide":
      return [
        "Turns the recorded work items into a care-focused handover.",
        "Flags follow-up watchpoints from the site notes.",
        "Keeps the client actions practical and easy to scan.",
      ];
    default:
      return [
        goals[0] || `Summarises the current ${project.siteType.toLowerCase()} project direction.`,
        requiredWork[0] || "Captures the main work items already recorded.",
        constraints[0] || "Keeps the current site constraints visible.",
      ];
  }
}

function buildNextSteps(reportType: string, tone: ReportTone) {
  const toneProfile = getToneSummary(tone);

  switch (reportType) {
    case "Quote-Ready Summary":
      return [
        "Confirm any exclusions or material decisions before pricing.",
        "Review the summary internally and convert it into a quote draft.",
        toneProfile.close,
      ];
    case "Client Approval Message":
      return [
        "Review the message wording once before sending.",
        "Send the approval request to the client.",
        "Record the response against the project timeline.",
      ];
    default:
      return [
        "Review the generated report and make any manual edits needed.",
        "Use it as the basis for the next client-facing action.",
        toneProfile.close,
      ];
  }
}

function chooseAudience(reportType: string) {
  if (reportType === "Quote-Ready Summary") {
    return "Internal";
  }

  if (reportType === "Site Visit Report") {
    return "Project team";
  }

  return "Client";
}

function buildSummary(project: Project, reportType: string, tone: ReportTone) {
  const toneProfile = getToneSummary(tone);

  return `${toneProfile.lead} This ${reportType.toLowerCase()} is based on the current project summary, site visit inputs, and locally saved notes for ${project.clientNickname}.`;
}

export function createReportFromTemplate({
  project,
  reportType,
  tone,
}: {
  project: Project;
  reportType: YardBriefTemplateLabel;
  tone: ReportTone;
}): Report {
  const now = new Date();
  const createdAt = formatDate(now);
  const sections = buildSections(project, reportType, tone);
  const highlights = buildHighlights(project, reportType);
  const nextSteps = buildNextSteps(reportType, tone);
  const title = `${reportType} - ${project.clientNickname}`;
  const markdown = generateYardBriefTemplateFromLabel(reportType, {
    project,
    siteVisit: project.siteVisit,
    tone,
  });

  return {
    id: `${slugify(reportType)}-${Date.now().toString(36)}`,
    title,
    type: reportType,
    tone,
    markdown,
    status: "Ready to send",
    createdAt,
    updatedAt: createdAt,
    audience: chooseAudience(reportType),
    summary: buildSummary(project, reportType, tone),
    highlights,
    sections,
    nextSteps,
  };
}
