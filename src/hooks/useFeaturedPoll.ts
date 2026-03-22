"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";
import { toPoll } from "@/lib/firebase/firestore";
import type { Poll } from "@/types";

export function useFeaturedPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const target = query(collection(db, "polls"), where("isPublic", "==", true));

    return onSnapshot(
      target,
      (snapshot) => {
        const items = snapshot.docs.map((item) => toPoll(item.id, item.data()));
        const livePoll = items.find((item) => item.status === "live");
        setPoll(livePoll ?? items[0] ?? null);
        setLoading(false);
      },
      () => {
        setPoll(null);
        setLoading(false);
      }
    );
  }, []);

  return { poll, loading };
}
