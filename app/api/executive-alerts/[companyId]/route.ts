import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  alerts: [
    {
      type: "PROFIT_LEAKAGE_INCREASE",
      emoji: "🚨",
      title: "Profit leakage increased 12% this week",
      detail: "Labor inefficiency on 3 install jobs drove $2,400 in excess cost vs estimate. Concentrated in Charlotte branch.",
      severity: "critical",
      metric: "+12%",
      metricLabel: "vs last week",
    },
    {
      type: "DISPATCH_EFFICIENCY",
      emoji: "🚨",
      title: "Dispatch efficiency dropped below target",
      detail: "Same-day dispatch rate fell to 68% vs 85% target. 12 missed same-day service opportunities this week.",
      severity: "critical",
      metric: "68%",
      metricLabel: "target 85%",
    },
    {
      type: "AGED_RECEIVABLES_CONCENTRATION",
      emoji: "🚨",
      title: "3 invoices represent 45% of aged receivables",
      detail: "Invoices #1831 ($12.4K), #1842 ($5.8K), #1850 ($3.8K) total $22K — all beyond 45 days. Immediate collection action recommended.",
      severity: "high",
      metric: "$22K",
      metricLabel: "at risk",
    },
    {
      type: "EBITDA_FORECAST_IMPROVEMENT",
      emoji: "✅",
      title: "EBITDA forecast improved by $18,000",
      detail: "Pricing adjustments on diagnostic fees and 2 maintenance upsells this week contributed to upward revision.",
      severity: "positive",
      metric: "+$18K",
      metricLabel: "EBITDA lift",
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/executive-alerts/${p.companyId}`, demoData);
}
