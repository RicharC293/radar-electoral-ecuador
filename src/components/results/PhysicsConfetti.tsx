"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_COLORS = ["#1D9E75", "#EF9F27", "#378ADD", "#7F77DD", "#D85A30"];

export function PhysicsConfetti({
  trigger,
  candidateColors = [],
}: {
  trigger: string | null;
  candidateColors?: string[];
}) {
  const [batch, setBatch] = useState<number | null>(null);
  const colors = candidateColors.length > 0 ? candidateColors : DEFAULT_COLORS;

  useEffect(() => {
    if (!trigger) return;
    const key = Date.now();
    setBatch(key);
    const timer = setTimeout(() => setBatch(null), 3500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (batch === null) return null;

  return (
    <div key={batch} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const left = (i * 37 + 7) % 100;
        const color = colors[i % colors.length];
        // Deterministic pseudo-random values based on index
        const duration = 1.5 + ((i * 89) % 200) / 100; // 1.5 – 3.49 s
        const delay = ((i * 31) % 400) / 1000; // 0 – 0.39 s
        const size = 5 + (i * 7) % 7; // 5 – 11 px
        const isCircle = i % 2 === 0;

        return (
          <motion.span
            key={i}
            initial={{ y: -10, opacity: 1, rotate: 0 }}
            animate={{ y: 420, opacity: 0, rotate: 720 }}
            transition={{ duration, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: isCircle ? "50%" : "2px",
              display: "block",
            }}
          />
        );
      })}
    </div>
  );
}
