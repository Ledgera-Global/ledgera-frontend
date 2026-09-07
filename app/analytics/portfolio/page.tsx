"use client";
import AppHeader from "@/components/layouts/AppHeader";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";

// ─── Portfolio Intelligence ──────────────────────────────────────────
// The holding-company / PE layer: rolls up every company the account can
// see into one view — capital rollup (waste, opportunities, EV creation),
// a ranked comparison table, and where the next dollar of attention earns
// the most. All values come from the real portfolio engine.

type Health = "strong" | "watch" | "underperforming" | "no_data";

type PortfolioCompany = {
  companyId: string;
  name: string;
  health: Health;
  revenue: number;
  grossProfit: number;
  grossMarginPct: number;
  ebitda: number;
  ebitdaMarginPct: number;
  jobsAnalyzed: number;
  marginRank: number | null;
  ebitdaGapToMedian: number | null;
  topIssue: string | null;
};

type PortfolioCapital = {
  identifiedCostOptimization: number;
  potentialEbitdaImprovement: number;
  potentialEvCreationLow: number;
  potentialEvCreationMid: number;
  potentialEvCreationHigh: number;
  findingsRequiringReview: number;
};

type PortfolioData = {
  generatedAt: string;
  companies: PortfolioCompany[];
  capital: PortfolioCapital;
  summary: {
    totalCompanies: number;
    withData: number;
    strong: number;
    watch: number;
    underperforming: number;
    noData: number;
    portfolioRevenue: number;
    portfolioEbitda: number;
    blendedMarginPct: number;
    valueCreationGap: number;
  };
  priorities: {
    companyId: string;
    companyName: string;
    reason: string;
    estimatedAnnualEbitdaLift: number;
  }[];
};

const EMPTY: PortfolioData = {
  generatedAt: new Date().toISOString(),
  companies: [],
  capital: {
    identifiedCostOptimization: 0,
    potentialEbitdaImprovement: 0,
    potentialEvCreationLow: 0,
    potentialEvCreationMid: 0,
    potentialEvCreationHigh: 0,
    findingsRequiringReview: 0,
  },
  summary: {
    totalCompanies: 0,
    withData: 0,
    strong: 0,
    watch: 0,
    underperforming: 0,
    noData: 0,
    portfolioRevenue: 0,
    portfolioEbitda: 0,
    blendedMarginPct: 0,
    valueCreationGap: 0,
  },
  priorities: [],
};

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

const HEALTH_STYLE: Record<Health, { label: string; className: string }> = {
  strong: {
    label: "Strong",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  },
  watch: {
    label: "Watch",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  },
  underperforming: {
    label: "Underperforming",
    className: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  },
  no_data: {
    label: "No Data",
    className: "bg-surface-800/40 text-surface-500 border-white/10",
  },
};

function CapStat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-surface-400">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold ${
          accent ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs leading-5 text-surface-400">{sub}</p>}
    </div>
  );
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const COMPANY_ID = user?.companyId || "companyA";

  const { data, loading } = usePortfolio(COMPANY_ID);
  const d = data ?? EMPTY;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/portfolio" />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white">Portfolio Intelligence</h1>
          <p className="mt-2 max-w-3xl text-base text-surface-300">
            The holding-company view. Every operating company rolled up into one
            picture — where capital is trapped, which companies trail the
            median, the total cost optimization available, and what the whole
            portfolio could be worth if each company were fixed. Built for
            operators and PE owners who run many companies at once.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-surface-800" />
            <div className="h-32 animate-pulse rounded-2xl bg-surface-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface-800" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface-800" />
          </div>
        ) : (
          <>
            {/* Capital rollup */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <CapStat
                label="Cost optimization identified"
                value={money(d.capital.identifiedCostOptimization)}
                sub="Annualized waste + low-return spend across all companies"
              />
              <CapStat
                label="Potential EBITDA improvement"
                value={money(d.capital.potentialEbitdaImprovement)}
                sub="If every recommendation is approved and realized"
                accent
              />
              <CapStat
                label="Estimated EV creation"
                value={`${money(d.capital.potentialEvCreationLow)} – ${money(
                  d.capital.potentialEvCreationHigh
                )}`}
                sub={`Mid ${money(d.capital.potentialEvCreationMid)} at the current multiple`}
                accent
              />
              <CapStat
                label="Findings requiring review"
                value={`${d.capital.findingsRequiringReview}`}
                sub="Capital recommendations awaiting an owner decision"
              />
            </section>

            {/* Portfolio summary strip */}
            <section className="mt-6 rounded-2xl border border-white/10 bg-surface-900/40 p-5">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                <span className="text-surface-400">
                  Companies <span className="ml-1 font-semibold text-white">{d.summary.totalCompanies}</span>
                </span>
                <span className="text-surface-400">
                  With data <span className="ml-1 font-semibold text-white">{d.summary.withData}</span>
                </span>
                <span className="text-surface-400">
                  Strong <span className="ml-1 font-semibold text-emerald-300">{d.summary.strong}</span>
                </span>
                <span className="text-surface-400">
                  Watch <span className="ml-1 font-semibold text-amber-300">{d.summary.watch}</span>
                </span>
                <span className="text-surface-400">
                  Underperforming <span className="ml-1 font-semibold text-rose-300">{d.summary.underperforming}</span>
                </span>
                <span className="text-surface-400">
                  No data <span className="ml-1 font-semibold text-surface-500">{d.summary.noData}</span>
                </span>
                <span className="text-surface-400">
                  Portfolio revenue <span className="ml-1 font-semibold text-white">{money(d.summary.portfolioRevenue)}</span>
                </span>
                <span className="text-surface-400">
                  Portfolio EBITDA <span className="ml-1 font-semibold text-white">{money(d.summary.portfolioEbitda)}</span>
                </span>
                <span className="text-surface-400">
                  Blended margin <span className="ml-1 font-semibold text-white">{pct(d.summary.blendedMarginPct)}</span>
                </span>
                <span className="text-surface-400">
                  Value-creation gap <span className="ml-1 font-semibold text-rose-300">{money(d.summary.valueCreationGap)}</span>
                </span>
              </div>
            </section>

            {/* Where to fix first */}
            <section className="mt-8">
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Where attention earns the most</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Priorities</h2>
              <div className="mt-4 space-y-3">
                {d.priorities.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-6 text-sm text-surface-400">
                    No company trails the portfolio median yet. Every company with data is at or above the
                    blended benchmark — keep driving.
                  </div>
                ) : (
                  d.priorities.map((p) => (
                    <div
                      key={p.companyId}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-surface-900/40 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{p.companyName}</p>
                        <p className="mt-1 text-sm leading-6 text-surface-300">{p.reason}</p>
                      </div>
                      <div className="shrink-0 rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                        +{money(p.estimatedAnnualEbitdaLift)} / yr
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Company comparison table */}
            <section className="mt-8">
              <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Cross-company comparison</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Companies</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5 bg-surface-950/60 shadow-xl shadow-black/20">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-900/40 text-xs uppercase tracking-wider text-surface-400">
                      <th className="px-5 py-3 font-semibold">Company</th>
                      <th className="px-5 py-3 font-semibold">Health</th>
                      <th className="px-5 py-3 font-semibold text-right">Revenue</th>
                      <th className="px-5 py-3 font-semibold text-right">EBITDA</th>
                      <th className="px-5 py-3 font-semibold text-right">Margin</th>
                      <th className="px-5 py-3 font-semibold text-center">Rank</th>
                      <th className="px-5 py-3 font-semibold text-right">Gap to median</th>
                      <th className="px-5 py-3 font-semibold">Top issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.companies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-surface-400">
                          No companies in this portfolio yet.
                        </td>
                      </tr>
                    ) : (
                      d.companies.map((c) => {
                        const h = HEALTH_STYLE[c.health];
                        return (
                          <tr key={c.companyId} className="border-b border-white/5 last:border-0 hover:bg-surface-900/30">
                            <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${h.className}`}>
                                {h.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-surface-200">{c.health === "no_data" ? "—" : money(c.revenue)}</td>
                            <td className="px-5 py-4 text-right text-surface-200">{c.health === "no_data" ? "—" : money(c.ebitda)}</td>
                            <td className="px-5 py-4 text-right text-surface-200">{c.health === "no_data" ? "—" : pct(c.ebitdaMarginPct)}</td>
                            <td className="px-5 py-4 text-center text-surface-300">{c.marginRank ?? "—"}</td>
                            <td className="px-5 py-4 text-right text-surface-300">
                              {c.ebitdaGapToMedian == null ? "—" : money(c.ebitdaGapToMedian)}
                            </td>
                            <td className="max-w-xs px-5 py-4 text-xs leading-5 text-surface-400">{c.topIssue ?? "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-surface-500">
                Capital rollup aggregates each company's real Capital Intelligence report. Companies with no job data are
                shown as "no data" rather than given fabricated metrics.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function usePortfolio(companyId: string) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJson<PortfolioData>(
      `/api/intelligence/${encodeURIComponent(companyId)}/portfolio`,
      EMPTY
    ).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { data, loading };
}
