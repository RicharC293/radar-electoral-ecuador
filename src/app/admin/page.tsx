import { PollsManager } from "@/components/admin/PollsManager";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/45">Encuestas</p>
        <h1 className="text-4xl font-semibold text-white">CRUD de encuestas</h1>
        <p className="max-w-3xl text-white/60">
          Crea encuestas, cambia su estado, publícalas y salta directo a la gestión de candidatos.
        </p>
      </div>
      <PollsManager />
    </section>
  );
}
