"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

import { db } from "@/lib/firebase/config";
import { toCandidate } from "@/lib/firebase/firestore";
import type { Candidate } from "@/types";

/**
 * Single real-time hook that replaces both `useRealtimeCandidates` and `useRealtimeResults`.
 *
 * Returns:
 *  - `candidates` sorted by sortOrder (for voting grids)
 *  - `ranked` sorted by totalVotes desc (for results views)
 *  - `lastChange` candidateId of last modified doc (for confetti / highlight)
 */
export function useRealtimePollData(pollId: string | null) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [lastChange, setLastChange] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!pollId) {
      setCandidates([]);
      setLastChange(null);
      mounted.current = false;
      return;
    }

    const target = query(
      collection(db, "polls", pollId, "candidates"),
      orderBy("sortOrder", "asc")
    );

    return onSnapshot(
      target,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => toCandidate(doc.id, doc.data()));

        if (mounted.current) {
          const modified = snapshot
            .docChanges()
            .find((change) => change.type === "modified" && change.doc.exists());
          setLastChange(modified?.doc.id ?? null);
        }

        setCandidates(items);
        mounted.current = true;
      },
      () => {
        setCandidates([]);
        setLastChange(null);
        mounted.current = false;
      }
    );
  }, [pollId]);

  // Active candidates for voting grid (only active ones)
  const activeCandidates = useMemo(
    () => candidates.filter((c) => c.isActive),
    [candidates]
  );

  // Inactive-last sorter: active candidates sorted by votes, then inactive at the bottom
  function inactiveLast(a: Candidate, b: Candidate, voteFn: (c: Candidate) => number) {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return voteFn(b) - voteFn(a);
  }

  const ranked = useMemo(
    () => [...candidates].sort((a, b) => inactiveLast(a, b, (c) => c.totalVotes)),
    [candidates]
  );

  const rankedPositive = useMemo(
    () => [...candidates].sort((a, b) => inactiveLast(a, b, (c) => c.positiveVotes)),
    [candidates]
  );

  const rankedNegative = useMemo(
    () => [...candidates].sort((a, b) => inactiveLast(a, b, (c) => c.negativeVotes)),
    [candidates]
  );

  return { candidates, activeCandidates, ranked, rankedPositive, rankedNegative, lastChange };
}
