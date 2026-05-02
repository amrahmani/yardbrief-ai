"use client";

import type { ReactNode } from "react";

import { useParams } from "next/navigation";

import { ProjectTabs } from "@/components/layout/project-tabs";
import { ProjectProvider } from "@/components/projects/project-context";
import { ProjectNotFound } from "@/components/projects/project-not-found";
import { InlineMessage } from "@/components/ui/inline-message";
import { SectionCard } from "@/components/ui/section-card";
import { StatusPill } from "@/components/ui/status-pill";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { projects, ready } = useProjects();
  const project = projects.find((item) => item.id === projectId) ?? null;

  if (!ready && !project) {
    return (
      <InlineMessage tone="info" title="Loading project">
        Pulling together the latest project details for this workspace.
      </InlineMessage>
    );
  }

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <ProjectProvider project={project} projectId={projectId}>
      <div className="space-y-6">
        <SectionCard className="bg-[linear-gradient(135deg,rgba(255,253,248,0.95),rgba(232,244,236,0.82))]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
                {project.clientNickname} / {project.location}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl leading-tight text-charcoal sm:text-5xl">
                  {project.name}
                </h1>
                <StatusPill label={project.status} />
              </div>
              <p className="max-w-3xl text-sm leading-7 text-stone sm:text-base">
                {project.summary}
              </p>
            </div>
            <div className="grid gap-2 rounded-[1.5rem] border border-charcoal/8 bg-white/75 px-4 py-4 text-sm text-stone sm:min-w-56">
              <p>
                <span className="font-semibold text-charcoal">Site type:</span> {project.siteType}
              </p>
              <p>
                <span className="font-semibold text-charcoal">Stage:</span> {project.stage}
              </p>
              <p>
                <span className="font-semibold text-charcoal">Last updated:</span>{" "}
                {project.lastUpdated}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.5rem] border border-charcoal/8 bg-white/78 px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                  {metric.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-charcoal">{metric.value}</p>
                <p className="mt-2 text-sm text-stone">{metric.detail}</p>
              </div>
            ))}
          </div>
          <ProjectTabs projectId={project.id} />
        </SectionCard>
        {children}
      </div>
    </ProjectProvider>
  );
}
