import type { ReactNode } from "react";

import { MarketingNav } from "@/components/layout/marketing-nav";
import { platformRoadmap } from "@/lib/mock-data";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-charcoal/8 bg-[rgba(255,253,248,0.75)]">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone">
              Built for the SpaceBrief roadmap
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-stone">
              YardBrief AI is the first product in a broader brief-generation platform. This
              starter keeps the brand and app shell ready for DecorBrief, KitchenBrief, and
              EventBrief without implementing them yet.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {platformRoadmap.map((product) => (
              <div
                key={product.name}
                className="rounded-[1.6rem] border border-white/75 bg-white/80 px-4 py-4 shadow-[0_18px_50px_-40px_rgba(23,55,44,0.55)]"
              >
                <p className="font-semibold text-charcoal">{product.name}</p>
                <p className="mt-1 text-sm text-stone">{product.audience}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                  {product.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
