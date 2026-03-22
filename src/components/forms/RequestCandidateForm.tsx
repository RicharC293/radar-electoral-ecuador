"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

import { db } from "@/lib/firebase/config";

export function RequestCandidateForm({ pollId }: { pollId: string | null }) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus(null);

    await addDoc(collection(db, "candidateRequests"), {
      pollId,
      requesterName: String(formData.get("requesterName") ?? ""),
      requesterContact: String(formData.get("requesterContact") ?? ""),
      candidateName: String(formData.get("candidateName") ?? ""),
      candidateParty: String(formData.get("candidateParty") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      status: "pending",
      createdAt: serverTimestamp()
    });

    setStatus("Propuesta enviada. ¡Gracias por participar!");
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="requesterName" placeholder="Tu nombre" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
        <input name="requesterContact" placeholder="Correo o WhatsApp" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
        <input name="candidateName" placeholder="Nombre del candidato" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
        <input name="candidateParty" placeholder="Partido o movimiento" className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
      </div>
      <textarea name="notes" placeholder="Notas" rows={4} className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none" />
      <button type="submit" className="rounded-2xl bg-white px-4 py-3 font-medium text-slate-950">
        Proponer candidato
      </button>
      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </form>
  );
}
