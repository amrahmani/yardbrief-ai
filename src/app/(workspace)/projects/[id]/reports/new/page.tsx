"use client";

import Link from "next/link";
import { useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { useCurrentProject } from "@/components/projects/project-context";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { InlineMessage } from "@/components/ui/inline-message";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { SectionCard } from "@/components/ui/section-card";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useSubscription } from "@/hooks/use-subscription";
import type { AIProvider } from "@/lib/ai/types";
import { reportToneOptions, reportTypeCatalog } from "@/lib/report-templates";
import type { ProjectMetric, Report, ReportTone } from "@/types/yardbrief";

function updateMetrics(metrics: ProjectMetric[], reportCount: number) {
  const hasReportsMetric = metrics.some((metric) => metric.label === "Reports");

  if (hasReportsMetric) {
    return metrics.map((metric) =>
      metric.label === "Reports"
        ? {
            ...metric,
            value: String(reportCount),
            detail: "Generated reports saved to the active project.",
          }
        : metric,
    );
  }

  return [
    ...metrics,
    {
      label: "Reports",
      value: String(reportCount),
      detail: "Generated reports saved to the active project.",
    },
  ];
}

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

function getProviderLabel(provider: AIProvider) {
  if (provider === "gemini") {
    return "Gemini";
  }

  if (provider === "openai") {
    return "OpenAI";
  }

  return "local template";
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

export default function NewReportPage() {
  const { project } = useCurrentProject();
  const { settings } = useAppSettings();

  if (!project) {
    return null;
  }

  return (
    <ReportGenerator
      key={`${project.id}-${settings.reportPreferences.defaultTone}-${settings.reportPreferences.defaultProductType}`}
      productType={settings.reportPreferences.defaultProductType}
      project={project}
      defaultTone={settings.reportPreferences.defaultTone}
    />
  );
}

function ReportGenerator({
  productType,
  defaultTone,
  project,
}: {
  productType: NonNullable<
    ReturnType<typeof useAppSettings>["settings"]["reportPreferences"]["defaultProductType"]
  >;
  defaultTone: ReportTone;
  project: NonNullable<ReturnType<typeof useCurrentProject>["project"]>;
}) {
  const { planDefinition, ready, reportLimit } = useSubscription();
  const { incrementSubscriptionUsage, mode, saveProject } = useWorkspaceData();
  const [selectedType, setSelectedType] = useState<
    (typeof reportTypeCatalog)[number]["name"]
  >(reportTypeCatalog[0].name);
  const [selectedTone, setSelectedTone] = useState<ReportTone>(defaultTone);
  const [generatedReport, setGeneratedReport] = useState<Report | null>(null);
  const [generationError, setGenerationError] = useState("");
  const [generationSource, setGenerationSource] = useState<AIProvider | null>(null);
  const [generationModel, setGenerationModel] = useState("");
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const photoDescriptions = project.siteVisit.photos
    .map((photo) => {
      const parts = [photo.photoType, photo.caption, photo.fileName]
        .map((part) => part?.trim())
        .filter(Boolean);

      return parts.length > 0 ? parts.join(": ") : photo.label?.trim();
    })
    .filter((item): item is string => Boolean(item));

  async function handleGenerate() {
    if (!ready || !reportLimit.allowed) {
      return;
    }

    setGenerationError("");
    setSaveMessage("");
    setFallbackUsed(false);
    setGenerationSource(null);
    setGenerationModel("");
    setGeneratedReport(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType: selectedType,
          project,
          siteVisit: project.siteVisit,
          tone: selectedTone,
          productType,
          photoDescriptions,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        contentMarkdown?: string;
        errorMessage?: string;
        fallbackUsed?: boolean;
        modelUsed?: string;
        providerUsed?: AIProvider;
      };

      if (!response.ok || !payload.contentMarkdown || !payload.providerUsed) {
        throw new Error(payload.error || "Unable to generate the report right now.");
      }

      const createdAt = formatDate(new Date());
      const providerLabel = getProviderLabel(payload.providerUsed);
      const report = {
        id: `${slugify(selectedType)}-${Date.now().toString(36)}`,
        title: `${selectedType} - ${project.clientNickname}`,
        type: selectedType,
        tone: selectedTone,
        markdown: payload.contentMarkdown,
        status: "Ready to send" as const,
        createdAt,
        updatedAt: createdAt,
        audience: chooseAudience(selectedType),
        summary:
          payload.providerUsed === "template"
            ? `Template-based ${selectedType.toLowerCase()} created from saved YardBrief project and site visit notes.`
            : `${providerLabel}-assisted ${selectedType.toLowerCase()} generated from saved YardBrief project and site visit notes.`,
        highlights: [],
        sections: [],
        nextSteps: [],
      } satisfies Report;

      const reports = [report, ...project.reports];
      const updatedProject = {
        ...project,
        reports,
        lastUpdated: createdAt,
        metrics: updateMetrics(project.metrics, reports.length),
        timeline: [
          {
            label: "Report generated",
            date: createdAt,
            detail:
              payload.providerUsed === "template"
                ? payload.fallbackUsed
                  ? `${report.type} generated from the local template fallback after AI was unavailable.`
                  : `${report.type} generated with the local template provider.`
                : `${report.type} generated with ${providerLabel} in a ${report.tone?.toLowerCase()} tone.`,
          },
          ...project.timeline.filter((item) => item.label !== "Report generated"),
        ],
      };

      await saveProject(updatedProject);
      await incrementSubscriptionUsage({ reports: 1 });
      setGeneratedReport(report);
      setGenerationSource(payload.providerUsed);
      setGenerationModel(payload.modelUsed ?? "");
      setFallbackUsed(Boolean(payload.fallbackUsed));
      setSaveMessage(
        payload.fallbackUsed
          ? `AI generation was unavailable, so a template-based report was created and saved${mode === "cloud" ? " in Supabase." : " locally."}`
          : payload.providerUsed === "template"
            ? `Template-based report generated and saved${mode === "cloud" ? " in Supabase." : " locally."}`
            : `${providerLabel}-assisted report generated and saved${mode === "cloud" ? " in Supabase." : " locally."}`,
      );
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unable to generate the report right now.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              New report
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-charcoal">
              Build the next client-facing output.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">
              Select a report type and tone, then generate a draft from the active AI provider or
              fall back to the local template when AI is unavailable.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link
              href={`/projects/${project.id}`}
              className="yb-button yb-button-secondary"
            >
              Back to overview
            </Link>
            {saveMessage ? (
              <div className="rounded-full bg-forest/8 px-4 py-2 text-sm font-semibold text-forest">
                {saveMessage}
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {generationError ? (
        <InlineMessage tone="error" title="Generation error">
          <p>{generationError}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleGenerate}
              className="yb-button yb-button-danger w-full sm:w-auto"
            >
              Retry generation
            </button>
            <Link
              href={`/projects/${project.id}`}
              className="yb-button yb-button-secondary w-full sm:w-auto"
            >
              Back to project
            </Link>
          </div>
        </InlineMessage>
      ) : null}

      {!reportLimit.allowed ? (
        <UpgradePrompt
          title="Free plan report limit reached."
          description={`The ${planDefinition.label} plan allows up to ${reportLimit.limit} generated reports per month in this MVP. Upgrade actions are still placeholders, but you can compare plans on the pricing page.`}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Report types
          </p>
          <div className="mt-5 grid gap-4">
            {reportTypeCatalog.map((option) => {
              const active = option.name === selectedType;

              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setSelectedType(option.name)}
                  className={
                    active
                      ? "rounded-[1.6rem] border border-forest/18 bg-forest/6 px-5 py-5 text-left shadow-[0_18px_45px_-34px_rgba(23,55,44,0.45)]"
                      : "rounded-[1.6rem] border border-charcoal/8 bg-beige/55 px-5 py-5 text-left transition hover:bg-beige"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-charcoal">{option.name}</h2>
                    {active ? (
                      <span className="rounded-full bg-forest px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone">{option.summary}</p>
                  <p className="mt-3 text-sm font-medium text-forest">{option.output}</p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Tone selection
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reportToneOptions.map((tone) => {
              const active = tone === selectedTone;

              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={
                    active
                      ? "rounded-[1.4rem] border border-forest/18 bg-forest px-4 py-4 text-left text-white shadow-[0_18px_45px_-34px_rgba(23,55,44,0.55)]"
                      : "rounded-[1.4rem] border border-charcoal/8 bg-white px-4 py-4 text-left text-charcoal transition hover:border-forest/15"
                  }
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">{tone}</p>
                  <p className={active ? "mt-2 text-sm text-white/80" : "mt-2 text-sm text-stone"}>
                    {tone === "Professional" && "Clear and polished client-facing language."}
                    {tone === "Friendly" && "Warm and approachable without losing clarity."}
                    {tone === "Concise" && "Short, direct, and easy to scan quickly."}
                    {tone === "Detailed" && "More context and fuller explanations."}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-charcoal/8 bg-beige/45 px-4 py-4">
            <p className="text-sm font-semibold text-charcoal">Selected output</p>
            <p className="mt-3 text-lg font-semibold text-charcoal">{selectedType}</p>
            <p className="mt-1 text-sm text-stone">Tone: {selectedTone}</p>
            <p className="mt-3 text-sm leading-7 text-stone">
              Current plan: {planDefinition.label}
              {planDefinition.reports_per_month_limit !== null ? (
                <>
                  {" "}
                  - {reportLimit.current} of {planDefinition.reports_per_month_limit} monthly
                  reports used
                </>
              ) : null}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone">
              Privacy-first: drafts are generated from the project notes you already captured, so
              review them before sharing with a client.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !ready || !reportLimit.allowed}
            className="yb-button yb-button-primary mt-6 w-full sm:w-auto"
          >
            {!ready
              ? "Checking plan..."
              : isGenerating
                ? "Generating report..."
                : !reportLimit.allowed
                  ? "Monthly limit reached"
                  : "Generate Report"}
          </button>
        </SectionCard>
      </div>

      {isGenerating ? (
        <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.96),rgba(232,244,236,0.78))]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                Generating draft
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-charcoal">
                Building a cleaner report from your saved project notes.
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-stone">
                YardBrief is combining the selected report type, tone, and current site-visit
                context. This usually takes just a moment.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest">
              Generating report...
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="yb-loading-shimmer rounded-[1.5rem] bg-white/82 px-4 py-5"
              >
                <div className="h-4 w-28 rounded-full bg-beige/70" />
                <div className="mt-3 h-4 w-full rounded-full bg-beige/60" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-beige/60" />
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {fallbackUsed ? (
        <InlineMessage tone="warning" title="Template fallback used">
          <p>AI generation was unavailable, so a template-based report was created.</p>
        </InlineMessage>
      ) : null}

      <SectionCard>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
          Source material
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.6rem] border border-charcoal/8 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-charcoal">Project summary</p>
            <p className="mt-3 text-sm leading-7 text-stone">{project.summary}</p>
          </div>
          <div className="rounded-[1.6rem] border border-charcoal/8 bg-beige/55 px-4 py-4">
            <p className="text-sm font-semibold text-charcoal">Client goals</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.goals.length > 0 ? (
                project.goals.map((goal) => (
                  <span
                    key={goal}
                    className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal"
                  >
                    {goal}
                  </span>
                ))
              ) : (
                <p className="text-sm text-stone">No goals added yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-charcoal/8 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-charcoal">Site constraints</p>
            <div className="mt-3 space-y-3">
              {project.siteVisit.constraints.length > 0 ? (
                project.siteVisit.constraints.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-charcoal/8 bg-beige/55 px-4 py-3 text-sm leading-7 text-stone"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-charcoal/12 bg-beige/35 px-4 py-3 text-sm leading-7 text-stone">
                  No site constraints recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {generatedReport ? (
        <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(243,234,219,0.76))]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="rounded-[1.6rem] border border-charcoal/8 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                Generated preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-charcoal">
                {generatedReport.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">
                {generatedReport.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-beige px-4 py-2 text-sm font-semibold text-charcoal">
                {generatedReport.type}
              </span>
              <span className="rounded-full bg-beige px-4 py-2 text-sm font-semibold text-charcoal">
                Tone: {generatedReport.tone}
              </span>
              {generationSource ? (
                <span className="rounded-full bg-beige px-4 py-2 text-sm font-semibold text-charcoal">
                  Generated with {getProviderLabel(generationSource)}
                </span>
              ) : null}
              {generationModel ? (
                <span className="rounded-full bg-beige px-4 py-2 text-sm font-semibold text-charcoal">
                  Model: {generationModel}
                </span>
              ) : null}
              <Link
                href={`/projects/${project.id}/reports/${generatedReport.id}`}
                className="yb-button yb-button-primary"
              >
                Open generated report
              </Link>
            </div>
          </div>
          <div className="mt-6 rounded-[1.7rem] border border-charcoal/8 bg-white/88 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Markdown preview
            </p>
            <div className="mt-4 max-h-[32rem] overflow-auto rounded-[1.4rem] border border-charcoal/8 bg-beige/25 px-4 py-4">
              <MarkdownPreview markdown={generatedReport.markdown ?? ""} />
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
