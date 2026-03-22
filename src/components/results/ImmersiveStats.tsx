import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { Poll } from "@/types";

export function ImmersiveStats({ poll }: { poll: Poll }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <div className="rounded-lg px-[14px] py-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>
        <p className="mb-1 text-xs text-white/50">Opiniones</p>
        <p className="text-xl font-bold text-white">
          <AnimatedNumber value={poll.totalVotes} />
        </p>
      </div>

      <div className="rounded-lg px-[14px] py-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>
        <p className="mb-1 text-xs text-white/50">Participantes hoy</p>
        <p className="text-xl font-bold" style={{ color: "#1D9E75" }}>
          <AnimatedNumber value={poll.totalVotersToday} />
        </p>
      </div>

      <div className="rounded-lg px-[14px] py-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>
        <p className="mb-1 text-xs text-white/50">Provincias</p>
        <p className="text-xl font-bold" style={{ color: "#EF9F27" }}>
          <AnimatedNumber value={poll.uniqueProvinces} />
        </p>
      </div>
    </div>
  );
}
