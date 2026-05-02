import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <SectionCard className="w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone">Not found</p>
        <h1 className="mt-4 font-display text-4xl text-charcoal">This YardBrief page is missing.</h1>
        <p className="mt-4 text-sm leading-7 text-stone">
          The route exists in the starter app, but this particular project or report could not
          be found in the mocked local data.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-charcoal/10 bg-white px-5 py-3 text-sm font-semibold text-charcoal"
          >
            View homepage
          </Link>
        </div>
      </SectionCard>
    </main>
  );
}
