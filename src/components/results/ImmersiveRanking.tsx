"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { formatNumber, initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

export function ImmersiveRanking({
  results,
  lastChange,
}: {
  results: Candidate[];
  lastChange: string | null;
}) {
  return (
    <div>
      <p className="mb-4 text-xs uppercase text-white/30" style={{ letterSpacing: "0.15em" }}>
        Ranking Completo
      </p>
      <div className="space-y-2">
        {results.map((item) => (
          <motion.div
            key={item.id}
            layout
            animate={{
              backgroundColor:
                lastChange === item.id
                  ? `${item.color}1F`
                  : "rgba(255,255,255,0.04)",
            }}
            transition={{ backgroundColor: { duration: 0.8 } }}
            className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.08]"
          >
            <div
              className="relative shrink-0 overflow-hidden rounded-full"
              style={{
                width: 28,
                height: 28,
                background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`,
              }}
            >
              {item.photoUrl ? (
                <Image
                  src={item.photoUrl}
                  alt={item.fullName}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-white">
                  {initialsFromName(item.fullName)}
                </div>
              )}
            </div>

            <p className="shrink-0 text-white" style={{ fontSize: 13, minWidth: 100 }}>
              {item.fullName}
            </p>

            <div
              className="flex-1 overflow-hidden rounded-[6px]"
              style={{ height: 28, background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="flex h-full items-center px-2"
                initial={false}
                animate={{ width: `${Math.max(item.percentage, 2)}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${item.color}DD, ${item.color}77)`,
                  minWidth: item.percentage > 0 ? 36 : 0,
                }}
              >
                <span className="whitespace-nowrap text-xs font-medium text-white">
                  {item.percentage}%
                </span>
              </motion.div>
            </div>

            <p className="shrink-0 text-xs text-white/50">{formatNumber(item.totalVotes)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
