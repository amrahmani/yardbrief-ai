"use client";

import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { useProjects } from "@/hooks/use-projects";

export default function DashboardPage() {
  const { projects, ready } = useProjects();

  return (
    <div className="space-y-6">
      <SectionCard className="bg-[linear-gradient(135deg,rgba(255,253,248,0.97),rgba(232,244,236,0.86))]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Dashboard
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-charcoal sm:text-5xl">
              Welcome to YardBrief AI
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone sm:text-base">
              Keep your active projects organised and jump straight into the next site visit,
              report, or scope.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="yb-button yb-button-primary w-full sm:w-auto"
          >
            Create New Project
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            "Create a project before the first walk-through.",
            "Save suburb-only details and client nicknames.",
            "Open reports live while reviewing with a client.",
          ].map((item) => (
            <div key={item} className="yb-meta-tile bg-white/80 text-sm leading-7 text-stone">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Projects
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-charcoal">Your YardBrief projects</h2>
          </div>
          <p className="hidden text-sm text-stone sm:block">
            {ready ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}` : "Loading"}
          </p>
        </div>

        {!ready ? (
          <div className="mt-6 grid gap-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="yb-loading-shimmer rounded-[1.8rem] border border-charcoal/8 bg-white/90 px-5 py-5"
              >
                <div className="h-6 w-48 rounded-full bg-beige/80" />
                <div className="mt-4 h-4 w-full rounded-full bg-beige/65" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-beige/65" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((tile) => (
                    <div key={tile} className="h-24 rounded-[1.3rem] bg-beige/55" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              eyebrow="Ready to start"
              title="No projects yet. Create your first YardBrief project."
              description="Set up the client nickname, site type, and rough notes first so you can step into the site visit flow with everything in one place."
              action={
                <Link href="/projects/new" className="yb-button yb-button-primary">
                  Create New Project
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-[1.8rem] border border-charcoal/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,234,219,0.48))] px-5 py-5 shadow-[0_22px_55px_-42px_rgba(23,55,44,0.65)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-semibold text-charcoal">{project.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-stone">{project.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[project.siteType, project.stage, project.location].map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-charcoal"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="yb-button yb-button-secondary w-full shrink-0 sm:w-auto"
                  >
                    Open project
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="yb-meta-tile">
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
                      Last updated
                    </p>
                    <p className="mt-2 text-base font-semibold text-charcoal">
                      {project.lastUpdated}
                    </p>
                  </div>
                  <div className="yb-meta-tile">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                      Number of reports
                    </p>
                    <p className="mt-2 text-base font-semibold text-charcoal">
                      {project.reports.length}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
