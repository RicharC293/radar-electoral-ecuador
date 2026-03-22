interface AnimatedRingProps {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function AnimatedRing({ value, color, size = 160, strokeWidth: sw, children }: AnimatedRingProps) {
  const strokeWidth = sw ?? 10;
  // When a custom strokeWidth is provided, pad by strokeWidth+4; otherwise keep original 10px padding
  const padding = sw != null ? strokeWidth + 4 : 10;
  const radius = size / 2 - padding;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
