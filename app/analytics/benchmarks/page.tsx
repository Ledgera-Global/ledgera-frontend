"use client";
import AppHeader from "@/components/layouts/AppHeader";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import type { BenchmarkMetric, BenchmarkReport } from "@/lib/types/acquisition";

import {
  assessmentClass,
  cohortCountLabel,
  cohortHeadline,
  countMetrics,
  formatMetricValue,
  gapFor,
  isPublished,
  isUnmeasured,
  percentileLabel,
  NOT_PUBLISHED,
} from "@/lib/benchmarkDisplay";

const COMPANY_ID = "companyA";

const GAP_CLASS: Record<string, string> = {
  ahead: "text-brand-300",
  behind: "text-red-400",
  neutral: "text-surface-400",
};

function MetricRow({ metric }: { metric: BenchmarkMetric }) {
  const gap = gapFor(metric);
  const measured = !isUnmeasured(metric);
  const published = isPublished(metric);

  return (
    <tr className="border-b border-white/5 last:border-0 align-top hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <p className="font-medium text-white">{metric.label}</p>
        {metric.note && (
          <p className="text-xs text-surface-500 leading-5 mt-1 max-w-md">{metric.note}</p>
        )}
      </td>
      <td className="px-4 py-4 text-right font-semibold text-white whitespace-nowrap">
        {measured ? formatMetricValue(metric.value, metric.unit) : NOT_PUBLISHED}
      </td>
      <td className="px-4 py-4 text-right text-surface-300 whitespace-nowrap">
        {formatMetricValue(metric.benchmarkValue, metric.unit)}
      </td>
      <td className="px-4 py-4 text-right text-surface-300 whitespace-nowrap">
        {formatMetricValue(metric.topQuartileValue, metric.unit)}
      </td>
      <td
        className={`px-4 py-4 text-right whitespace-nowrap ${GAP_CLASS[gap.direction]}`}
      >
        {published ? gap.label : NOT_PUBLISHED}
      </td>
      <td className="px-4 py-4 text-right text-surface-300 whitespace-nowrap">
        {percentileLabel(metric)}
        {published && (
          <span className="block text-xs text-surface-500">
            {cohortCountLabel(metric)}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${assessmentClass(
            metric.assessment
          )}`}
        >
          {metric.assessment}
        </span>
      </td>
    </tr>
  );
}

export default function BenchmarksPage() {
  const [data, setData] = useState<BenchmarkReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await fetchJson(`/api/benchmarks/${COMPANY_ID}`, null);
      setData(result);
      setLoading(false);
    })();
  }, []);

  const counts = data ? countMetrics(data) : null;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/benchmarks" />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Benchmarking</h1>
          <p className="text-surface-400 max-w-2xl">
            How your operations compare with other service businesses in the Ledgera Benchmark
            Network. Your own figures are measured from your connected data; peer figures come
            only from cohorts large enough to protect every participant.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data && counts ? (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-surface-500 mb-1">Your peer set</p>
                  <p className="text-lg font-semibold text-white">{data.cohort}</p>
                  <p className="text-xs text-surface-500 mt-1">
                    Period {data.periodLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-surface-500 mb-1">Peer comparisons</p>
                  <p className="text-lg font-semibold text-white">
                    {counts.compared} of {counts.total}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {cohortHeadline(data)}
                  </p>
                </div>
              </div>

              <p className="text-surface-300 leading-relaxed mt-4">{data.summary}</p>

              {data.cohortNote && (
                <p className="text-sm text-amber-200/90 leading-relaxed mt-4 border-t border-white/5 pt-4">
                  {data.cohortNote}
                </p>
              )}

              <p className="text-xs text-surface-500 leading-5 mt-4 border-t border-white/5 pt-4">
                {data.cohortDefinitionNote}
              </p>
            </div>

            {counts.measured > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 mb-8">
                <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-surface-500">
                    Measured from your data
                  </p>
                  <p className="text-2xl font-semibold text-white mt-1">
                    {counts.measured}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-surface-500">
                    Compared with peers
                  </p>
                  <p className="text-2xl font-semibold text-white mt-1">
                    {counts.compared}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-surface-500">
                    Awaiting a cohort
                  </p>
                  <p className="text-2xl font-semibold text-white mt-1">
                    {counts.growing}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Metric detail</h2>
                <p className="text-sm text-surface-500 mt-1">
                  A percentile is the share of the cohort you outperform. It is interpolated
                  between the cohort's measured quartiles, and it is published only for cohorts
                  of 30 companies or more.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                      <th className="px-6 py-3 font-medium">Metric</th>
                      <th className="px-4 py-3 font-medium text-right">Your Value</th>
                      <th className="px-4 py-3 font-medium text-right">Peer Median</th>
                      <th className="px-4 py-3 font-medium text-right">Top Quartile</th>
                      <th className="px-4 py-3 font-medium text-right">Gap</th>
                      <th className="px-4 py-3 font-medium text-right">Percentile</th>
                      <th className="px-6 py-3 font-medium">Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.map((metric) => (
                      <MetricRow key={metric.key} metric={metric} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {counts.unmeasured > 0 && (
              <p className="text-xs text-surface-500 leading-5 mt-4">
                {counts.unmeasured} of this platform's defined metrics cannot be computed from
                the data currently held, either in general or for this company. They are shown
                as not measured and are excluded from every cohort rather than counted as zero,
                because a zero would drag the distribution for companies that do have a figure.
              </p>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-400">Failed to load benchmark data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
