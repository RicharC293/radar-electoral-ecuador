"use client";

import { useEffect, useState } from "react";

export function useConfetti(trigger: string | null) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) {
      return;
    }

    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 2500);

    return () => window.clearTimeout(timer);
  }, [trigger]);

  return active;
}
