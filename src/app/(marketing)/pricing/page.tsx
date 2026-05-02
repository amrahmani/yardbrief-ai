import { PageIntro } from "@/components/ui/page-intro";
import { PricingPlansGrid } from "@/components/pricing/pricing-plans-grid";
import { SectionCard } from "@/components/ui/section-card";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Pricing"
        title="Simple pricing for landscapers using YardBrief AI."
        description="Choose the YardBrief plan that fits your studio size today. Stripe Checkout and Stripe Billing are wired for the web app, while mobile in-app purchases remain out of scope for now."
        highlights={[
          "Free plan for local demos",
          "Solo and Pro for working operators",
          "Team for shared studio workflows",
        ]}
      />

      <PricingPlansGrid />

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <SectionCard className="bg-beige/65">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            What changes by plan
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4 text-sm leading-7 text-stone">
              Free keeps YardBrief lightweight with a small project cap and watermark on exported
              PDFs.
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4 text-sm leading-7 text-stone">
              Solo removes the watermark and expands access to client approval messages and
              aftercare guides.
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4 text-sm leading-7 text-stone">
              Pro adds studio branding, saved templates, and broader commercial report types like
              quote-ready summaries and change request notes.
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/8 bg-white/88 px-4 py-4 text-sm leading-7 text-stone">
              Team is designed for shared workflows, multiple users, and future cloud sync once
              collaboration features are switched on.
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(232,244,236,0.82))]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Important note
          </p>
          <p className="mt-4 text-sm leading-7 text-stone">
            Web subscriptions run through Stripe Checkout and Stripe Billing once Supabase and
            Stripe environment variables are configured. Demo mode still stays available for local
            product exploration.
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "PDF watermarking is removed on paid plans.",
              "Business branding and saved templates step up as the plan increases.",
              "Mobile in-app purchases are intentionally not implemented yet.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-forest/12 bg-white/88 px-4 py-4 text-sm leading-7 text-stone"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
