"use client";
import { readinessLabel, scoreTextColor } from "@/lib/constants/styling";
import { magnitudeColor, signalDotColor } from "@/lib/constants/styling";
import type { EnterpriseValuation, ValueDriver } from "@/lib/types/acquisition";
import { fmt, mult } from "@/lib/utils/format";

interface ValuationHeroProps {
  val: EnterpriseValuation;
}

export function ValuationHero({ val }: ValuationHeroProps) {
  const w = val.valuation;
  const trendToday = w.enterpriseValueToday;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
      {/* Primary KPI cluster - Enterprise Value dominates */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        {/* Left: EV + Trends */}
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
            Enterprise Value
          </span>
          <div className="flex items-baseline gap-4 mt-1">
            <span className="text-5xl font-bold text-white tracking-tight">
              {fmt(w.enterpriseValue)}
            </span>
            <span className={`text-base font-semibold ${trendToday >= 0 ? "text-brand-400" : "text-red-400"}`}>
              {trendToday >= 0 ? "↑" : "↓"} {fmt(Math.abs(trendToday))} today
            </span>
          </div>
          <div className="flex gap-4 mt-1 text-sm">
            <span className="text-brand-400/80">↑ {fmt(w.enterpriseValueWeek)} this week</span>
            <span className="text-brand-400/80">↑ {fmt(w.enterpriseValueQuarter)} this quarter</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-surface-400">
            <span>Updated {new Date(w.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
            <span className={val.valuationReadiness === "high" ? "text-brand-300" : "text-amber-400"}>
              {readinessLabel(val.valuationReadiness)}
            </span>
          </div>
        </div>

        {/* Right: EBITDA + Multiple */}
        <div className="flex gap-8 shrink-0">
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-surface-500">EBITDA</span>
            <div className="text-2xl font-bold text-white mt-1">
              {fmt(w.ebitda)}
            </div>
            <span className="text-xs text-surface-400">{w.ebitdaMarginPct.toFixed(1)}% margin</span>
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-surface-500">Multiple</span>
            <div className="text-2xl font-bold text-brand-300 mt-1">
              {mult(w.currentMultiple)}
            </div>
            <span className="text-xs text-surface-400">Benchmark {mult(w.benchmarkMultiple)}</span>
          </div>
        </div>
      </div>

      {/* Multiple Range Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
          <span>{mult(w.multipleRange.floor)}</span>
          <span className="text-brand-300 font-semibold">
            {mult(w.currentMultiple)} - {w.multiplePercentile}% percentile
          </span>
          <span>{mult(w.multipleRange.ceiling)}</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-surface-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-red-500/40 via-amber-500/40 via-brand-400 to-emerald-400 transition-all duration-1000"
            style={{ width: `${w.multiplePercentile}%` }} />
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
              <div className="text-xs text-surface-500">{mult(scenario.multiple)}</div>
            </div>
          );
        })}
      </div>

      {/* Value Drivers with trends */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {Object.entries(val.valueDrivers).map(([key, driver]: [string, ValueDriver]) => (
          <div key={key} className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${scoreTextColor(driver.score)}`}>{driver.score}/100</span>
                <span className={`text-xs ${driver.scoreTrend >= 0 ? "text-brand-400" : "text-red-400"}`}>
                  {driver.scoreTrend >= 0 ? "↑" : "↓"}{Math.abs(driver.scoreTrend)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-800">
              <div className="h-full rounded-full bg-brand-400 transition-all" style={{ width: `${driver.score}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-surface-500">
              <span>{driver.detail}</span>
              <span>Weight: {(driver.weight * 100).toFixed(0)}%</span>
            </div>
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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">Risk Factors</h3>
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
