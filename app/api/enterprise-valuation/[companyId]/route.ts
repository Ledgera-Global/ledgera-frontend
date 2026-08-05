import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { EnterpriseValuation } from "@/lib/types/acquisition";

const demoValuation: EnterpriseValuation = {
  companyId: "companyA",
  valuation: {
    enterpriseValue: 925000,
    ebitda: 185000,
    ebitdaMarginPct: 22.0,
    currentMultiple: 5.0,
    benchmarkMultiple: 6.2,
    multiplePercentile: 42,
    multipleRange: { floor: 4.0, ceiling: 8.5 },
  },
  valueDrivers: {
    ebitdaMargin: {
      score: 85, weight: 0.30, contribution: 2.55,
      detail: "22.0% margin (47% above 15% institutional floor)",
      benchmark: "15% (mid-market minimum); 18% (strong performer); 22%+ (top quartile)",
    },
    revenueScale: {
      score: 60, weight: 0.20, contribution: 1.2,
      detail: "$420k annualized revenue",
      benchmark: "Supports 5x–7x multiple in field service cohort",
    },
    arHealth: {
      score: 60, weight: 0.15, contribution: 0.9,
      detail: "78.0% of AR current; 22% aged 30+ days",
      benchmark: "Institutional buyers require 70%+ current; flag risk above 30%",
    },
    techUtilization: {
      score: 60, weight: 0.10, contribution: 0.6,
      detail: "60.0% technician billable hours",
      benchmark: "80%+ utilization expected post-acquisition; gap = growth leverage",
    },
    integrationDensity: {
      score: 40, weight: 0.10, contribution: 0.4,
      detail: "1 data source connected (ServiceTitan); SaaS stack incomplete",
      benchmark: "3+ integrated sources = higher predictability score; attracts PE/strategic buyers",
    },
    profitLeakage: {
      score: 60, weight: 0.15, contribution: 0.9,
      detail: "22.0% cost-to-revenue ratio; gross margin 78%",
      benchmark: "Acceptable range 18%–25%; >25% signals operational drag",
    },
  },
  scenarios: {
    conservative: { multiple: 4.0, enterpriseValue: 740000 },
    midpoint: { multiple: 5.0, enterpriseValue: 925000 },
    optimistic: { multiple: 8.5, enterpriseValue: 1572500 },
  },
  signals: [
    { type: "strength", metric: "EBITDA Margin", message: "22.0% EBITDA margin exceeds institutional 15% floor", impact: "raises_multiple", magnitude: 150 },
    { type: "strength", metric: "Revenue Quality", message: "$420k annualized revenue in institutional buyer target band", impact: "raises_multiple", magnitude: 100 },
    { type: "concern", metric: "AR Aging", message: "22% of receivables aged >30 days", impact: "lowers_multiple", magnitude: -75 },
    { type: "neutral", metric: "Data Integration", message: "Single integration source limits visibility", impact: "neutral", magnitude: 0 },
  ],
  riskFactors: [
    "Customer Concentration: Verify revenue distribution; >20% concentration with single customer increases buyer risk premium.",
    "Technician Attrition: 60% utilization gap may signal retention or scheduling risk.",
    "Revenue Seasonality: Confirm revenue trending; seasonal dips >15% adjust multiple downward.",
    "Legacy Systems: Non-integrated backend systems increase integration capex and timeline risk.",
  ],
  valuationReadiness: "medium",
  generatedAt: new Date().toISOString(),
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/enterprise-valuation/${p.companyId}`, demoValuation);
}
