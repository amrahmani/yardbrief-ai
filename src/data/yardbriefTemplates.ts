import type { Project, ReportTone, SiteVisit } from "@/types/yardbrief";

export type YardBriefTemplateKey =
  | "client_brief"
  | "site_visit_report"
  | "scope_of_work"
  | "quote_ready_summary"
  | "change_request_note"
  | "before_after_report"
  | "aftercare_guide"
  | "client_approval_message";

export type YardBriefTemplateLabel =
  | "Client Brief"
  | "Site Visit Report"
  | "Scope of Work"
  | "Quote-Ready Summary"
  | "Change Request Note"
  | "Before/After Report"
  | "Aftercare Guide"
  | "Client Approval Message";

export interface YardBriefTemplateInput {
  project: Project;
  siteVisit: SiteVisit;
  tone: ReportTone;
}

interface YardBriefTemplateDefinition {
  key: YardBriefTemplateKey;
  label: YardBriefTemplateLabel;
  summary: string;
  output: string;
}

type YardBriefTemplateGenerator = (input: YardBriefTemplateInput) => string;

const toneIntroductions: Record<ReportTone, string> = {
  Professional:
    "Prepared in a professional format for landscaping documentation using user-provided project and site visit notes.",
  Friendly:
    "Prepared in a clear and approachable format for landscaping communication using user-provided project and site visit notes.",
  Concise:
    "Prepared in a concise format for quick landscaping review using user-provided project and site visit notes.",
  Detailed:
    "Prepared in a detailed format for fuller landscaping review using user-provided project and site visit notes.",
};

const knownMissingValues = new Set([
  "",
  "area withheld",
  "no notes added yet",
  "no notes added yet.",
  "not scheduled",
  "not scheduled yet",
  "not set",
  "to be assigned",
  "to be confirmed",
]);

const templateLabelByKey: Record<YardBriefTemplateKey, YardBriefTemplateLabel> = {
  client_brief: "Client Brief",
  site_visit_report: "Site Visit Report",
  scope_of_work: "Scope of Work",
  quote_ready_summary: "Quote-Ready Summary",
  change_request_note: "Change Request Note",
  before_after_report: "Before/After Report",
  aftercare_guide: "Aftercare Guide",
  client_approval_message: "Client Approval Message",
};

const templateKeyByLabel: Record<YardBriefTemplateLabel, YardBriefTemplateKey> = {
  "Client Brief": "client_brief",
  "Site Visit Report": "site_visit_report",
  "Scope of Work": "scope_of_work",
  "Quote-Ready Summary": "quote_ready_summary",
  "Change Request Note": "change_request_note",
  "Before/After Report": "before_after_report",
  "Aftercare Guide": "aftercare_guide",
  "Client Approval Message": "client_approval_message",
};

export const yardbriefTemplateCatalog = [
  {
    key: "client_brief",
    label: "Client Brief",
    summary:
      "Frames the project direction, client priorities, and the recommended next step.",
    output:
      "A client-ready brief that turns site notes into a clear design and delivery summary.",
  },
  {
    key: "site_visit_report",
    label: "Site Visit Report",
    summary: "Captures what was observed on site and what needs to happen next.",
    output: "A structured record of the visit, conditions, and actions.",
  },
  {
    key: "scope_of_work",
    label: "Scope of Work",
    summary:
      "Turns site observations into a clean description of included work and assumptions.",
    output: "A scope summary you can use before pricing or scheduling.",
  },
  {
    key: "quote_ready_summary",
    label: "Quote-Ready Summary",
    summary: "Condenses the job into the points needed before preparing a quote.",
    output: "A practical summary of work, exclusions, and items still to confirm.",
  },
  {
    key: "change_request_note",
    label: "Change Request Note",
    summary:
      "Documents a requested change and the impact it has on scope or delivery.",
    output: "A clear note that helps confirm requested changes with the client.",
  },
  {
    key: "before_after_report",
    label: "Before/After Report",
    summary:
      "Packages the site context and intended outcome into a simple progress story.",
    output: "A structured update showing the starting point and the expected result.",
  },
  {
    key: "aftercare_guide",
    label: "Aftercare Guide",
    summary: "Summarises what the client should do after works are completed.",
    output: "An easy handover guide for care, monitoring, and follow-up.",
  },
  {
    key: "client_approval_message",
    label: "Client Approval Message",
    summary:
      "Creates a ready-to-send approval message based on the current project context.",
    output: "A concise approval request message with the key points already assembled.",
  },
] as const satisfies readonly YardBriefTemplateDefinition[];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return undefined;
  }

  return knownMissingValues.has(normalized.toLowerCase()) ? undefined : normalized;
}

function valueOrToBeConfirmed(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const cleaned = cleanValue(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return "To be confirmed";
}

function splitUserEntries(value?: string | string[] | null) {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanValue(item))
      .filter((item): item is string => Boolean(item));
  }

  const cleaned = cleanValue(value);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\n|,/)
    .map((item) => cleanValue(item))
    .filter((item): item is string => Boolean(item));
}

function uniqueItems(items: string[]) {
  return [...new Set(items)];
}

function listOrToBeConfirmed(
  ...values: Array<string | string[] | undefined | null>
) {
  const items = uniqueItems(values.flatMap((value) => splitUserEntries(value)));
  return items.length > 0 ? items : ["To be confirmed"];
}

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function keyValueList(rows: Array<[string, string]>) {
  return rows.map(([label, value]) => `- ${label}: ${value}`).join("\n");
}

function section(title: string, ...blocks: Array<string | undefined>) {
  return [`## ${title}`, ...blocks.filter(Boolean)].join("\n\n");
}

function header(title: string, tone: ReportTone) {
  return [`# ${title}`, toneIntroductions[tone]].join("\n\n");
}

function documentNote() {
  return section(
    "Document Note",
    bulletList([
      "This draft is based only on user-provided project notes and site visit notes.",
      'Any item shown as "To be confirmed" still requires user confirmation.',
      "No exact pricing has been added unless a pricing reference was already provided by the user.",
      "This draft does not provide legal, engineering, structural, plumbing, electrical, or compliance advice.",
    ]),
  );
}

function formData(siteVisit: SiteVisit) {
  return siteVisit.form;
}

function projectSnapshot(project: Project, siteVisit: SiteVisit) {
  const form = formData(siteVisit);

  return section(
    "Project Snapshot",
    keyValueList([
      ["Project name", valueOrToBeConfirmed(project.name)],
      ["Client nickname", valueOrToBeConfirmed(project.clientNickname, project.clientName)],
      ["Site type", valueOrToBeConfirmed(project.siteType)],
      ["Project stage", valueOrToBeConfirmed(form?.projectStage, project.stage)],
      ["Suburb / area", valueOrToBeConfirmed(project.location)],
      ["Visit date", valueOrToBeConfirmed(form?.visitDate, siteVisit.scheduledFor)],
    ]),
  );
}

function visitPeople(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(
    siteVisit.attendees.length > 0 ? siteVisit.attendees : undefined,
  );
}

function observations(siteVisit: SiteVisit) {
  const items = siteVisit.observations
    .map((item) => {
      const value = cleanValue(item.value);
      return value ? `${item.label}: ${value}` : undefined;
    })
    .filter((item): item is string => Boolean(item));

  return items.length > 0 ? items : ["To be confirmed"];
}

function clientGoals(project: Project, siteVisit: SiteVisit) {
  return listOrToBeConfirmed(
    formData(siteVisit)?.clientRequirements.mainClientGoals,
    project.goals,
  );
}

function preferredStyle(project: Project, siteVisit: SiteVisit) {
  return valueOrToBeConfirmed(
    formData(siteVisit)?.clientRequirements.preferredOutdoorStyle,
  );
}

function budgetReference(project: Project, siteVisit: SiteVisit) {
  return valueOrToBeConfirmed(
    formData(siteVisit)?.clientRequirements.budgetRange,
    project.budgetRange,
  );
}

function priorityAreas(project: Project, siteVisit: SiteVisit) {
  return listOrToBeConfirmed(
    formData(siteVisit)?.clientRequirements.priorityAreas,
    project.tags,
  );
}

function mustKeep(project: Project, siteVisit: SiteVisit) {
  return listOrToBeConfirmed(formData(siteVisit)?.clientRequirements.mustKeepItems);
}

function mustAvoid(project: Project, siteVisit: SiteVisit) {
  return listOrToBeConfirmed(formData(siteVisit)?.clientRequirements.mustAvoidItems);
}

function siteConstraints(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(siteVisit.constraints);
}

function opportunities(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(siteVisit.opportunities);
}

function requiredWork(project: Project, siteVisit: SiteVisit) {
  return listOrToBeConfirmed(
    formData(siteVisit)?.workNotes.requiredWork,
    project.deliverables,
  );
}

function exclusions(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(formData(siteVisit)?.workNotes.exclusions);
}

function materialsToBeConfirmed(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(formData(siteVisit)?.workNotes.materialsToBeConfirmed);
}

function clientResponsibilities(siteVisit: SiteVisit) {
  return listOrToBeConfirmed(formData(siteVisit)?.workNotes.clientResponsibilities);
}

function sitePreparation(siteVisit: SiteVisit) {
  return valueOrToBeConfirmed(formData(siteVisit)?.workNotes.sitePreparationNeeded);
}

function roughNote(project: Project, siteVisit: SiteVisit) {
  return valueOrToBeConfirmed(formData(siteVisit)?.roughNote, project.notes);
}

function siteConditionRows(siteVisit: SiteVisit) {
  const form = formData(siteVisit);

  return keyValueList([
    [
      "Access constraints",
      valueOrToBeConfirmed(form?.siteConditions.accessConstraints),
    ],
    ["Drainage notes", valueOrToBeConfirmed(form?.siteConditions.drainageNotes)],
    ["Slope notes", valueOrToBeConfirmed(form?.siteConditions.slopeNotes)],
    ["Shade / sun notes", valueOrToBeConfirmed(form?.siteConditions.shadeSunNotes)],
    [
      "Soil / lawn condition notes",
      valueOrToBeConfirmed(form?.siteConditions.soilLawnConditionNotes),
    ],
    [
      "Pets / children considerations",
      valueOrToBeConfirmed(form?.siteConditions.petsChildrenConsiderations),
    ],
    ["Existing issues", valueOrToBeConfirmed(form?.siteConditions.existingIssues)],
  ]);
}

function workNoteRows(siteVisit: SiteVisit) {
  return keyValueList([
    ["Site preparation needed", sitePreparation(siteVisit)],
    [
      "Materials to be confirmed",
      materialsToBeConfirmed(siteVisit).join("; "),
    ],
    [
      "Client responsibilities",
      clientResponsibilities(siteVisit).join("; "),
    ],
  ]);
}

function photoReferences(siteVisit: SiteVisit) {
  const items = siteVisit.photos
    .map((photo) => {
      const photoType = cleanValue(photo.photoType);
      const caption = cleanValue(photo.caption);
      const fileName = cleanValue(photo.fileName);

      if (photoType && caption) {
        return `${photoType}: ${caption}`;
      }

      if (photoType && fileName) {
        return `${photoType}: ${fileName}`;
      }

      return caption ? `${photo.label}: ${caption}` : cleanValue(photo.label);
    })
    .filter((item): item is string => Boolean(item));

  return items.length > 0 ? items : ["To be confirmed"];
}

function summaryLine(project: Project, siteVisit: SiteVisit) {
  return keyValueList([
    ["Project summary", valueOrToBeConfirmed(project.summary)],
    ["Rough note", roughNote(project, siteVisit)],
  ]);
}

export function client_brief({ project, siteVisit, tone }: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.client_brief, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section("Client Goals", bulletList(clientGoals(project, siteVisit))),
    section(
      "Design Direction",
      keyValueList([
        ["Preferred outdoor style", preferredStyle(project, siteVisit)],
        ["Budget reference", budgetReference(project, siteVisit)],
      ]),
      bulletList([
        `Priority areas: ${priorityAreas(project, siteVisit).join("; ")}`,
        `Must-keep items: ${mustKeep(project, siteVisit).join("; ")}`,
        `Must-avoid items: ${mustAvoid(project, siteVisit).join("; ")}`,
      ]),
    ),
    section("Site Considerations", siteConditionRows(siteVisit)),
    section(
      "Work Notes",
      bulletList(requiredWork(project, siteVisit)),
      keyValueList([
        ["Exclusions", exclusions(siteVisit).join("; ")],
        ["Site preparation needed", sitePreparation(siteVisit)],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
      ]),
    ),
    section("Source Notes", summaryLine(project, siteVisit)),
  ].join("\n\n");
}

export function site_visit_report({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  const form = formData(siteVisit);

  return [
    header(templateLabelByKey.site_visit_report, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section(
      "Visit Details",
      keyValueList([
        ["Visit date", valueOrToBeConfirmed(form?.visitDate, siteVisit.scheduledFor)],
        ["Project stage", valueOrToBeConfirmed(form?.projectStage, project.stage)],
        ["Visit lead", valueOrToBeConfirmed(siteVisit.lead)],
        ["Attendees", visitPeople(siteVisit).join("; ")],
      ]),
    ),
    section(
      "Client Requirements",
      bulletList(clientGoals(project, siteVisit)),
      keyValueList([
        ["Preferred outdoor style", preferredStyle(project, siteVisit)],
        ["Budget reference", budgetReference(project, siteVisit)],
        ["Priority areas", priorityAreas(project, siteVisit).join("; ")],
        ["Must-keep items", mustKeep(project, siteVisit).join("; ")],
        ["Must-avoid items", mustAvoid(project, siteVisit).join("; ")],
      ]),
    ),
    section(
      "Site Conditions",
      siteConditionRows(siteVisit),
      bulletList([
        `Recorded observations: ${observations(siteVisit).join("; ")}`,
        `Recorded constraints: ${siteConstraints(siteVisit).join("; ")}`,
        `Recorded opportunities: ${opportunities(siteVisit).join("; ")}`,
      ]),
    ),
    section(
      "Work Notes",
      bulletList(requiredWork(project, siteVisit)),
      keyValueList([
        ["Exclusions", exclusions(siteVisit).join("; ")],
        ["Site preparation needed", sitePreparation(siteVisit)],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
        ["Client responsibilities", clientResponsibilities(siteVisit).join("; ")],
      ]),
    ),
    section("Rough Note", roughNote(project, siteVisit)),
    section(
      "Photo References",
      bulletList(photoReferences(siteVisit)),
      "Photo upload and redaction will be added later.",
    ),
  ].join("\n\n");
}

export function scope_of_work({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.scope_of_work, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section(
      "Scope Context",
      keyValueList([
        ["Project summary", valueOrToBeConfirmed(project.summary)],
        ["Budget reference", budgetReference(project, siteVisit)],
        ["Priority areas", priorityAreas(project, siteVisit).join("; ")],
      ]),
    ),
    section("Included Work", bulletList(requiredWork(project, siteVisit))),
    section(
      "Exclusions",
      bulletList(exclusions(siteVisit)),
      "Only user-provided exclusions are listed in this draft.",
    ),
    section(
      "Site Preparation And Confirmation Items",
      workNoteRows(siteVisit),
      bulletList([
        `Known site constraints: ${siteConstraints(siteVisit).join("; ")}`,
        `Recorded opportunities: ${opportunities(siteVisit).join("; ")}`,
      ]),
    ),
    section("Source Notes", summaryLine(project, siteVisit)),
  ].join("\n\n");
}

export function quote_ready_summary({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.quote_ready_summary, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section(
      "Quote Context",
      keyValueList([
        ["Project summary", valueOrToBeConfirmed(project.summary)],
        ["Budget reference", budgetReference(project, siteVisit)],
        ["Preferred outdoor style", preferredStyle(project, siteVisit)],
      ]),
    ),
    section("Included Work Summary", bulletList(requiredWork(project, siteVisit))),
    section(
      "Scope Limits",
      bulletList(exclusions(siteVisit)),
      keyValueList([
        ["Site preparation needed", sitePreparation(siteVisit)],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
      ]),
    ),
    section(
      "Site Factors Relevant To Quoting",
      keyValueList([
        [
          "Access constraints",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.accessConstraints),
        ],
        ["Drainage notes", valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.drainageNotes)],
        ["Slope notes", valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.slopeNotes)],
      ]),
      bulletList([
        `Recorded constraints: ${siteConstraints(siteVisit).join("; ")}`,
        `Recorded observations: ${observations(siteVisit).join("; ")}`,
      ]),
    ),
    section(
      "Commercial Inputs",
      keyValueList([
        ["User-provided budget reference", budgetReference(project, siteVisit)],
        ["Exact quote pricing", "To be confirmed"],
      ]),
    ),
  ].join("\n\n");
}

export function change_request_note({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.change_request_note, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section(
      "Current Change Notes",
      keyValueList([
        ["Project summary", valueOrToBeConfirmed(project.summary)],
        ["Rough note", roughNote(project, siteVisit)],
        ["Priority areas", priorityAreas(project, siteVisit).join("; ")],
      ]),
      bulletList(requiredWork(project, siteVisit)),
    ),
    section(
      "Current Scope Context",
      keyValueList([
        ["Exclusions", exclusions(siteVisit).join("; ")],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
        ["Budget reference", budgetReference(project, siteVisit)],
      ]),
    ),
    section(
      "Items Still To Be Confirmed",
      bulletList([
        "Exact change description: To be confirmed",
        "Price impact: To be confirmed",
        "Program impact: To be confirmed",
        "Approval or compliance implications: To be confirmed",
      ]),
    ),
  ].join("\n\n");
}

export function before_after_report({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.before_after_report, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section(
      "Before Condition",
      keyValueList([
        ["Project summary", valueOrToBeConfirmed(project.summary)],
        [
          "Existing issues",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.existingIssues),
        ],
        ["Rough note", roughNote(project, siteVisit)],
      ]),
      bulletList([
        `Recorded observations: ${observations(siteVisit).join("; ")}`,
        `Photo references: ${photoReferences(siteVisit).join("; ")}`,
      ]),
    ),
    section(
      "Work Completed Or Proposed",
      bulletList(requiredWork(project, siteVisit)),
      keyValueList([
        ["Exclusions", exclusions(siteVisit).join("; ")],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
      ]),
    ),
    section(
      "After Outcome Summary",
      bulletList(clientGoals(project, siteVisit)),
      keyValueList([
        ["Preferred outdoor style", preferredStyle(project, siteVisit)],
        ["Priority areas", priorityAreas(project, siteVisit).join("; ")],
      ]),
    ),
  ].join("\n\n");
}

export function aftercare_guide({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  return [
    header(templateLabelByKey.aftercare_guide, tone),
    documentNote(),
    projectSnapshot(project, siteVisit),
    section("Work Covered", bulletList(requiredWork(project, siteVisit))),
    section(
      "Recorded Care Considerations",
      keyValueList([
        [
          "Shade / sun notes",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.shadeSunNotes),
        ],
        [
          "Drainage notes",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.drainageNotes),
        ],
        [
          "Soil / lawn condition notes",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.soilLawnConditionNotes),
        ],
        [
          "Pets / children considerations",
          valueOrToBeConfirmed(formData(siteVisit)?.siteConditions.petsChildrenConsiderations),
        ],
      ]),
    ),
    section(
      "Client Responsibilities",
      bulletList(clientResponsibilities(siteVisit)),
      keyValueList([
        ["Specific maintenance instructions", "To be confirmed"],
        ["Follow-up date", "To be confirmed"],
      ]),
    ),
    section(
      "Reference Notes",
      keyValueList([
        ["Rough note", roughNote(project, siteVisit)],
        ["Materials to be confirmed", materialsToBeConfirmed(siteVisit).join("; ")],
      ]),
    ),
  ].join("\n\n");
}

export function client_approval_message({
  project,
  siteVisit,
  tone,
}: YardBriefTemplateInput) {
  const nickname = valueOrToBeConfirmed(project.clientNickname, project.clientName);
  const siteType = valueOrToBeConfirmed(project.siteType).toLowerCase();
  const area = valueOrToBeConfirmed(project.location);

  return [
    header(templateLabelByKey.client_approval_message, tone),
    documentNote(),
    section(
      "Draft Message",
      `Hello ${nickname},`,
      `Please review the current summary for your ${siteType} project in ${area}.`,
      "The points below are based only on the notes currently saved in YardBrief AI.",
      bulletList([
        `Project stage: ${valueOrToBeConfirmed(formData(siteVisit)?.projectStage, project.stage)}`,
        `Priority areas: ${priorityAreas(project, siteVisit).join("; ")}`,
        `Required work: ${requiredWork(project, siteVisit).join("; ")}`,
        `Budget reference: ${budgetReference(project, siteVisit)}`,
        `Exclusions: ${exclusions(siteVisit).join("; ")}`,
      ]),
      'If the direction above looks right, please confirm any items marked "To be confirmed" before the next step.',
      "Thank you.",
    ),
    projectSnapshot(project, siteVisit),
    section(
      "Approval Checklist",
      bulletList(clientGoals(project, siteVisit)),
      keyValueList([
        ["Preferred outdoor style", preferredStyle(project, siteVisit)],
        ["Must-keep items", mustKeep(project, siteVisit).join("; ")],
        ["Must-avoid items", mustAvoid(project, siteVisit).join("; ")],
      ]),
    ),
  ].join("\n\n");
}

export const yardbriefTemplateGenerators = {
  client_brief,
  site_visit_report,
  scope_of_work,
  quote_ready_summary,
  change_request_note,
  before_after_report,
  aftercare_guide,
  client_approval_message,
} satisfies Record<YardBriefTemplateKey, YardBriefTemplateGenerator>;

export function getYardBriefTemplateKeyByLabel(label: YardBriefTemplateLabel) {
  return templateKeyByLabel[label];
}

export function generateYardBriefTemplate(
  templateKey: YardBriefTemplateKey,
  input: YardBriefTemplateInput,
) {
  return yardbriefTemplateGenerators[templateKey](input);
}

export function generateYardBriefTemplateFromLabel(
  label: YardBriefTemplateLabel,
  input: YardBriefTemplateInput,
) {
  return generateYardBriefTemplate(getYardBriefTemplateKeyByLabel(label), input);
}
