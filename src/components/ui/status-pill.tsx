import { cn } from "@/lib/utils";

interface StatusPillProps {
  label: string;
}

function getTone(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("live") || normalized.includes("active") || normalized.includes("ready")) {
    return "bg-forest/10 text-forest ring-forest/15";
  }

  if (normalized.includes("shared") || normalized.includes("review")) {
    return "bg-charcoal/8 text-charcoal ring-charcoal/10";
  }

  return "bg-sand/70 text-charcoal ring-sand/80";
}

export function StatusPill({ label }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ring-1",
        getTone(label),
      )}
    >
      {label}
    </span>
  );
}
