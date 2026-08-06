"use client";
import type { SynergyBreakdown } from "@/lib/types/acquisition";
import { fmt } from "@/lib/utils/format";

interface SynergyBreakdownCardProps {
  data: SynergyBreakdown;
}

export function SynergyBreakdownCard({ data }: SynergyBreakdownCardProps) {
  const maxSavings = Math.max(...data.lines.map((l) => l.annualSavings), 1);

  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-4">
        Combined Annual Synergy
      </h3>

      <div className="text-3xl font-bold text-emerald-400 mb-4">
        {fmt(data.totalAnnualSynergy)}
      </div>

      <div className="space-y-3">
        {data.lines.map((line) => (
          <div key={line.label}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm text-surface-200">{line.label}</span>
                <p className="text-[11px] text-surface-500">{line.detail}</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400">
                {fmt(line.annualSavings)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                style={{ width: `${(line.annualSavings / maxSavings) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
