import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  highlights?: string[];
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  highlights,
}: PageIntroProps) {
  return (
    <div className="rounded-[1.9rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,253,248,0.98),rgba(232,244,236,0.84))] p-5 shadow-[0_28px_72px_-46px_rgba(23,55,44,0.68)] ring-1 ring-white/55 sm:rounded-[2.2rem] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone">{eyebrow}</p>
          <div className="space-y-3">
            <h1 className="font-display text-4xl leading-tight text-charcoal sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-stone sm:text-base">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
      </div>
      {highlights && highlights.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-[1.35rem] border border-white/75 bg-white/76 px-4 py-3 text-sm font-medium text-charcoal"
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
