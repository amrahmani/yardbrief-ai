import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "plain" | "forest" | "sand";
}

const toneClasses = {
  plain: "bg-white/90 text-charcoal",
  forest: "bg-forest text-white",
  sand: "bg-sand/75 text-charcoal",
};

export function StatCard({
  label,
  value,
  detail,
  tone = "plain",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/70 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(23,55,44,0.6)]",
        toneClasses[tone],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{detail}</p>
    </div>
  );
}
