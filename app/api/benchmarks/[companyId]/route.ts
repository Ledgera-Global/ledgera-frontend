import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { BenchmarkMetric, BenchmarkReport } from "@/lib/types/acquisition";

/**
 * Fallback shown only when the backend is unreachable.
 *
 * It follows the honesty contract in the strongest form available: with no
 * backend there are no readings at all, so every metric is reported as not
 * measured rather than filled with a plausible number. The metric list mirrors
 * the backend's dictionary exactly — same keys, same order, same units — so the
 * layout a user sees here is the layout they will see when the backend answers.
 *
 * The two metrics that are never measurable in this platform say why, and say it
 * the same way the backend does.
 */

const BACKEND_UNREACHABLE =
  "The analytics service did not respond, so no figure could be measured for this session. Nothing is shown in its place.";

const NOT_STORED_CLOSE_RATE =
  "Ledgera does not store issued estimates, so a close rate cannot be computed from a company's records.";

const NOT_STORED_MAINTENANCE =
  "Customer maintenance agreements are not modelled, so penetration cannot be computed from a company's records.";

interface FallbackMetric {
  key: string;
  label: string;
  unit: BenchmarkMetric["unit"];
  direction: BenchmarkMetric["direction"];
  note: string;
}

const FALLBACK_METRICS: readonly FallbackMetric[] = [
  {
    key: "ebitda_margin",
    label: "EBITDA Margin",
    unit: "percent",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "gross_margin",
    label: "Gross Margin",
    unit: "percent",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "avg_ticket",
    label: "Average Service Ticket",
    unit: "usd",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "revenue_per_tech",
    label: "Revenue per Technician",
    unit: "usd_per_tech",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "tech_utilization",
    label: "Technician Utilization",
    unit: "percent",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "labor_efficiency",
    label: "Labor Cost Ratio",
    unit: "percent",
    direction: "lower_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "ar_over_60",
    label: "AR Over 60 Days",
    unit: "percent",
    direction: "lower_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "callback_rate",
    label: "Callback Rate",
    unit: "percent",
    direction: "lower_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "marketing_roi",
    label: "Marketing ROI",
    unit: "ratio",
    direction: "higher_is_better",
    note: BACKEND_UNREACHABLE,
  },
  {
    key: "close_rate",
    label: "Estimate Close Rate",
    unit: "percent",
    direction: "higher_is_better",
    note: NOT_STORED_CLOSE_RATE,
  },
  {
    key: "maintenance_penetration",
    label: "Maintenance Agreement Penetration",
    unit: "percent",
    direction: "higher_is_better",
    note: NOT_STORED_MAINTENANCE,
  },
];

function fallbackMetric(definition: FallbackMetric): BenchmarkMetric {
  return {
    key: definition.key,
    label: definition.label,
    unit: definition.unit,
    direction: definition.direction,
    value: null,
    benchmarkValue: null,
    topQuartileValue: null,
    percentile: null,
    assessment: "Not measured",
    cohortCompanyCount: null,
    note: definition.note,
  };
}

function buildFallbackReport(companyId: string): BenchmarkReport {
  return {
    companyId,
    generatedAt: new Date().toISOString(),
    cohort: "Revenue-banded service companies (Ledgera Benchmark Network)",
    cohortSize: 0,
    cohortReady: false,
    cohortNote:
      "No cohort data is available because the analytics service could not be reached. Peer percentiles " +
      "are published only for cohorts of 30 companies or more, from stored anonymized readings.",
    cohortDefinitionNote:
      "Cohorts are banded by company revenue. They are not banded by industry or region, because Ledgera " +
      "does not hold either field for the companies in the network.",
    periodLabel: "unavailable",
    metrics: FALLBACK_METRICS.map(fallbackMetric),
    summary:
      "The analytics service is unreachable, so nothing could be measured and no peer comparison is available. " +
      "No substitute values are shown.",
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(
    req,
    p,
    `/benchmarks/${p.companyId}`,
    buildFallbackReport(p.companyId)
  );
}
