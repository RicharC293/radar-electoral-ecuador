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
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig({
          electionModeActive: data.electionModeActive === true,
        });
      } else {
        setConfig(defaultConfig);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { config, loading };
}
