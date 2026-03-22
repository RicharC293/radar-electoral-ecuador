import Image from "next/image";

import { AnimatedRing } from "@/components/ui/AnimatedRing";
import { PodiumPedestal } from "@/components/ui/PodiumPedestal";
import { initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

const pedestalHeights = ["h-32", "h-44", "h-24"];

export function LivePodium({ results }: { results: Candidate[] }) {
  const topThree = [results[1], results[0], results[2]].filter(
    (item): item is Candidate => Boolean(item)
  );

  return (
    <div className="grid gap-6 md:grid-cols-3 md:items-end">
      {topThree.map((item, index) => (
        <div key={item.id} className="flex flex-col items-center gap-4">
          <div className={index === 1 ? "animate-pulseSoft" : ""}>
            <AnimatedRing value={item.percentage} color={item.color} size={index === 1 ? 190 : 160}>
              <div
                className="relative size-24 overflow-hidden rounded-full"
                style={{ backgroundColor: item.color }}
              >
                {item.photoUrl ? (
                  <Image src={item.photoUrl} alt={item.fullName} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-semibold text-white">
                    {initialsFromName(item.fullName)}
                  </div>
                )}
              </div>
            </AnimatedRing>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{item.fullName}</p>
            <p className="text-sm text-white/50">{item.party || "Sin casillero electoral"}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{item.percentage}%</p>
            <p className="text-sm text-white/45">{item.totalVotes} votos</p>
          </div>
          <PodiumPedestal heightClassName={pedestalHeights[index] ?? "h-24"} color={item.color} />
        </div>
      ))}
    </div>
  );
}
