"use client";
import type { RollupStrategy } from "@/lib/types/acquisition";
import { fmt } from "@/lib/utils/format";

interface RollupStrategySectionProps {
  rollup: RollupStrategy;
}

function MetricCard({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4 text-center">
      <div className="text-xs text-surface-400 mb-1">{label}</div>
      <div className={`text-lg font-bold text-white capitalize ${valueClass ?? ""}`}>{value}</div>
      {sub && <div className="text-xs text-surface-500">{sub}</div>}
    </div>
  );
}

export function RollupStrategySection({ rollup }: RollupStrategySectionProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/[0.08] to-white/[0.02] p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Roll-Up Acquisition Strategy</h2>
          <p className="text-sm text-surface-400 mt-1">Target recommendations based on your current profile</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-medium ${rollup.eligible ? "bg-emerald-400/10 text-emerald-200 border-emerald-400/20" : "bg-amber-400/10 text-amber-200 border-amber-400/20"}`}>
          {rollup.eligible ? "Acquisition Ready" : "Build Fundamentals First"}
        </div>
      </div>

      {rollup.eligible ? (
        <>
          {/* Tier Info */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <MetricCard label="Client Tier" value={rollup.clientTier} sub={`${fmt(rollup.clientRevenue)} revenue`} />
            <MetricCard label="Target Tier" value={rollup.targetTier} sub={`${rollup.targetCount} acquisition${rollup.targetCount > 1 ? "s" : ""}`} />
            <MetricCard label="Target Revenue" value={`${fmt(rollup.recommendedTargetRevenue.min)} - ${fmt(rollup.recommendedTargetRevenue.max)}`} sub={`${rollup.synergySavingsPct}% synergy savings`} />
          </div>

          {/* Pro-Forma Metrics */}
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <MetricCard label="Pro-Forma Revenue" value={fmt(rollup.proFormaRevenue)} />
            <MetricCard label="Pro-Forma EBITDA" value={fmt(rollup.proFormaEbitda)} />
            <MetricCard label="Combined EV" value={fmt(rollup.combinedEnterpriseValue)} />
            <MetricCard label="Combined Multiple" value={`${rollup.combinedMultiple}x`} valueClass="text-emerald-400" />
          </div>

          {/* Multiple Trajectory */}
          <div className="rounded-xl border border-white/10 bg-surface-900/30 p-4 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-4">Multiple Expansion Trajectory</h3>
            <div className="space-y-3">
              {rollup.multipleTrajectory.map((point, i) => {
                const pct = ((point.multiple - rollup.currentMultiple) / (rollup.ceilingAfterRollup - rollup.currentMultiple)) * 100;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-40 text-xs text-surface-400 shrink-0">{point.label}</span>
                    <div className="flex-1 h-4 rounded-full bg-surface-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all" style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                    <span className="w-24 text-right text-sm font-bold text-white">{point.multiple}x</span>
                    <span className="w-28 text-right text-xs text-surface-400">{fmt(point.enterpriseValue)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-brand-400/20 bg-brand-400/5 p-4 text-center mb-4">
            <span className="text-sm text-surface-300">
              Multiple ceiling achievable: <span className="font-bold text-emerald-400">{rollup.ceilingAfterRollup}x</span>  - 
              From {rollup.currentMultiple}x to {rollup.ceilingAfterRollup}x through strategic roll-up
            </span>
          </div>

          {/* Risks */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">Risks & Considerations</h3>
            <ul className="space-y-1">
              {rollup.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-surface-900/30 p-6 text-center">
          <p className="text-sm text-surface-300">{rollup.eligibilityReason}</p>
        </div>
      )}
    </div>
  );
}
