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

// Small inline icon set so the card reads visually without emoji glyphs.
function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconTrendUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.28a.75.75 0 01.53.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.02 19.02 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a17.43 17.43 0 005.157-4.876l-3.284-.88a.75.75 0 01-.53-.919z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconBan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M13.477 2.821a9.25 9.25 0 00-6.954 0L2.821 6.523A9.25 9.25 0 002 10a9.25 9.25 0 0016.5 5.984L19 10a9.25 9.25 0 00-5.523-7.179zM3.5 10a6.5 6.5 0 011.477-4.158l9.18 9.18A6.5 6.5 0 013.5 10zm11.188 4.155l-9.18-9.18A6.5 6.5 0 0116.5 10a6.5 6.5 0 01-1.812 4.155z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-surface-400">
                <IconWarning className="h-3.5 w-3.5 text-red-400" />
                Waste identified
              </p>
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
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-surface-400">
                <IconTrendUp className="h-3.5 w-3.5 text-emerald-400" />
                Capital opportunities
              </p>
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
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-surface-400">
                  <IconBan className="h-3.5 w-3.5 text-amber-300" />
                  Recommended reductions
                </p>
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
