import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";

const outputs = [
  "Client Brief",
  "Site Visit Report",
  "Scope of Work",
  "Quote-Ready Summary",
  "Change Request Note",
  "Before/After Report",
  "Aftercare Guide",
  "Client Approval Message",
];

const privacyPoints = [
  "No exact address required",
  "Use client nickname",
  "User controls export/share",
  "Reports are generated from user-provided notes",
  "Avoid uploading sensitive personal information",
];

const workflow = [
  {
    title: "Capture what happened on site",
    description:
      "Bring together photos, voice notes, and rough handwritten or typed observations from the visit.",
  },
  {
    title: "Turn rough notes into structured outputs",
    description:
      "YardBrief AI helps landscapers shape messy field material into clear briefs, scopes, and client-facing reports.",
  },
  {
    title: "Share only when you are ready",
    description:
      "Keep control of what gets exported, reviewed, or sent so the final output matches your process and client relationship.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-[2.4rem] border border-white/75 bg-[linear-gradient(135deg,rgba(255,253,248,0.97),rgba(232,244,236,0.88))] p-6 shadow-[0_30px_80px_-45px_rgba(23,55,44,0.62)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr] lg:gap-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forest">
              by SpaceBrief
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.96] text-charcoal sm:text-6xl lg:text-7xl">
              YardBrief AI
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-charcoal sm:text-2xl sm:leading-9">
              Turn landscape site visits into client briefs, scopes, and reports.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-stone sm:text-base">
              YardBrief AI helps landscapers convert photos, voice notes, and rough site visit
              notes into polished documents that are easier to review, quote from, and share with
              clients.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/projects/new"
                className="yb-button yb-button-primary w-full sm:w-auto"
              >
                Create Site Visit Report
              </Link>
              <Link
                href="/pricing"
                className="yb-button yb-button-secondary w-full sm:w-auto"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
              Built to feel safe in front of a client: use nicknames, suburb-only location, and
              review exports before sharing.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Mobile-friendly", "Privacy-first", "Built for landscapers"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <SectionCard className="bg-white/90">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                    Input to output
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-charcoal">
                    From field material to client-ready writing
                  </h2>
                </div>
                <span className="rounded-full bg-forest/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
                  YardBrief flow
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.6rem] border border-charcoal/8 bg-beige/55 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                    What you start with
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Photos", "Voice notes", "Rough site notes"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-charcoal/8 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                    What YardBrief AI helps produce
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {outputs.slice(0, 4).map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.1rem] border border-charcoal/8 bg-beige/50 px-3 py-3 text-sm font-medium text-charcoal"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="bg-[linear-gradient(180deg,rgba(33,88,66,0.98),rgba(23,55,44,0.96))] text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Why it matters
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Cleaner documentation means clearer client communication.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Instead of rewriting the same observations across briefs, quotes, and follow-up
                messages, YardBrief AI gives you a structured starting point from the notes you
                already captured on site.
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "Reduce admin time after each visit",
                  "Keep reports consistent across projects",
                  "Make quoting and approvals easier to prepare",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-4 text-sm font-medium text-white/88"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {workflow.map((item, index) => (
          <SectionCard key={item.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Step {index + 1}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-charcoal">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone">{item.description}</p>
          </SectionCard>
        ))}
      </section>

      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Output library
            </p>
            <h2 className="mt-3 font-display text-3xl text-charcoal">
              One site visit can become multiple client-facing deliverables.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">
              YardBrief AI is designed to help landscapers reuse the same on-site context across the
              documents clients actually need.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="yb-button yb-button-primary"
          >
            Create Site Visit Report
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {outputs.map((item) => (
            <div
              key={item}
              className="rounded-[1.55rem] border border-charcoal/8 bg-beige/55 px-4 py-4"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone">
                Output
              </p>
              <h3 className="mt-3 text-xl font-semibold text-charcoal">{item}</h3>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="bg-[linear-gradient(135deg,rgba(255,253,248,0.96),rgba(243,234,219,0.92))]">
        <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Privacy-first
            </p>
            <h2 className="mt-3 font-display text-3xl text-charcoal">
              Keep sensitive project details in your control.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone">
              YardBrief AI is meant to support documentation, not encourage unnecessary sharing of
              personal information. The workflow should stay practical, lightweight, and careful.
            </p>
          </div>
          <div className="grid gap-3">
            {privacyPoints.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4 text-sm font-medium text-charcoal shadow-[0_16px_35px_-28px_rgba(23,55,44,0.4)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
