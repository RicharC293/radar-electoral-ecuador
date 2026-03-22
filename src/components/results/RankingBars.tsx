"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

export function RankingBars({
  results,
  lastChange
}: {
  results: Candidate[];
  lastChange: string | null;
}) {
  return (
    <div className="space-y-3">
      {results.map((item, index) => (
        <motion.div
          key={item.id}
          layout
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          animate={{
            backgroundColor:
              lastChange === item.id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: item.color }}>
              {item.photoUrl ? (
                <Image src={item.photoUrl} alt={item.fullName} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm font-semibold text-white">
                  {initialsFromName(item.fullName)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {index + 1}. {item.fullName}
                  </p>
                  <p className="truncate text-sm text-white/50">{item.party || "Sin casillero electoral"}</p>
                </div>
                <p className="text-sm font-semibold text-white/80">{item.totalVotes} votos</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  style={{
                    background: `linear-gradient(90deg, ${item.color}, rgba(255,255,255,0.95))`
                  }}
                />
              </div>
            </div>
            <div className="w-16 text-right text-lg font-semibold text-white">{item.percentage}%</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
