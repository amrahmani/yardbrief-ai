import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InlineMessageTone = "success" | "error" | "info" | "warning";

interface InlineMessageProps {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: InlineMessageTone;
}

const toneClasses: Record<InlineMessageTone, string> = {
  success: "border-forest/12 bg-forest/6 text-forest",
  error: "border-[#8A3F31]/16 bg-[#8A3F31]/6 text-[#8A3F31]",
  info: "border-charcoal/10 bg-white/88 text-charcoal",
  warning: "border-amber-200 bg-amber-50/85 text-charcoal",
};

export function InlineMessage({
  children,
  className,
  title,
  tone = "info",
}: InlineMessageProps) {
  return (
    <div
      className={cn(
        "rounded-[1.45rem] border px-4 py-4 shadow-[0_16px_40px_-34px_rgba(23,55,44,0.45)]",
        toneClasses[tone],
        className,
      )}
    >
      {title ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">{title}</p>
      ) : null}
      <div
        className={cn(
          "text-sm leading-7",
          title ? "mt-2" : "",
        )}
      >
        {children}
      </div>
    </div>
  );
}
