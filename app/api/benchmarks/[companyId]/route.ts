import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { BenchmarkReport } from "@/lib/types/acquisition";

// Fallback shown only when the backend is unreachable. It follows the
// honesty contract: no fabricated cohort percentiles. Real values come
// from /benchmarks/:companyId on the backend (live company data).
const demoBenchmarkReport: BenchmarkReport = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  cohort: "HVAC service companies, $5M to $25M revenue",
  cohortSize: 0,
  cohortReady: false,
  metrics: [
    {
      key: "ebitda_margin",
      label: "EBITDA Margin",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "avg_ticket",
      label: "Average Service Ticket",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "maint_renewal",
      label: "Maintenance Agreement Renewal Rate",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "tech_utilization",
      label: "Technician Utilization",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "ar_over_60",
      label: "AR Over 60 Days",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "gross_margin",
      label: "Gross Margin",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "close_rate",
      label: "Close Rate",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "revenue_per_tech",
      label: "Revenue per Technician",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
    {
      key: "callback_rate",
      label: "Callback Rate",
      value: 0,
      benchmarkValue: null,
      topQuartileValue: null,
      percentile: null,
      assessment: "Cohort growing",
    },
  ],
  summary:
    "Peer benchmarks unlock once the anonymized cohort reaches critical mass. Your own metrics are computed live from your connected data.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/benchmarks/${p.companyId}`, demoBenchmarkReport);
}
