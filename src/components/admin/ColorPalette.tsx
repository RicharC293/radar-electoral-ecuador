"use client";

import { useState } from "react";

export function ColorPalette({
  name,
  defaultValue = "#1D9E75",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [color, setColor] = useState(defaultValue);

  return (
    <div className="flex items-center gap-3 md:col-span-2">
      <label
        className="relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-white/15 transition-transform hover:scale-110"
        style={{ backgroundColor: color }}
      >
        <input
          type="color"
          name={name}
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <div>
        <p className="text-sm text-white/45">Color del candidato</p>
        <p className="text-xs text-white/30">{color}</p>
      </div>
    </div>
  );
}
