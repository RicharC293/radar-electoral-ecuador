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
 *  - `candidates` in a random order shuffled once per page load (for voting grids)
 *  - `ranked` sorted by totalVotes desc (for results views)
 *  - `lastChange` candidateId of last modified doc (for confetti / highlight)
 */
export function useRealtimePollData(pollId: string | null) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [lastChange, setLastChange] = useState<string | null>(null);
  const mounted = useRef(false);
  // Shuffle order set once on first data arrival — not reset by real-time updates
  const shuffledOrderRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (!pollId) {
      setCandidates([]);
      setLastChange(null);
      mounted.current = false;
      shuffledOrderRef.current = null;
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
        } else if (items.length > 0) {
          // First load: build a random order and keep it stable for subsequent updates
          const ids = items.map((c) => c.id);
          for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
          }
          shuffledOrderRef.current = ids;
        }

        // Apply stable shuffle order if available
        if (shuffledOrderRef.current) {
          const order = shuffledOrderRef.current;
          setCandidates([...items].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)));
        } else {
          setCandidates(items);
        }

        mounted.current = true;
      },
      () => {
        setCandidates([]);
        setLastChange(null);
        mounted.current = false;
        shuffledOrderRef.current = null;
      }
    );
  }, [pollId]);

  // Active candidates for voting grid (only active ones, preserves shuffle order)
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
