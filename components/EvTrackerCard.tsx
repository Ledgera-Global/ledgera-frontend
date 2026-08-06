"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type Driver = { label: string; change: string; impact: number };
type TrendPoint = { periodLabel: string; enterpriseValue: number; ebitda: number; multiple: number };

type EvTrackerData = {
  currentValue: number;
  ebitda: number;
  multiple: number;
  trend: TrendPoint[];
  drivers: Driver[];
};

const FALLBACK: EvTrackerData = {
  currentValue: 11_200_000,
  ebitda: 1_600_000,
  multiple: 7.0,
  trend: [
    { periodLabel: "Today", enterpriseValue: 11200000, ebitda: 1600000, multiple: 7.0 },
    { periodLabel: "30 Days Ago", enterpriseValue: 10800000, ebitda: 1550000, multiple: 6.97 },
    { periodLabel: "12 Months Ago", enterpriseValue: 8900000, ebitda: 1300000, multiple: 6.85 },
  ],
  drivers: [
    { label: "EBITDA Growth", change: "+$300K", impact: 1400000 },
    { label: "Margin Improvement", change: "+2.1%", impact: 500000 },
    { label: "Recurring Revenue Growth", change: "+8%", impact: 250000 },
    { label: "Reduced Callback Rate", change: "-3%", impact: 150000 },
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v >= 1_000_000 ? 1 : 0,
    notation: v >= 1_000_000 ? "compact" : "standard",
  }).format(v);
}

type EvTrackerCardProps = { companyId: string };

export default function EvTrackerCard({ companyId }: EvTrackerCardProps) {
  const [data, setData] = useState<EvTrackerData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/value-tracker/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<EvTrackerData>(url, FALLBACK);
      if (!cancelled) { setData(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;
  const today = d.trend[0];
  const ago12m = d.trend[2];
  const valueCreated = today.enterpriseValue - ago12m.enterpriseValue;

  return (
    <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Enterprise Value Tracker</h3>
      </div>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-3/4 rounded bg-surface-800" />
          <div className="h-4 w-full rounded bg-surface-800" />
          <div className="h-10 w-full rounded bg-surface-800" />
        </div>
      ) : (
        <>
          {/* Three-number primary display */}
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-surface-900/60 p-4 text-sm">
            <span className="font-semibold text-white">EBITDA {fmt(d.ebitda)}</span>
            <span className="text-surface-500">×</span>
            <span className="font-semibold text-brand-400">Multiple {d.multiple.toFixed(1)}x</span>
            <span className="text-surface-500">=</span>
            <span className="font-semibold text-emerald-400">EV {fmt(today.enterpriseValue)}</span>
          </div>

          {/* Trend comparison */}
          <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-surface-900/50 p-3">
            {d.trend.map((t) => (
              <div key={t.periodLabel} className="text-center">
                <p className="text-xs uppercase tracking-wider text-surface-400">
                  {t.periodLabel === "Today" ? "Today" : t.periodLabel}
                </p>
                <p className={`mt-1 text-base font-bold ${t.periodLabel === "Today" ? "text-white" : "text-surface-300"}`}>
                  {fmt(t.enterpriseValue)}
                </p>
              </div>
            ))}
          </div>

          {/* Value Created */}
          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-surface-400">Value Created</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              +{fmt(valueCreated)} <span className="text-sm font-normal text-surface-400">over 12 months</span>
            </p>
          </div>

          {/* Driver breakdown */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-surface-400 mb-3">
              What drove the increase
            </h4>
            <div className="space-y-2">
              {d.drivers.map((driver) => (
                <div
                  key={driver.label}
                  className="flex items-center justify-between rounded-xl bg-surface-900/30 px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm text-surface-300">{driver.label}</p>
                    <p className="text-xs text-surface-500">{driver.change}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">+{fmt(driver.impact)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
