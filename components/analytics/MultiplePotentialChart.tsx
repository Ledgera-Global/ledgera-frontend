"use client";
import type { MultiplePotential } from "@/lib/types/acquisition";
import { mult } from "@/lib/utils/format";

interface MultiplePotentialChartProps {
  data: MultiplePotential;
}

export function MultiplePotentialChart({ data }: MultiplePotentialChartProps) {
  const range = data.ceiling - data.floor;
  const currentPct = range > 0 ? ((data.currentMultiple - data.floor) / range) * 100 : 0;
  const projectedPct = range > 0 ? ((data.projectedMultiple - data.floor) / range) * 100 : 0;
  const trend = data.currentMultiple - data.previousMultiple;

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/40 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-4">
        Multiple Potential
      </h3>

      {/* Current vs Previous */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm text-surface-400">Current Multiple</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{mult(data.currentMultiple)}</span>
            <span className={`text-sm font-medium ${trend >= 0 ? "text-brand-400" : "text-red-400"}`}>
              {trend >= 0 ? "↑" : "↓"} {mult(Math.abs(trend))}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-surface-400">Yesterday</span>
          <div className="text-base font-semibold text-surface-300">{mult(data.previousMultiple)}</div>
        </div>
      </div>

      {/* Range bar */}
      <div className="relative h-8 mt-4">
        <div className="absolute inset-0 top-3 h-3 rounded-full bg-surface-800" />
        {/* Floor to ceiling gradient */}
        <div className="absolute top-3 h-3 rounded-full bg-gradient-to-r from-red-500/30 via-amber-500/30 via-brand-400/30 to-emerald-500/30"
          style={{ left: "0%", right: "0%" }}
        />
        {/* Tick marks */}
        <div className="absolute top-0 w-full flex justify-between text-[10px] text-surface-500">
          <span>{mult(data.floor)}</span>
          <span>{mult(data.ceiling)}</span>
        </div>
        {/* Current position indicator */}
        <div className="absolute top-2 flex flex-col items-center transition-all duration-700"
          style={{ left: `${currentPct}%`, transform: "translateX(-50%)" }}>
          <div className="h-5 w-0.5 bg-white rounded-full" />
          <div className="mt-1 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white font-semibold whitespace-nowrap">
            Current
          </div>
        </div>
        {/* Projected position indicator */}
        <div className="absolute top-2 flex flex-col items-center transition-all duration-1000"
          style={{ left: `${projectedPct}%`, transform: "translateX(-50%)" }}>
          <div className="h-5 w-0.5 bg-brand-400 rounded-full" />
          <div className="mt-1 rounded bg-brand-400/20 px-2 py-0.5 text-[10px] text-brand-300 font-semibold whitespace-nowrap">
            Projected {mult(data.projectedMultiple)}
          </div>
        </div>
      </div>

      {/* Mid-range labels */}
      <div className="flex justify-between text-[10px] text-surface-600 mt-2">
        <span>2-4x Small owner-operated</span>
        <span>4-6x Independent</span>
        <span>6-9x Regional</span>
        <span>9-12x Platform</span>
        <span>12-15x Premium</span>
      </div>

      {/* Factors */}
      <div className="mt-5 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
          What drives the multiple
        </h4>
        {data.factors.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex-1">
              <span className="text-sm text-surface-300">{f.label}</span>
              <span className="ml-2 text-[11px] text-surface-500">{f.detail.substring(0, 60)}</span>
            </div>
            <span className={`text-sm font-bold shrink-0 ml-3 ${f.impact >= 0 ? "text-brand-400" : "text-red-400"}`}>
              {f.impact >= 0 ? "+" : ""}{f.impact.toFixed(1)}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
