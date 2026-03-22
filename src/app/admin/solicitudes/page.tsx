import { CandidateRequestsPanel } from "@/components/admin/CandidateRequestsPanel";

export default function AdminRequestsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Admin</p>
        <h1 className="text-3xl font-semibold text-white">Solicitudes de candidatos</h1>
        <p className="max-w-2xl text-white/60">
          Vista operativa de todas las solicitudes registradas en Firestore.
        </p>
      </div>
      <CandidateRequestsPanel />
    </section>
  );
}
