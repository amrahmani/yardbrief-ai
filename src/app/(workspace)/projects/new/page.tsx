"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { InlineMessage } from "@/components/ui/inline-message";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionCard } from "@/components/ui/section-card";
import { useSubscription } from "@/hooks/use-subscription";
import { createProjectFromInput } from "@/lib/project-store";
import type { ProjectStage } from "@/types/yardbrief";

const siteTypes = [
  "Residential garden",
  "Commercial landscape",
  "Courtyard",
  "Backyard",
  "Front yard",
  "Garden maintenance",
  "Turf installation",
  "Paving",
  "Outdoor renovation",
  "Other",
] as const;

const projectStages: ProjectStage[] = [
  "First visit",
  "Quote preparation",
  "Work in progress",
  "Completed",
  "Follow-up",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { planDefinition, projectLimit, ready } = useSubscription();
  const { mode, saveProject } = useWorkspaceData();
  const [projectName, setProjectName] = useState("");
  const [clientNickname, setClientNickname] = useState("");
  const [siteType, setSiteType] = useState<(typeof siteTypes)[number]>("Residential garden");
  const [projectStage, setProjectStage] = useState<ProjectStage>("First visit");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ready || !projectLimit.allowed) {
      return;
    }

    if (!projectName.trim() || !clientNickname.trim()) {
      setSubmitError("Project name and client nickname are required.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const project = createProjectFromInput({
      name: projectName,
      clientNickname,
      siteType,
      stage: projectStage,
      area,
      notes,
    });

    try {
      await saveProject(project);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Project could not be saved right now.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Create project"
        title="Start a new YardBrief project."
        description="Capture the essentials for a new landscape job, save them locally, and jump straight into the project detail page."
        highlights={[
          "Mobile-first intake for field use",
          "Suburb-only location capture",
          "Client nickname-first workflow",
        ]}
        actions={
          <Link href="/dashboard" className="yb-button yb-button-secondary">
            Back to dashboard
          </Link>
        }
      />

      {!projectLimit.allowed ? (
        <UpgradePrompt
          title="Free plan project limit reached."
          description={`The ${planDefinition.label} plan allows up to ${projectLimit.limit} locally created projects in this MVP. Upgrade options are placeholders for now, but you can review the paid tiers on the pricing page.`}
        />
      ) : null}

      {submitError ? (
        <InlineMessage tone="error" title="Project save issue">
          {submitError}
        </InlineMessage>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr,0.88fr]">
        <SectionCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InlineMessage tone="success" title="Privacy hint">
              Use a client nickname instead of full client identity. Suburb or area is optional
              and more than enough for the MVP.
            </InlineMessage>

            <div className="yb-card-muted text-sm leading-7 text-stone">
              <span className="font-semibold text-charcoal">Current plan:</span>{" "}
              {planDefinition.label}
              {planDefinition.projects_limit !== null ? (
                <>
                  {" "}
                  · {projectLimit.current} of {planDefinition.projects_limit} local projects used
                </>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-charcoal">Project name</span>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="North Shore front yard refresh"
                  className="yb-field mt-2"
                />
                <p className="yb-helper">
                  Use a clear internal job name that will be easy to scan on site.
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Client nickname</span>
                <input
                  type="text"
                  required
                  value={clientNickname}
                  onChange={(event) => setClientNickname(event.target.value)}
                  placeholder="Harris family"
                  className="yb-field mt-2"
                />
                <p className="yb-helper">
                  Keep this client-friendly and privacy-safe for shared screens.
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Suburb/area</span>
                <input
                  type="text"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Willoughby, Lower North Shore"
                  className="yb-field mt-2"
                />
                <p className="yb-helper">
                  Optional. Do not enter an exact street address in the MVP.
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Site type</span>
                <select
                  value={siteType}
                  onChange={(event) => setSiteType(event.target.value as (typeof siteTypes)[number])}
                  className="yb-field mt-2"
                >
                  {siteTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="yb-helper">
                  Choose the closest fit so report templates read more naturally later.
                </p>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Project stage</span>
                <select
                  value={projectStage}
                  onChange={(event) => setProjectStage(event.target.value as ProjectStage)}
                  className="yb-field mt-2"
                >
                  {projectStages.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="yb-helper">
                  This sets the starting workflow and the first site-visit framing.
                </p>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-charcoal">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Short summary of the visit, client priorities, or the work being prepared."
                  rows={6}
                  className="yb-field yb-textarea mt-2"
                />
                <p className="yb-helper">
                  Add the rough context now so the project detail page already feels useful in
                  front of a client.
                </p>
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting || !ready || !projectLimit.allowed}
                className="yb-button yb-button-primary w-full sm:w-auto"
              >
                {!ready
                  ? "Checking plan..."
                  : isSubmitting
                    ? "Creating project..."
                    : !projectLimit.allowed
                      ? "Project limit reached"
                      : "Create Project"}
              </button>
              <Link href="/dashboard" className="yb-button yb-button-secondary w-full sm:w-auto">
                Cancel
              </Link>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard className="bg-[linear-gradient(180deg,rgba(33,88,66,0.98),rgba(23,55,44,0.96))] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              What happens on submit
            </p>
            <div className="mt-4 space-y-3">
              {[
                mode === "cloud"
                  ? "The project is saved to Supabase for your signed-in workspace."
                  : "The project is saved to local browser storage for demo mode.",
                mode === "cloud"
                  ? "Because you are signed in, the project also syncs to Supabase."
                  : "In demo mode, the project stays local to this browser.",
                "YardBrief redirects straight to the new project detail page.",
                "In the MVP, the free plan allows up to 2 created projects before showing an upgrade prompt.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-4 text-sm leading-7"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Starter guidance
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone">
              <p>Keep the project name practical and easy to scan in the dashboard.</p>
              <p>Use suburb or area only if it helps identify the job without exposing an address.</p>
              <p>Add rough notes now so the new project detail page has a useful starting summary.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
