import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function StatsCounter({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-glow">
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}
