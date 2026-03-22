export function VoteTicker({ city }: { city: string | null | undefined }) {
  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-white/5 py-3">
      <div className="animate-ticker whitespace-nowrap px-4 text-sm uppercase tracking-[0.28em] text-white/55">
        {city ? `Opinión desde ${city}` : "Pulso ciudadano en tiempo real"}
      </div>
    </div>
  );
}
