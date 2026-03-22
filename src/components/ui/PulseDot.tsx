export function PulseDot() {
  return (
    <span className="relative inline-flex size-3">
      <span className="absolute inline-flex h-full w-full animate-pulseSoft rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-3 rounded-full bg-emerald-300" />
    </span>
  );
}
