"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
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

    getDocs(target)
      .then((snapshot) => {
        setPolls(snapshot.docs.map((doc) => toPoll(doc.id, doc.data())));
      })
      .catch(() => setPolls([]))
      .finally(() => setLoading(false));
  }, []);

  return { polls, loading };
}
