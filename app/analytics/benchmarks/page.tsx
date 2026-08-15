"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import type { BenchmarkMetric, BenchmarkReport } from "@/lib/types/acquisition";

const COMPANY_ID = "companyA";

function formatMetric(
  metric: BenchmarkMetric
): { value: string; benchmark: string; topQuartile: string } {
  const isCurrency = metric.key === "revenue_per_tech";
  const isPercent = metric.key !== "revenue_per_tech" && metric.key !== "avg_ticket";
  const fmt = (n: number) => {
    if (isCurrency) {
      return "$" + (n / 1000).toFixed(0) + "K";
    }
    return isPercent ? n.toFixed(1) + "%" : "$" + n.toFixed(0);
  };
  return {
    value: fmt(metric.value),
    benchmark: fmt(metric.benchmarkValue),
    topQuartile: fmt(metric.topQuartileValue),
  };
}

function gapFor(metric: BenchmarkMetric): { label: string; direction: "ahead" | "behind" } {
  const lowerIsBetter = metric.key === "ar_over_60" || metric.key === "callback_rate";
  const diff = metric.value - metric.benchmarkValue;
  const ahead = lowerIsBetter ? diff < 0 : diff > 0;
  const abs = Math.abs(diff);
  const unit =
    metric.key === "revenue_per_tech"
      ? "$" + (abs / 1000).toFixed(0) + "K"
      : metric.key === "avg_ticket"
      ? "$" + abs.toFixed(0)
      : abs.toFixed(1) + " percentage points";
  return {
    label: (ahead ? "" : "-") + unit + " vs benchmark",
    direction: ahead ? "ahead" : "behind",
  };
}

const ASSESSMENT_BADGE: Record<string, string> = {
  "Near top quartile": "bg-brand-400/10 text-brand-200 border-brand-400/20",
  "Above median": "bg-brand-400/10 text-brand-200 border-brand-400/20",
  "Below median": "bg-red-400/10 text-red-200 border-red-400/20",
};

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

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/benchmarks" />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Benchmarking</h1>
          <p className="text-surface-400 max-w-2xl">
            How your operations stack up against peer HVAC service companies, metric by metric.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data ? (
          <>
            {/* Cohort banner */}
            <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-surface-500 mb-1">Cohort</p>
                  <p className="text-lg font-semibold text-white">{data.cohort}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-surface-500 mb-1">Peer Companies</p>
                  <p className="text-lg font-semibold text-white">{data.cohortSize}</p>
                </div>
              </div>
              {data.summary && (
                <p className="text-surface-300 leading-relaxed mt-4">{data.summary}</p>
              )}
            </div>

            {/* Metric rows */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Peer Comparison</h2>
                <p className="text-sm text-surface-500 mt-1">
                  Percentile is the share of the cohort you outperform for that metric.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                      <th className="px-6 py-3 font-medium">Metric</th>
                      <th className="px-4 py-3 font-medium text-right">Your Value</th>
                      <th className="px-4 py-3 font-medium text-right">Benchmark</th>
                      <th className="px-4 py-3 font-medium text-right">Top Quartile</th>
                      <th className="px-4 py-3 font-medium text-right">Gap</th>
                      <th className="px-4 py-3 font-medium text-right">Percentile</th>
                      <th className="px-6 py-3 font-medium">Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.map((metric) => {
                      const formatted = formatMetric(metric);
                      const gap = gapFor(metric);
                      return (
                        <tr key={metric.key} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-medium text-white">{metric.label}</td>
                          <td className="px-4 py-4 text-right font-semibold text-white">{formatted.value}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatted.benchmark}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatted.topQuartile}</td>
                          <td className={`px-4 py-4 text-right ${gap.direction === "ahead" ? "text-brand-300" : "text-red-400"}`}>
                            {gap.label}
                          </td>
                          <td className="px-4 py-4 text-right text-surface-300">{metric.percentile}th</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ASSESSMENT_BADGE[metric.assessment] ?? "bg-white/5 text-surface-300 border-white/10"}`}>
                              {metric.assessment}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
