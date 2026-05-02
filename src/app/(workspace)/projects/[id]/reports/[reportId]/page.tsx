"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { ReportPdfDocument } from "@/components/reports/report-pdf-document";
import { ProjectNotFound } from "@/components/projects/project-not-found";
import { useCurrentProject } from "@/components/projects/project-context";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { SectionCard } from "@/components/ui/section-card";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useSubscription } from "@/hooks/use-subscription";
import { StatusPill } from "@/components/ui/status-pill";
import type { Report } from "@/types/yardbrief";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildFallbackMarkdown(report: Report) {
  const highlightsBlock =
    report.highlights.length > 0
      ? ["## Key Highlights", report.highlights.map((item) => `- ${item}`).join("\n")].join(
          "\n\n",
        )
      : "";

  const sectionsBlock = report.sections
    .map((section) =>
      [
        `## ${section.title}`,
        section.body,
        section.bullets.length > 0
          ? section.bullets.map((bullet) => `- ${bullet}`).join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    )
    .join("\n\n");

  const nextStepsBlock =
    report.nextSteps.length > 0
      ? ["## Next Steps", report.nextSteps.map((step) => `- ${step}`).join("\n")].join("\n\n")
      : "";

  return [
    `# ${report.title}`,
    report.summary,
    report.tone ? `Tone: ${report.tone}` : "",
    highlightsBlock,
    sectionsBlock,
    nextStepsBlock,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function ReportPage() {
  const params = useParams<{ reportId: string }>();
  const reportId = Array.isArray(params.reportId) ? params.reportId[0] : params.reportId;
  const { project } = useCurrentProject();
  const report = project?.reports.find((item) => item.id === reportId) ?? null;

  if (!project) {
    return null;
  }

  if (!report) {
    return (
      <ProjectNotFound detail="This report could not be found for the selected YardBrief project." />
    );
  }

  return <ReportEditor key={`${report.id}-${report.updatedAt}`} project={project} report={report} />;
}

function ReportEditor({ project, report }: { project: NonNullable<ReturnType<typeof useCurrentProject>["project"]>; report: Report }) {
  const { settings } = useAppSettings();
  const { planDefinition } = useSubscription();
  const { mode, saveProject } = useWorkspaceData();
  const baseContent = report.markdown?.trim() || buildFallbackMarkdown(report);
  const [draftContent, setDraftContent] = useState(baseContent);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const exportDate = formatDate(new Date());
  const pdfFileName = `${slugify(project.name)}-${slugify(report.type)}.pdf`;
  const disclaimer = settings.reportPreferences.defaultDisclaimer;
  const businessName = settings.businessProfile.businessName;

  const hasChanges = draftContent !== baseContent;

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(draftContent);
      setFeedbackMessage("Report text copied to clipboard.");
    } catch {
      setFeedbackMessage("Clipboard copy is not available in this browser.");
    }
  }

  async function handleSaveReport() {
    setIsSaving(true);

    const updatedAt = formatDate(new Date());
    const updatedReport = {
      ...report,
      markdown: draftContent,
      updatedAt,
      status: "Ready to send" as const,
    };

    const updatedProject = {
      ...project,
      reports: project.reports.map((item) => (item.id === report.id ? updatedReport : item)),
      lastUpdated: updatedAt,
      timeline: [
        {
          label: "Report updated",
          date: updatedAt,
          detail: `${report.type} reviewed and saved to the active project.`,
        },
        ...project.timeline.filter((item) => item.label !== "Report updated"),
      ],
    };

    try {
      await saveProject(updatedProject);
      setFeedbackMessage(
        mode === "cloud"
          ? "Report saved to the Supabase project record."
          : "Report saved to local project storage.",
      );
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "Report could not be saved right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              {report.type} / {report.audience}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-charcoal">{report.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">{report.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone">
              <span className="rounded-full bg-beige px-4 py-2">Created {report.createdAt}</span>
              <span className="rounded-full bg-beige px-4 py-2">Updated {report.updatedAt}</span>
              {report.tone ? (
                <span className="rounded-full bg-beige px-4 py-2">Tone: {report.tone}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <StatusPill label={report.status} />
            <Link
              href={`/projects/${project.id}`}
              className="yb-button yb-button-secondary"
            >
              Back to Project
            </Link>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="border border-forest/12 bg-[linear-gradient(135deg,rgba(232,244,236,0.86),rgba(255,253,248,0.96))]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
          Disclaimer
        </p>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-charcoal">{disclaimer}</p>
        <p className="mt-3 text-sm leading-7 text-stone">
          Review the wording, remove anything too sensitive, and confirm any placeholders before
          exporting or sending.
        </p>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Report actions
            </p>
            <p className="mt-2 text-sm leading-7 text-stone">
              Review the generated markdown, make any edits, then save it back to the active
              project store.
            </p>
          </div>
          {feedbackMessage ? <span className="rounded-full bg-forest/8 px-4 py-2 text-sm font-semibold text-forest">{feedbackMessage}</span> : null}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleSaveReport}
            disabled={isSaving || !hasChanges}
            className="yb-button yb-button-primary w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Report"}
          </button>
          <button
            type="button"
            onClick={handleCopyText}
            className="yb-button yb-button-secondary w-full sm:w-auto"
          >
            Copy Text
          </button>
          <PDFDownloadLink
            document={
              <ReportPdfDocument
                businessName={businessName}
                clientNickname={project.clientNickname}
                date={exportDate}
                disclaimer={disclaimer}
                projectName={project.name}
                reportContent={draftContent}
                reportType={report.type}
                watermarkEnabled={planDefinition.watermark_enabled}
              />
            }
            fileName={pdfFileName}
            className="yb-button yb-button-muted w-full sm:w-auto"
          >
            {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
          </PDFDownloadLink>
          <Link
            href={`/projects/${project.id}`}
            className="yb-button yb-button-secondary w-full sm:w-auto"
          >
            Back to Project
          </Link>
        </div>
        {!hasChanges ? (
          <p className="mt-4 text-sm leading-7 text-stone">
            Tip: edit the content below if you want to soften the wording, remove internal notes,
            or tighten the client-ready version before export.
          </p>
        ) : null}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Editable report content
          </p>
          <textarea
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            className="yb-field yb-textarea mt-5 min-h-[28rem] rounded-[1.7rem] font-mono text-sm leading-7"
            placeholder="Generated report content will appear here."
          />
        </SectionCard>

        <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(243,234,219,0.72))]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Preview
          </p>
          <div className="mt-5 min-h-[28rem] overflow-x-auto rounded-[1.7rem] border border-charcoal/8 bg-white/88 px-4 py-4">
            <MarkdownPreview markdown={draftContent} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
