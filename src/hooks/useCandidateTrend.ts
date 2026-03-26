"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";

export interface TrendDataPoint {
  dateKey: string;
  positiveVotes: number;
  negativeVotes: number;
  totalVotes: number;
}

export function useCandidateTrend(pollId: string | null, candidateId: string | null) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pollId || !candidateId) {
      setData([]);
      return;
    }

    setLoading(true);

    const dailyRef = collection(
      db,
      "polls", pollId,
      "candidateStats", candidateId,
      "daily"
    );

    getDocs(query(dailyRef, orderBy("dateKey", "asc")))
      .then((snap) => {
        const points: TrendDataPoint[] = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            dateKey: d.dateKey as string,
            positiveVotes: Number(d.positiveVotes ?? 0),
            negativeVotes: Number(d.negativeVotes ?? 0),
            totalVotes: Number(d.totalVotes ?? 0),
          };
        });
        setData(points);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [pollId, candidateId]);

  return { data, loading };
}
