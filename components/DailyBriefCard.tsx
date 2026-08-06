"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type DailyBriefData = {
  financialHealth: {
    grossMarginToday: number;
    ebitdaToday: number;
    revenuePace: number;
    cashRunway: number;
    payrollRisk: "low" | "medium" | "high";
  };
  operationalIntelligence: {
    technicianProfitability: number;
    branchRankings: number;
    callbackCost: number;
    membershipHealth: number;
    truckUtilization: number;
  };
  aiAlerts: string[];
};

const FALLBACK: DailyBriefData = {
  financialHealth: {
    grossMarginToday: 42.5,
    ebitdaToday: 185_000,
    revenuePace: 920_000,
    cashRunway: 14,
    payrollRisk: "low",
  },
  operationalIntelligence: {
    technicianProfitability: 78,
    branchRankings: 3,
    callbackCost: 12_400,
    membershipHealth: 84,
    truckUtilization: 71,
  },
  aiAlerts: [
    "Revenue pacing 8% ahead of forecast this month",
    "Tech #3 idle rate increased 12% — investigate dispatch gaps",
    "Callback cost trending 5% lower week-over-week",
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function pct(v: number) {
  return v.toFixed(1) + "%";
}

type DailyBriefCardProps = { companyId: string };

export default function DailyBriefCard({ companyId }: DailyBriefCardProps) {
  const [data, setData] = useState<DailyBriefData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/daily-brief/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<DailyBriefData>(url, FALLBACK);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;

  const payrollRiskColor =
    d.financialHealth.payrollRisk === "low"
      ? "text-emerald-400"
      : d.financialHealth.payrollRisk === "medium"
      ? "text-amber-400"
      : "text-red-400";

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          AI Daily Brief
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          AI Daily Brief
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-4 w-full rounded bg-surface-800" />
            <div className="h-20 w-full rounded bg-surface-800" />
          </div>
        ) : (
          <>
            {/* Financial Health */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-surface-400 mb-3">
                Financial Health
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Gross Margin</p>
                  <p className="mt-1 text-base font-semibold text-emerald-400">{pct(d.financialHealth.grossMarginToday)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">EBITDA Today</p>
                  <p className="mt-1 text-base font-semibold text-white">{fmt(d.financialHealth.ebitdaToday)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Revenue Pace</p>
                  <p className="mt-1 text-base font-semibold text-white">{fmt(d.financialHealth.revenuePace)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Cash Runway</p>
                  <p className="mt-1 text-base font-semibold text-white">{d.financialHealth.cashRunway} mo</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Payroll Risk</p>
                  <p className={`mt-1 text-base font-semibold ${payrollRiskColor}`}>
                    {d.financialHealth.payrollRisk.charAt(0).toUpperCase() + d.financialHealth.payrollRisk.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Intelligence */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-surface-400 mb-3">
                Operational Intelligence
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Tech Profitability</p>
                  <p className="mt-1 text-base font-semibold text-white">{d.operationalIntelligence.technicianProfitability}%</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Branch Rankings</p>
                  <p className="mt-1 text-base font-semibold text-brand-400">#{d.operationalIntelligence.branchRankings}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Callback Cost</p>
                  <p className="mt-1 text-base font-semibold text-red-400">{fmt(d.operationalIntelligence.callbackCost)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Membership Health</p>
                  <p className="mt-1 text-base font-semibold text-emerald-400">{d.operationalIntelligence.membershipHealth}%</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-surface-900/40 p-3 text-center">
                  <p className="text-xs text-surface-400">Truck Utilization</p>
                  <p className="mt-1 text-base font-semibold text-white">{d.operationalIntelligence.truckUtilization}%</p>
                </div>
              </div>
            </div>

            {/* AI Alerts */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-surface-400 mb-3">
                AI Alerts
              </h3>
              <div className="space-y-2">
                {d.aiAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3"
                  >
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-surface-200">{alert}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}