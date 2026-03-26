"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";

export interface GlobalConfig {
  electionModeActive: boolean;
}

const defaultConfig: GlobalConfig = {
  electionModeActive: false,
};

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

async function fetchGlobalConfig(): Promise<GlobalConfig> {
  try {
    const snap = await getDoc(doc(db, "config", "global"));
    if (!snap.exists()) return defaultConfig;
    return { electionModeActive: snap.data().electionModeActive === true };
  } catch {
    return defaultConfig;
  }
}

export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchGlobalConfig().then((c) => { setConfig(c); setLoading(false); });

    // Poll every 2 minutes instead of keeping a real-time listener open
    const interval = setInterval(() => {
      fetchGlobalConfig().then(setConfig);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { config, loading };
}
