"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useCandidateTrend } from "@/hooks/useCandidateTrend";

function formatDate(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

export function CandidateTrendChart({
  pollId,
  candidateId,
}: {
  pollId: string;
  candidateId: string;
}) {
  const { data, loading } = useCandidateTrend(pollId, candidateId);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-white/40">Cargando tendencia...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10">
        <p className="text-sm text-white/30">Sin datos de tendencia aún.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: formatDate(d.dateKey),
  }));

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/40">
        Tendencia de votos por día
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "12px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}
            formatter={(value: number, name: string) => [
              value,
              name === "positiveVotes" ? "Respaldos" : "Rechazos",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "positiveVotes" ? "Respaldos" : "Rechazos"
            }
            wrapperStyle={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
          />
          <Area
            type="monotone"
            dataKey="positiveVotes"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#colorPositive)"
            dot={false}
            activeDot={{ r: 4, fill: "#34d399" }}
          />
          <Area
            type="monotone"
            dataKey="negativeVotes"
            stroke="#fb7185"
            strokeWidth={2}
            fill="url(#colorNegative)"
            dot={false}
            activeDot={{ r: 4, fill: "#fb7185" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
