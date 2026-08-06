"use client";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import { NAV_LINKS } from "@/lib/constants/styling";
import type { MissedCallRevenueImpact } from "@/lib/types/acquisition";

const COMPANY_ID = "companyA";

export default function MissedCallsPage() {
  const [data, setData] = useState<MissedCallRevenueImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await fetchJson(`/api/missed-call-revenue/${COMPANY_ID}`, null);
      setData(result);
      setLoading(false);
    })();
  }, []);

  const fmt = (n: number) => "$" + (n / 1000).toFixed(1) + "K";
  const fmtFull = (n: number) => "$" + (n / 1e6).toFixed(1) + "M";

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/analytics/missed-calls" ? "text-white" : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <InstitutionalNav currentHref="/analytics/missed-calls" />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Missed Call Revenue Impact</h1>
          <p className="text-surface-400 max-w-2xl">
            Every missed call has a measurable impact on revenue, profit, and enterprise value.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data ? (
          <>
            {/* Main metric card */}
            <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8 mb-8">
              <div className="text-center mb-6">
                <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                  {data.periodLabel}
                </span>
                <p className="text-6xl font-bold text-white mt-4">{data.missedCalls}</p>
                <p className="text-surface-400 mt-2">Missed Inbound Calls</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-sm text-surface-500">Booking Rate</p>
                  <p className="text-xl font-bold text-white">{(data.estimatedBookingRate * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-sm text-surface-500">Avg Revenue/Call</p>
                  <p className="text-xl font-bold text-white">{fmt(data.avgRevenuePerCall)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-sm text-surface-500">Gross Margin</p>
                  <p className="text-xl font-bold text-white">{(data.grossMarginPct * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <p className="text-sm text-surface-500">Multiple</p>
                  <p className="text-xl font-bold text-white">{data.appliedMultiple}x</p>
                </div>
              </div>
            </div>

            {/* Impact chain */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Estimated Bookable Calls Lost</p>
                <p className="text-2xl font-bold text-white">{data.estimatedBookableCallsLost}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <p className="text-sm text-surface-500 mb-1">Revenue Opportunity Lost</p>
                  <p className="text-2xl font-bold text-red-400">{fmt(data.revenueOpportunityLost)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <p className="text-sm text-surface-500 mb-1">Gross Profit Lost</p>
                  <p className="text-2xl font-bold text-red-400">{fmt(data.grossProfitLost)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <p className="text-sm text-surface-500 mb-1">Annualized EBITDA Impact</p>
                  <p className="text-2xl font-bold text-yellow-400">{fmtFull(data.annualEbitdaImpact)}</p>
                </div>
                <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.08] to-white/[0.02] p-6">
                  <p className="text-sm text-surface-500 mb-1">Enterprise Value Impact</p>
                  <p className="text-2xl font-bold text-brand-300">{fmtFull(data.enterpriseValueImpact)}</p>
                </div>
              </div>

              {data.benchmark && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm text-surface-400 text-center">
                    Industry benchmark booking rate: {(data.benchmark.industryAvgBookingRate * 100).toFixed(0)}% &middot;
                    You are {data.benchmark.gapVsBenchmark} bookable calls below benchmark
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-400">Failed to load missed call data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
