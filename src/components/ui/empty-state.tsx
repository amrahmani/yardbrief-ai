import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  action?: ReactNode;
  className?: string;
  description: string;
  eyebrow?: string;
  title: string;
}

export function EmptyState({
  action,
  className,
  description,
  eyebrow = "Nothing here yet",
  title,
}: EmptyStateProps) {
  return (
    <div className={cn("yb-empty-state text-center", className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-semibold text-forest shadow-[0_18px_35px_-24px_rgba(23,55,44,0.55)]">
        YB
      </div>
      <p className="mt-4 yb-kicker">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold text-charcoal sm:text-2xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone sm:text-base">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
