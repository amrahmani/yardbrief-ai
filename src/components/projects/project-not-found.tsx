import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";

interface ProjectNotFoundProps {
  detail?: string;
}

export function ProjectNotFound({
  detail = "This project could not be found in the seeded demo data or in your saved local projects.",
}: ProjectNotFoundProps) {
  return (
    <SectionCard className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
        Project unavailable
      </p>
      <h1 className="mt-4 font-display text-3xl text-charcoal">
        This YardBrief project is not available.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone">{detail}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/projects/new"
          className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white"
        >
          Create New Project
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-charcoal/10 bg-white px-5 py-3 text-sm font-semibold text-charcoal"
        >
          Back to dashboard
        </Link>
      </div>
    </SectionCard>
  );
}
