import Link from "next/link";

import { SectionCard } from "@/components/ui/section-card";

interface UpgradePromptProps {
  ctaLabel?: string;
  description: string;
  title: string;
}

export function UpgradePrompt({
  ctaLabel = "Upgrade to Solo",
  description,
  title,
}: UpgradePromptProps) {
  return (
    <SectionCard className="border border-forest/12 bg-[linear-gradient(135deg,rgba(232,244,236,0.92),rgba(255,253,248,0.98))]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
        Upgrade prompt
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-charcoal">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-stone">{description}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="yb-button yb-button-primary w-full sm:w-auto"
        >
          {ctaLabel}
        </button>
        <Link
          href="/pricing"
          className="yb-button yb-button-secondary w-full sm:w-auto"
        >
          View Pricing
        </Link>
      </div>
      <p className="mt-3 text-xs leading-6 text-stone">
        Local MVP limits are enforced here first. Compare plans or continue once billing is configured for your workspace.
      </p>
    </SectionCard>
  );
}
