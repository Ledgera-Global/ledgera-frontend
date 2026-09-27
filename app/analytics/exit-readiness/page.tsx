"use client";
import AppHeader from "@/components/layouts/AppHeader";
import ExitActionList from "@/components/analytics/ExitActionList";
import ExitDimensionGrid from "@/components/analytics/ExitDimensionGrid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gauge } from "@/components/analytics/Gauge";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { EXIT_READINESS_DEMO } from "@/lib/data/exitReadinessDemo";
import type { ExitReadiness } from "@/lib/types/exitReadiness";

import {
  GRADE_CLASSES,
  GRADE_LABEL,
  formatMultiple,
  formatUsd,
} from "@/lib/exitReadinessDisplay";

const COMPANY_ID = "companyA";

/**
 * Exit readiness: what a buyer would knock off the price today, and what closing
 * each gap is worth.
 *
 * Every number traces back to the same valuation model the owner already sees,
 * so this page and the valuation page can never quote different multiples for
 * the same business.
 */
export default function ExitReadinessPage() {
  const [readiness, setReadiness] = useState<ExitReadiness>(EXIT_READINESS_DEMO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchJson(
        `/api/exit-readiness/${COMPANY_ID}`,
        EXIT_READINESS_DEMO
      );
      setReadiness(data);
      setLoading(false);
    })();
  }, []);

  const value = readiness.valueOnTheTable;
  const measuredPct = Math.round(readiness.scoreBasis.coverage * 100);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/exit-readiness" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3">
                Exit Readiness
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                How a buyer would read this business in diligence, and what each
                specific gap is costing at today's earnings.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              <div>
                Generated{" "}
                {new Date(readiness.generatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-8">
              {/* Verdict */}
              <div className="rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                  <Gauge score={readiness.score} size={160} />
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                        GRADE_CLASSES[readiness.grade]
                      }`}
                    >
                      {GRADE_LABEL[readiness.grade]}
                    </div>
                    <p className="mt-4 text-lg leading-relaxed text-surface-200">
                      {readiness.headline}
                    </p>
                    <p className="mt-4 text-sm text-surface-400">
                      {readiness.scoreBasis.note} ({measuredPct}% coverage)
                    </p>
                  </div>
                </div>
              </div>

              {/* Value on the table */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Value Today"
                  value={formatUsd(value.valueToday)}
                  sub={`At ${formatMultiple(value.currentMultiple)} on ${formatUsd(value.earningsAmount)} of earnings`}
                />
                <MetricCard
                  label="If Gaps Closed"
                  value={formatUsd(value.valueIfGapsClosed)}
                  sub={`At ${formatMultiple(value.multipleIfGapsClosed)}`}
                />
                <MetricCard
                  label="What The Gaps Cost"
                  value={formatUsd(value.capturableUplift)}
                  sub="Sum of the priced gaps below"
                  highlight
                />
                <MetricCard
                  label="Unpriced Drivers"
                  value={String(value.unpricedDrivers.length)}
                  sub={
                    value.unpricedDrivers.length === 0
                      ? "Every driver could be measured"
                      : value.unpricedDrivers.join(", ")
                  }
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-300">{value.note}</p>
              </div>

              {/* Diligence findings */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-4">
                  What A Buyer Will Raise ({readiness.diligenceFindings.length})
                </h2>
                {readiness.diligenceFindings.length === 0 ? (
                  <p className="text-sm text-surface-300">
                    Nothing surfaced in the earnings basis or the collection
                    record. That is a statement about what was checked, not a
                    guarantee about what diligence will find.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {readiness.diligenceFindings.map((finding, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-surface-300"
                      >
                        <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <ExitActionList actions={readiness.actions} />

              <ExitDimensionGrid dimensions={readiness.dimensions} />

              {/* Methodology */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                  How This Is Calculated
                </h3>
                <ul className="space-y-2">
                  {readiness.methodology.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-surface-300"
                    >
                      <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} Ledgera Global Inc.
          </span>
          <Link
            href="/analytics"
            className="text-sm text-surface-400 hover:text-white transition-colors"
          >
            Analytics
          </Link>
        </div>
      </footer>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}

function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-emerald-400/20 bg-emerald-400/5"
          : "border-white/10 bg-surface-900/40"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
        {label}
      </div>
      <div
        className={`mt-3 font-mono text-2xl font-bold ${
          highlight ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-surface-500">{sub}</div>
    </div>
  );
}
