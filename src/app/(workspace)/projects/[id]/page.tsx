"use client";

import Link from "next/link";

import { useCurrentProject } from "@/components/projects/project-context";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";

export default function ProjectPage() {
  const { project } = useCurrentProject();

  if (!project) {
    return null;
  }

  const projectNotes = project.notes || "No notes added yet.";
  const recentSiteVisits = project.recentSiteVisits ?? [];

  return (
    <div className="space-y-6">
      <SectionCard className="bg-[linear-gradient(140deg,rgba(255,253,248,0.98),rgba(232,244,236,0.78))]">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Project detail
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-charcoal">Project summary</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone sm:text-base">
              {project.summary}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/projects/${project.id}/site-visit`}
              className="yb-button yb-button-primary w-full sm:w-auto"
            >
              Add Site Visit
            </Link>
            <Link
              href={`/projects/${project.id}/reports/new`}
              className="yb-button yb-button-secondary w-full sm:w-auto"
            >
              Generate Report
            </Link>
            <Link
              href="#recent-reports"
              className="yb-button yb-button-muted w-full sm:w-auto"
            >
              View Reports
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="yb-card-muted">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Client nickname
              </p>
              <p className="mt-2 text-base font-semibold text-charcoal">
                {project.clientNickname}
              </p>
            </div>
            <div className="yb-meta-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Site type
              </p>
              <p className="mt-2 text-base font-semibold text-charcoal">{project.siteType}</p>
            </div>
            <div className="yb-meta-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Project stage
              </p>
              <p className="mt-2 text-base font-semibold text-charcoal">{project.stage}</p>
            </div>
            <div className="yb-meta-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Suburb/area
              </p>
              <p className="mt-2 text-base font-semibold text-charcoal">{project.location}</p>
            </div>
            <div className="yb-meta-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Reports
              </p>
              <p className="mt-2 text-base font-semibold text-charcoal">
                {project.reports.length}
              </p>
            </div>
            <div className="yb-meta-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                Status
              </p>
              <div className="mt-2">
                <StatusPill label={project.status} />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">Notes</p>
            <p className="mt-2 text-sm leading-7 text-stone">
              Internal context and rough summary for this job.
            </p>
          </div>
          <span className="rounded-full bg-beige px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal">
            Privacy-first record
          </span>
        </div>
        <div className="mt-4 rounded-[1.5rem] border border-charcoal/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,234,219,0.45))] px-4 py-4">
          <p className="text-sm leading-7 text-stone sm:text-base">{projectNotes}</p>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                Recent site visits
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-charcoal">
                Field activity
              </h2>
            </div>
            <Link
              href={`/projects/${project.id}/site-visit`}
              className="text-sm font-semibold text-forest"
            >
              Open site visit
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {recentSiteVisits.length > 0 ? (
              recentSiteVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-[1.5rem] border border-charcoal/8 bg-beige/55 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal">{visit.title}</h3>
                      <p className="mt-1 text-sm text-stone">Lead: {visit.lead}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal">
                      {visit.date}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone">{visit.summary}</p>
                </div>
              ))
            ) : (
              <EmptyState
                eyebrow="Field activity"
                title="No site visits recorded yet."
                description="Start with a structured visit so the client requirements, site conditions, and work notes are all captured in one place."
                action={
                  <Link
                    href={`/projects/${project.id}/site-visit`}
                    className="yb-button yb-button-primary"
                  >
                    Add Site Visit
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>

        <SectionCard id="recent-reports">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                Recent reports
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-charcoal">
                Generated documents
              </h2>
            </div>
            <Link
              href={`/projects/${project.id}/reports/new`}
              className="text-sm font-semibold text-forest"
            >
              New report
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {project.reports.length > 0 ? (
              project.reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/projects/${project.id}/reports/${report.id}`}
                  className="block rounded-[1.5rem] border border-charcoal/8 bg-white px-4 py-4 transition hover:border-forest/15 hover:bg-beige/35"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-charcoal">{report.title}</h3>
                        <StatusPill label={report.status} />
                      </div>
                      <p className="mt-2 text-sm text-stone">
                        {report.type} / {report.audience}
                      </p>
                    </div>
                    <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal">
                      {report.updatedAt}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone">{report.summary}</p>
                </Link>
              ))
            ) : (
              <EmptyState
                eyebrow="Reports"
                title="No reports yet."
                description="Generate the first client-facing report once the site visit details are in place."
                action={
                  <Link
                    href={`/projects/${project.id}/reports/new`}
                    className="yb-button yb-button-secondary"
                  >
                    Generate Report
                  </Link>
                }
              />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
