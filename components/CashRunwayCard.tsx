"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type CashRunwayData = {
  cashOnHand: number;
  netBurnRate: number;
  monthsOfRunway: number;
  payrollRisk: string;
  canMakePayroll: boolean;
  payrollAmount: number;
};

const FALLBACK: CashRunwayData = {
  cashOnHand: 185000,
  netBurnRate: -25000,
  monthsOfRunway: 3.2,
  payrollRisk: "MEDIUM",
  canMakePayroll: true,
  payrollAmount: 98000,
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

type Props = { companyId: string };

export default function CashRunwayCard({ companyId }: Props) {
  const [data, setData] = useState<CashRunwayData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/cash-runway/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<CashRunwayData>(url, FALLBACK);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;

  const rl = d.payrollRisk.toLowerCase();
  const riskColor =
    rl === "low"
      ? "bg-emerald-400/20 text-emerald-400"
      : rl === "medium"
      ? "bg-amber-400/20 text-amber-400"
      : "bg-red-400/20 text-red-400";

  const riskLabel =
    rl === "low"
      ? "Low Risk"
      : rl === "medium"
      ? "Medium Risk"
      : "High Risk";

  const runwayColor =
    d.monthsOfRunway >= 12
      ? "text-emerald-400"
      : d.monthsOfRunway >= 6
      ? "text-amber-400"
      : "text-red-400";

  const runwayBarWidth = Math.min((d.monthsOfRunway / 24) * 100, 100);
  const runwayBarColor =
    d.monthsOfRunway >= 12
      ? "bg-emerald-400"
      : d.monthsOfRunway >= 6
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          Cash Runway
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Cash Runway
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-4 w-full rounded bg-surface-800" />
            <div className="h-10 w-full rounded bg-surface-800" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cash on Hand */}
            <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
              <p className="text-xs uppercase tracking-wider text-surface-400">
                Cash on Hand
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {fmt(d.cashOnHand)}
              </p>
            </div>

            {/* Monthly Burn / Net Cash Flow */}
            <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
              <p className="text-xs uppercase tracking-wider text-surface-400">
                Monthly Burn
              </p>
              <p className="mt-1 text-2xl font-bold text-red-300">
                {fmt(Math.abs(d.netBurnRate))}
              </p>
            </div>

            {/* Months of Runway */}
            <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-surface-400">
                  Months of Runway
                </p>
                <p className={`text-2xl font-bold ${runwayColor}`}>
                  {d.monthsOfRunway}
                </p>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-surface-800">
                <div
                  className={`h-2 rounded-full ${runwayBarColor}`}
                  style={{ width: `${runwayBarWidth}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-surface-500">
                {d.monthsOfRunway >= 12
                  ? "Healthy runway"
                  : d.monthsOfRunway >= 6
                  ? "Moderate — monitor closely"
                  : "Critical — reduce burn rate"}
              </p>
            </div>

            {/* Payroll Risk Indicator */}
            <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
              <p className="text-xs uppercase tracking-wider text-surface-400">
                Payroll Risk
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${riskColor}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {riskLabel}
                </span>
                <p className="text-xs text-surface-400">
                  {rl === "low"
                    ? "Payroll is well-covered by current cash position"
                    : rl === "medium"
                    ? "Payroll may be tight within 2-3 months"
                    : "Payroll at immediate risk — action required"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
