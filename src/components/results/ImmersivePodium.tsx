"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { AnimatedRing } from "@/components/ui/AnimatedRing";
import { formatNumber, initialsFromName } from "@/lib/utils";
import type { Candidate } from "@/types";

const RANK_CONFIG = [
  {
    ring: 110,
    sw: 5,
    avatarSize: 68,
    pctFontSize: 24,
    pedestalW: 60,
    pedestalH: 110,
    orderClass: "order-1 md:order-2",
  },
  {
    ring: 90,
    sw: 4,
    avatarSize: 54,
    pctFontSize: 18,
    pedestalW: 50,
    pedestalH: 80,
    orderClass: "order-2 md:order-1",
  },
  {
    ring: 80,
    sw: 3.5,
    avatarSize: 48,
    pctFontSize: 18,
    pedestalW: 50,
    pedestalH: 56,
    orderClass: "order-3 md:order-3",
  },
] as const;

export function ImmersivePodium({ results }: { results: Candidate[] }) {
  const top3 = results.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:justify-center md:gap-10">
      {top3.map((item, index) => {
        const cfg = RANK_CONFIG[index];
        const rank = index + 1;
        if (!cfg) return null;

        return (
          <motion.div
            key={item.id}
            className={`flex flex-col items-center gap-3 ${cfg.orderClass}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AnimatedRing
              value={item.percentage}
              color={item.color}
              size={cfg.ring}
              strokeWidth={cfg.sw}
            >
              <div
                className="relative overflow-hidden rounded-full"
                style={{
                  width: cfg.avatarSize,
                  height: cfg.avatarSize,
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}99)`,
                }}
              >
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.fullName}
                    fill
                    className="object-cover"
                    sizes={`${cfg.avatarSize}px`}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-semibold text-white"
                    style={{ fontSize: rank === 1 ? 18 : 14 }}
                  >
                    {initialsFromName(item.fullName)}
                  </div>
                )}
              </div>
            </AnimatedRing>

            <div className="text-center">
              <p className="font-medium text-white" style={{ fontSize: 13 }}>
                {item.fullName}
              </p>
              <p className="text-white/40" style={{ fontSize: 11 }}>
                {item.party}
              </p>
              <p
                className="mt-1 font-bold"
                style={{ color: item.color, fontSize: cfg.pctFontSize }}
              >
                {item.percentage}%
              </p>
              <p className="text-xs text-white/30">{formatNumber(item.totalVotes)} votos</p>
            </div>

            <div
              className="flex items-center justify-center rounded-t-lg border border-white/10 text-sm font-bold text-white/70"
              style={{
                width: cfg.pedestalW,
                height: cfg.pedestalH,
                background: `linear-gradient(180deg, ${item.color}88 0%, rgba(15,17,23,0.6) 100%)`,
              }}
            >
              {rank}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
