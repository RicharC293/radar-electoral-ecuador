"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";

export interface GlobalConfig {
  electionModeActive: boolean;
}

const defaultConfig: GlobalConfig = {
  electionModeActive: false,
};

export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "config", "global");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setConfig(
          snap.exists()
            ? { electionModeActive: snap.data().electionModeActive === true }
            : defaultConfig
        );
        setLoading(false);
      },
      () => {
        // Permission denied or network error — fall back to defaults
        setConfig(defaultConfig);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { config, loading };
}
