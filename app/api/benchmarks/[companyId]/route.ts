import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { BenchmarkReport } from "@/lib/types/acquisition";

const demoBenchmarkReport: BenchmarkReport = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  cohort: "HVAC service companies, $5M to $25M revenue",
  cohortSize: 412,
  metrics: [
    {
      key: "ebitda_margin",
      label: "EBITDA Margin",
      value: 12.4,
      benchmarkValue: 11.8,
      topQuartileValue: 15.2,
      percentile: 53,
      assessment: "Above median",
    },
    {
      key: "avg_ticket",
      label: "Average Service Ticket",
      value: 684,
      benchmarkValue: 640,
      topQuartileValue: 790,
      percentile: 55,
      assessment: "Above median",
    },
    {
      key: "maint_renewal",
      label: "Maintenance Agreement Renewal Rate",
      value: 71,
      benchmarkValue: 68,
      topQuartileValue: 82,
      percentile: 53,
      assessment: "Above median",
    },
    {
      key: "tech_utilization",
      label: "Technician Utilization",
      value: 74,
      benchmarkValue: 71,
      topQuartileValue: 84,
      percentile: 53,
      assessment: "Above median",
    },
    {
      key: "ar_over_60",
      label: "AR Over 60 Days",
      value: 21,
      benchmarkValue: 18,
      topQuartileValue: 9,
      percentile: 33,
      assessment: "Below median",
    },
    {
      key: "gross_margin",
      label: "Gross Margin",
      value: 46,
      benchmarkValue: 44,
      topQuartileValue: 52,
      percentile: 53,
      assessment: "Above median",
    },
    {
      key: "close_rate",
      label: "Close Rate",
      value: 34,
      benchmarkValue: 31,
      topQuartileValue: 40,
      percentile: 55,
      assessment: "Above median",
    },
    {
      key: "revenue_per_tech",
      label: "Revenue per Technician",
      value: 428000,
      benchmarkValue: 395000,
      topQuartileValue: 510000,
      percentile: 53,
      assessment: "Above median",
    },
    {
      key: "callback_rate",
      label: "Callback Rate",
      value: 8,
      benchmarkValue: 6,
      topQuartileValue: 3,
      percentile: 28,
      assessment: "Below median",
    },
  ],
  summary:
    "Across 9 operating metrics, you rank at or above the peer median on 7 of them. Your strongest edge is Close Rate; your biggest gaps are AR over 60 days and callback rate. Closing those two would materially strengthen the story you present to lenders and buyers.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/benchmarks/${p.companyId}`, demoBenchmarkReport);
}
