"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase/config";
import { toPoll } from "@/lib/firebase/firestore";
import type { Poll } from "@/types";

import { FullscreenResults } from "./FullscreenResults";

export function ResultsPageShell({ slug }: { slug: string }) {
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    const target = query(
      collection(db, "polls"),
      where("slug", "==", slug),
      where("isPublic", "==", true)
    );

    return onSnapshot(target, (snapshot) => {
      const doc = snapshot.docs[0];
      setPoll(doc ? toPoll(doc.id, doc.data()) : null);
    });
  }, [slug]);

  if (!poll) {
    return (
      <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white/65">
        Cargando información...
      </section>
    );
  }

  return <FullscreenResults poll={poll} />;
}
