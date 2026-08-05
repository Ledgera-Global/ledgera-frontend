"use client";
import { MultiBar } from "@/components/analytics/MultiBar";
import { readinessLabel, scoreTextColor } from "@/lib/constants/styling";
import { magnitudeColor, signalDotColor } from "@/lib/constants/styling";
import type { EnterpriseValuation, ValueDriver } from "@/lib/types/acquisition";
import { fmt } from "@/lib/utils/format";

interface ValuationHeroProps {
  val: EnterpriseValuation;
}

export function ValuationHero({ val }: ValuationHeroProps) {
  const w = val.valuation;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Enterprise Value</h2>
          <p className="text-sm text-surface-400 mt-1">
            Updated {new Date(val.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} &middot;
            Based on real connected data &middot;
            <span className="text-amber-400 font-medium"> {readinessLabel(val.valuationReadiness)}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">{fmt(w.enterpriseValue)}</div>
          <div className="text-sm text-surface-400 mt-1">
            {w.currentMultiple}x EBITDA &middot; {fmt(w.ebitda)} EBITDA
          </div>
        </div>
      </div>

      {/* Multiple Range Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
          <span>{fmt(w.multipleRange.floor)}x</span>
          <span className="text-brand-300 font-semibold">
            {w.currentMultiple}x &mdash; {w.multiplePercentile}% percentile
          </span>
          <span>{fmt(w.multipleRange.ceiling)}x</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-surface-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-1000" style={{ width: `${w.multiplePercentile}%` }} />
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {Object.entries(val.scenarios).map(([key, scenario]) => {
          const isCurrent = scenario.multiple === w.currentMultiple;
          return (
            <div key={key} className={`rounded-xl border p-4 text-center transition-all ${isCurrent ? "border-brand-400/40 bg-brand-400/10" : "border-white/10 bg-surface-900/30"}`}>
              <div className="text-xs text-surface-400 mb-1 capitalize">{key}</div>
              <div className="text-lg font-bold text-white">{fmt(scenario.enterpriseValue)}</div>
              <div className="text-xs text-surface-500">{scenario.multiple}x</div>
            </div>
          );
        })}
      </div>

      {/* Value Drivers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {Object.entries(val.valueDrivers).map(([key, driver]: [string, ValueDriver]) => (
          <div key={key} className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className={`text-sm font-bold ${scoreTextColor(driver.score)}`}>{driver.score}/100</span>
            </div>
            <MultiBar val={driver.score} max={100} />
            <div className="flex items-center justify-between mt-2 text-[11px] text-surface-500">
              <span>{driver.detail}</span>
              <span>Weight: {(driver.weight * 100).toFixed(0)}%</span>
            </div>
            {driver.benchmark && (
              <div className="mt-2 text-[10px] text-surface-600 italic border-t border-white/5 pt-2">{driver.benchmark}</div>
            )}
          </div>
        ))}
      </div>

      {/* Signals */}
      <div className="rounded-xl border border-white/10 bg-surface-900/30 p-4 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Valuation Signals ({val.signals.length})</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {val.signals.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-surface-300">
              <span className={`mt-1 inline-flex h-2 w-2 shrink-0 rounded-full ${signalDotColor(s.type)}`} />
              <div className="flex-1">
                <span className="block font-semibold text-surface-100">{s.metric}</span>
                <span className="text-xs">{s.message.substring(0, 80)}...</span>
                {s.magnitude !== 0 && (
                  <span className={`block text-xs mt-1 font-mono ${magnitudeColor(s.magnitude)}`}>
                    {s.magnitude > 0 ? "+" : ""}{s.magnitude} bps
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      {val.riskFactors.length > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">M&A Due Diligence Risks</h3>
          <ul className="space-y-1">
            {val.riskFactors.map((risk, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
