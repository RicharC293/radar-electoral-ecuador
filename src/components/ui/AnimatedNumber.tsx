"use client";

import { useEffect, useRef, useState } from "react";

import { formatNumber } from "@/lib/utils";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const origin = previousValue.current;
    const diff = value - origin;
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - start) / 600, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(origin + diff * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    previousValue.current = value;

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{formatNumber(displayValue)}</span>;
}
