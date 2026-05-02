import Link from "next/link";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-white/75 bg-white/86 px-3 py-2 shadow-[0_18px_50px_-30px_rgba(23,55,44,0.55)] ring-1 ring-white/45 backdrop-blur",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,var(--forest),var(--forest-deep))] text-sm font-semibold text-white">
        YB
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold text-charcoal">YardBrief AI</span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.26em] text-stone">
          SpaceBrief pilot
        </span>
      </span>
    </Link>
  );
}
