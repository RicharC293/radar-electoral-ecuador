export function ConfettiLayer({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, index) => (
        <span
          key={index}
          className="absolute block h-3 w-2 rounded-sm opacity-90"
          style={{
            left: `${(index * 17) % 100}%`,
            top: `${(index * 11) % 35}%`,
            backgroundColor: ["#1D9E75", "#EF9F27", "#378ADD", "#D85A30"][index % 4],
            transform: `rotate(${index * 13}deg) translateY(${index * 8}px)`,
            transition: "transform 2500ms ease-out, opacity 2500ms ease-out"
          }}
        />
      ))}
    </div>
  );
}
