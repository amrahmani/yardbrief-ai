import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
  className?: string;
}

export function SectionCard({ children, className, ...props }: SectionCardProps) {
  return (
    <section
      {...props}
      className={cn(
        "rounded-[1.8rem] border border-white/80 bg-white/88 p-4 shadow-[0_24px_64px_-42px_rgba(23,55,44,0.62)] ring-1 ring-white/55 backdrop-blur sm:rounded-[2rem] sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
