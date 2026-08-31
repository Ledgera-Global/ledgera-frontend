"use client";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type EvRange = { low: number; mid: number; high: number; multipleUsed: number };

type WasteItem = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  evidence: string[];
  monthlyAmount: number;
  annualizedAmount: number;
  confidence: number;
};

type Opportunity = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  suggestedDeployment: number;
  expectedAnnualEbitdaImpact: number;
  evImpact: EvRange;
  confidence: number;
};

type Reduction = {
  id: string;
  title: string;
  detail: string;
  annualSavings: number;
  reversibility: "immediate" | "30-day" | "contractual";
  confidence: number;
};

type CapitalReport = {
  companyId: string;
  generatedAt: string;
  graphCoverage: {
    transactionsAnalyzed: number;
    totalSpend12mo: number;
    sources: string[];
    coverageNote: string;
  };
  financials: {
    revenue: number;
    ebitda: number;
    enterpriseValue: number;
    currentMultiple: number;
  };
  waste: WasteItem[];
  opportunities: Opportunity[];
  reductions: Reduction[];
  summary: {
    wasteMonthlyIdentified: number;
    wasteAnnualizedIdentified: number;
    potentialSavingsAnnual: number;
    opportunityEbitdaAnnual: number;
    potentialEvCreationLow: number;
    potentialEvCreationMid: number;
    potentialEvCreationHigh: number;
    findingsRequiringReview: number;
  };
};

function fmt(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: v >= 1_000_000 ? "compact" : "standard",
  }).format(v);
}

const FALLBACK: CapitalReport = {
  companyId: "",
  generatedAt: "",
  graphCoverage: { transactionsAnalyzed: 0, totalSpend12mo: 0, sources: [], coverageNote: "" },
  financials: { revenue: 0, ebitda: 0, enterpriseValue: 0, currentMultiple: 6 },
  waste: [],
  opportunities: [],
  reductions: [],
  summary: {
    wasteMonthlyIdentified: 0,
    wasteAnnualizedIdentified: 0,
    potentialSavingsAnnual: 0,
    opportunityEbitdaAnnual: 0,
    potentialEvCreationLow: 0,
    potentialEvCreationMid: 0,
    potentialEvCreationHigh: 0,
    findingsRequiringReview: 0,
  },
};

type Props = { companyId: string };

export default function CapitalAllocationCard({ companyId }: Props) {
  const [data, setData] = useState<CapitalReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<CapitalReport>(
        `/api/intelligence/${encodeURIComponent(companyId)}/capital?refresh=1`,
        FALLBACK
      );
      if (!cancelled) { setData(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [companyId]);

  const d = data ?? FALLBACK;

  return (
    <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Capital Allocation</h3>
        <span className="text-xs text-surface-500">
          {d.graphCoverage.transactionsAnalyzed.toLocaleString()} txns analyzed
        </span>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-3/4 rounded bg-surface-800" />
          <div className="h-4 w-full rounded bg-surface-800" />
          <div className="h-10 w-full rounded bg-surface-800" />
        </div>
      ) : (
        <>
          {/* Financial snapshot */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface-900/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-surface-500">Revenue</p>
              <p className="text-xs font-semibold text-white">{fmt(d.financials.revenue || 0)}</p>
            </div>
            <div className="rounded-xl bg-surface-900/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-surface-500">EBITDA</p>
              <p className="text-xs font-semibold text-white">{fmt(d.financials.ebitda || 0)}</p>
            </div>
            <div className="rounded-xl bg-surface-900/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-surface-500">EV</p>
              <p className="text-xs font-semibold text-brand-300">{fmt(d.financials.enterpriseValue || 0)}</p>
            </div>
          </div>

          {/* Waste identified */}
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-surface-400">⚠ Waste identified</p>
              <span className="text-lg font-bold text-red-400">
                {fmt(d.summary.wasteMonthlyIdentified)}/mo
              </span>
            </div>
            <p className="mt-1 text-xs text-surface-500">
              ≈ {fmt(d.summary.wasteAnnualizedIdentified)} annualized
            </p>
            {d.waste.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {d.waste.slice(0, 2).map((w) => (
                  <li key={w.id} className="text-xs text-surface-300">
                    • {w.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Opportunities */}
          <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-surface-400">📈 Capital opportunities</p>
              <span className="text-lg font-bold text-emerald-400">
                +{fmt(d.summary.opportunityEbitdaAnnual)}/yr EBITDA
              </span>
            </div>
            <p className="mt-1 text-xs text-surface-500">
              Potential EV: {fmt(d.summary.potentialEvCreationLow)}–{fmt(d.summary.potentialEvCreationHigh)}
            </p>
            {d.opportunities.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {d.opportunities.slice(0, 2).map((o) => (
                  <li key={o.id} className="text-xs text-surface-300">
                    • {o.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reductions */}
          {d.reductions.length > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-surface-400">🛑 Recommended reductions</p>
                <span className="text-lg font-bold text-amber-300">
                  {fmt(d.summary.potentialSavingsAnnual)}/yr
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {d.reductions.slice(0, 3).map((r) => (
                  <li key={r.id} className="text-xs text-surface-300">
                    • {r.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {d.graphCoverage.transactionsAnalyzed === 0 && (
            <p className="mt-4 text-xs text-surface-500">{d.graphCoverage.coverageNote}</p>
          )}
        </>
      )}
    </div>
  );
}
