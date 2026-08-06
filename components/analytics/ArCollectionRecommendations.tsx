"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type Recommendation = {
  invoiceId: string;
  customer: string;
  amount: number;
  daysOverdue: number;
  bucket: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedRecovery: number;
  recoveryProbabilityPct: number;
  recommendation: string;
  ebitdaImpact: number;
};

type ArRecommendationsResponse = {
  totalOutstanding: number;
  atRiskAmount: number;
  totalEstimatedRecovery: number;
  totalEbitdaImpact: number;
  projectedMarginImpactPct: number;
  recommendations: Recommendation[];
};

const FALLBACK: ArRecommendationsResponse = {
  totalOutstanding: 0,
  atRiskAmount: 0,
  totalEstimatedRecovery: 0,
  totalEbitdaImpact: 0,
  projectedMarginImpactPct: 0,
  recommendations: [],
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

const priorityStyles: Record<string, string> = {
  HIGH: "border-l-red-500/60 bg-red-500/5",
  MEDIUM: "border-l-amber-500/60 bg-amber-500/5",
  LOW: "border-l-surface-500/60 bg-surface-900/30",
};

type Props = { companyId: string };

export default function ArCollectionRecommendations({ companyId }: Props) {
  const [data, setData] = useState<ArRecommendationsResponse>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/ar-recommendations/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<ArRecommendationsResponse>(url, FALLBACK);
      if (!cancelled) { setData(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-950/60 p-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-1/2 rounded bg-surface-800" />
          <div className="h-4 w-3/4 rounded bg-surface-800" />
          <div className="h-20 w-full rounded bg-surface-800" />
        </div>
      </div>
    );
  }

  if (data.recommendations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">AR Collection Recommendations</h3>
        <p className="text-xs text-surface-400 mt-1">
          {fmt(data.totalOutstanding)} outstanding &middot; {fmt(data.atRiskAmount)} at risk &middot; {fmt(data.totalEstimatedRecovery)} estimated recoverable
        </p>
      </div>

      {/* Summary bar */}
      <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-300">Estimated cash recovery</span>
            <span className="text-lg font-bold text-white">{fmt(data.totalEstimatedRecovery)}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-300">EBITDA impact</span>
            <span className="text-lg font-bold text-emerald-400">+{fmt(data.totalEbitdaImpact)}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-300">Margin improvement</span>
            <span className="text-lg font-bold text-emerald-400">+{data.projectedMarginImpactPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {data.recommendations.map((rec) => (
          <div
            key={rec.invoiceId}
            className={`rounded-xl border border-white/5 border-l-4 p-4 ${priorityStyles[rec.priority] ?? priorityStyles.LOW}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{rec.invoiceId}</span>
                <span className="text-xs text-surface-400">{rec.customer}</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-surface-400">{rec.daysOverdue}d overdue</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">{fmt(rec.amount)}</span>
                <span className="block text-[10px] text-surface-500">{rec.bucket}</span>
              </div>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed mb-3">{rec.recommendation}</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-surface-400">Recovery:</span>
                <span className="text-sm font-semibold text-emerald-300">{fmt(rec.estimatedRecovery)}</span>
                <span className="text-[10px] text-surface-500">({rec.recoveryProbabilityPct}% prob.)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-surface-500">EBITDA impact:</span>
                <span className="text-xs font-semibold text-emerald-400">+{fmt(rec.ebitdaImpact)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
