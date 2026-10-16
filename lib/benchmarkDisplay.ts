import type {
  BenchmarkAssessment,
  BenchmarkMetric,
  BenchmarkReport,
  MetricUnit,
} from "./types/acquisition";

/**
 * Presentation rules for the benchmarking surface.
 *
 * Kept out of the page component because the rules here are the honesty
 * contract, not layout: which metrics may be quoted, how a figure is expressed,
 * and which way round "better" runs. A component that got any of these wrong
 * would still render, and would still be wrong.
 */

/** Shown wherever a real number does not exist. Never a zero in its place. */
export const NOT_MEASURED = "Not measured";
export const NOT_PUBLISHED = "—";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Format a value for display according to its declared unit. */
export function formatMetricValue(value: number | null, unit: MetricUnit): string {
  if (value === null || !Number.isFinite(value)) return NOT_PUBLISHED;
  if (unit === "percent") return `${value.toFixed(1)}%`;
  if (unit === "ratio") return `${value.toFixed(2)}x`;
  return usdFormatter.format(value);
}

/** True when this metric carries a published percentile. */
export function isPublished(metric: BenchmarkMetric): boolean {
  return metric.percentile !== null;
}

/** True when the company's own figure could not be produced. */
export function isUnmeasured(metric: BenchmarkMetric): boolean {
  return metric.value === null;
}

export type GapDirection = "ahead" | "behind" | "neutral";

export interface MetricGap {
  label: string;
  direction: GapDirection;
}

/**
 * The distance between this company and the cohort median, oriented by the
 * metric's own declared direction rather than by a list of keys the surface
 * happens to remember. A metric the surface does not recognise still gets the
 * right answer, because the direction travels with the metric.
 */
export function gapFor(metric: BenchmarkMetric): MetricGap {
  if (metric.value === null || metric.benchmarkValue === null) {
    return { label: "no peer median published", direction: "neutral" };
  }

  const difference = metric.value - metric.benchmarkValue;
  if (difference === 0) {
    return { label: "level with the peer median", direction: "neutral" };
  }

  const ahead =
    metric.direction === "lower_is_better" ? difference < 0 : difference > 0;
  const magnitude = formatMetricValue(Math.abs(difference), metric.unit);

  return {
    label: `${ahead ? "ahead by" : "behind by"} ${magnitude}`,
    direction: ahead ? "ahead" : "behind",
  };
}

/** Tailwind classes per assessment. Unknown assessments fall back to neutral. */
const ASSESSMENT_CLASSES: Record<BenchmarkAssessment, string> = {
  "Top decile": "bg-brand-400/10 text-brand-200 border-brand-400/20",
  "Near top quartile": "bg-brand-400/10 text-brand-200 border-brand-400/20",
  "Above median": "bg-brand-400/10 text-brand-200 border-brand-400/20",
  "Below median": "bg-amber-400/10 text-amber-200 border-amber-400/20",
  "Bottom quartile": "bg-red-400/10 text-red-200 border-red-400/20",
  "Cohort growing": "bg-white/5 text-surface-300 border-white/10",
  "Not measured": "bg-white/5 text-surface-400 border-white/10",
};

export function assessmentClass(assessment: BenchmarkAssessment): string {
  return ASSESSMENT_CLASSES[assessment] ?? "bg-white/5 text-surface-300 border-white/10";
}

/** How many companies the cohort behind this metric contains, or null. */
export function cohortCountLabel(metric: BenchmarkMetric): string {
  if (metric.cohortCompanyCount === null || metric.cohortCompanyCount <= 0) {
    return NOT_PUBLISHED;
  }
  return `${metric.cohortCompanyCount} companies`;
}

/** The percentile cell: a real rank, or an explicit statement that none exists. */
export function percentileLabel(metric: BenchmarkMetric): string {
  if (metric.percentile === null) {
    return metric.assessment === "Not measured" ? NOT_MEASURED : "not published";
  }
  return `${metric.percentile}th`;
}

export interface ReportCounts {
  measured: number;
  compared: number;
  growing: number;
  unmeasured: number;
  total: number;
}

/** Split the report by what each metric actually achieved. */
export function countMetrics(report: BenchmarkReport): ReportCounts {
  const total = report.metrics.length;
  const measured = report.metrics.filter((m) => m.value !== null).length;
  const compared = report.metrics.filter(isPublished).length;
  const unmeasured = report.metrics.filter(isUnmeasured).length;

  return {
    total,
    measured,
    compared,
    unmeasured,
    growing: measured - compared,
  };
}

/**
 * The one-line state of the network for this company.
 *
 * Deliberately does not print a peer count when there is no cohort: "0 peers"
 * reads as a small cohort rather than as an absent one, and the difference
 * matters to someone deciding whether to trust the column.
 */
export function cohortHeadline(report: BenchmarkReport): string {
  if (report.cohortReady) {
    return `${report.cohortSize} companies in the largest published cohort`;
  }
  return "No peer percentile published yet";
}
