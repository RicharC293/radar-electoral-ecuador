import { CandidatesManager } from "@/components/admin/CandidatesManager";

export default function AdminCandidatesPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Candidatos</p>
        <h1 className="text-4xl font-semibold text-white">Gestion de candidaturas</h1>
        <p className="max-w-3xl text-white/60">
          Selecciona una encuesta, crea candidatos y ajusta el orden o su estado operativo.
        </p>
      </div>
      <CandidatesManager />
    </section>
  );
}
