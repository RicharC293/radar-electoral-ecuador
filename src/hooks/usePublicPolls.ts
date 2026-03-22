"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";
import { toPoll } from "@/lib/firebase/firestore";
import type { Poll } from "@/types";

export function usePublicPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const target = query(
      collection(db, "polls"),
      where("isPublic", "==", true),
      where("status", "==", "live")
    );

    return onSnapshot(
      target,
      (snapshot) => {
        setPolls(snapshot.docs.map((doc) => toPoll(doc.id, doc.data())));
        setLoading(false);
      },
      () => {
        setPolls([]);
        setLoading(false);
      }
    );
  }, []);

  return { polls, loading };
}
