export function PodiumPedestal({
  heightClassName,
  color
}: {
  heightClassName: string;
  color: string;
}) {
  return (
    <div
      className={`w-full rounded-t-3xl border border-white/10 ${heightClassName}`}
      style={{
        background: `linear-gradient(180deg, ${color} 0%, rgba(15,17,23,0.65) 100%)`
      }}
    />
  );
}
