// ─── Default Data ──────────────────────────────────────────────────────
// Fallback data for acquisition analytics when API is unavailable

import type {
  AcquisitionScore,
  DiligenceReport,
  EnterpriseValuation,
  RollupStrategy,
} from "@/lib/types/acquisition";

export const DEFAULT_ACQUISITION_SCORE: AcquisitionScore = {
  score: 72,
  recommendation: "Strong acquisition candidate — healthy margins with moderate operational risk.",
  signals: [
    "Revenue growth above industry median",
    "Technician utilization at 82%",
    "AR aging below 30 days for 78% of outstanding",
    "EBITDA margin above 15% threshold",
  ],
};

export const DEFAULT_DILIGENCE_REPORT: DiligenceReport = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  summary: "Operational due diligence indicates moderate risk concentration in labor efficiency and AR aging.",
  sections: [
    {
      title: "Financial Health",
      findings: [
        "Revenue trending up 18% YoY",
        "Net margin at 22%, above industry benchmark of 15%",
        "EBITDA margin stable at 16%",
      ],
      riskLevel: "LOW",
    },
    {
      title: "Operations",
      findings: [
        "Technician utilization at 74% — below 85% target",
        "Average job duration 3.2 hours vs 2.8 benchmark",
        "Dispatch inefficiency detected in 12% of jobs",
      ],
      riskLevel: "MODERATE",
    },
    {
      title: "Accounts Receivable",
      findings: [
        "22% of AR is beyond 60 days",
        "No automated collection process",
        "Concentration risk: top 3 customers = 45% of outstanding",
      ],
      riskLevel: "HIGH",
    },
    {
      title: "Compliance & Contracts",
      findings: [
        "All vendor agreements current",
        "Worker classification reviewed — no red flags",
        "Insurance coverage adequate for operational scale",
      ],
      riskLevel: "LOW",
    },
  ],
};

export const DEFAULT_VALUATION: EnterpriseValuation = {
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
    { type: "strength", metric: "EBITDA Margin", message: "22.0% EBITDA margin exceeds institutional 15% floor and mid-market 18% threshold. Reflects disciplined cost structure and pricing power.", impact: "raises_multiple", magnitude: 150 },
    { type: "strength", metric: "Revenue Quality", message: "$420k annualized revenue places company in institutional buyer target band. Sufficient scale to support enterprise systems and FTE overhead.", impact: "raises_multiple", magnitude: 100 },
    { type: "concern", metric: "AR Aging", message: "22% of receivables aged >30 days. Institutional buyers benchmark 70% current; excess aging suggests collection risk or customer credit quality variance.", impact: "lowers_multiple", magnitude: -75 },
    { type: "concern", metric: "Technician Utilization", message: "60% billable utilization is 25% below mid-market standard (80%). Represents ~$38k in unrealized capacity that post-acquisition integration can address.", impact: "lowers_multiple", magnitude: -100 },
    { type: "neutral", metric: "Data Integration", message: "Single integration source (ServiceTitan) limits visibility. Multi-source data architecture (add QuickBooks, payroll, fleet) improves predictability and buyer confidence.", impact: "neutral", magnitude: 0 },
  ],
  riskFactors: [
    "Customer Concentration: Verify revenue distribution; >20% concentration with single customer increases buyer risk premium.",
    "Technician Attrition: 60% utilization gap may signal retention or scheduling risk; post-acquisition integration high-risk item.",
    "Revenue Seasonality: Confirm revenue trending; seasonal dips >15% month-over-month adjust multiple downward.",
    "Pricing Power: Competitive pressure in field service markets; limited pricing flexibility constrains margin expansion post-deal.",
    "Legacy Systems: Non-integrated backend systems increase integration capex and timeline risk.",
  ],
  valuationReadiness: "medium",
  generatedAt: new Date().toISOString(),
};

export const DEFAULT_ROLLUP_STRATEGY: RollupStrategy = {
  eligible: true,
  eligibilityReason: "Acquisition-ready with Small profile. A tuck-in strategy can accelerate to Mid-Market tier.",
  clientTier: "small",
  clientRevenue: 420000,
  clientEbitda: 185000,
  targetTier: "mid",
  recommendedTargetRevenue: { min: 84000, max: 168000 },
  recommendedTargetEbitda: { min: 8400, max: 42000 },
  targetCount: 4,
  proFormaRevenue: 924000,
  proFormaEbitda: 387500,
  proFormaEbitdaMarginPct: 41.9,
  synergySavingsPct: 15,
  combinedEnterpriseValue: 3681250,
  combinedMultiple: 9.5,
  currentMultiple: 5.0,
  multipleAfterFirstDeal: 7.5,
  multipleAfterRollup: 9.5,
  ceilingAfterRollup: 12,
  multipleTrajectory: [
    { label: "Current Standalone", multiple: 5.0, enterpriseValue: 925000, ebitda: 185000 },
    { label: "After 1 acquisition", multiple: 7.5, enterpriseValue: 2148750, ebitda: 286500 },
    { label: "After 2 acquisitions", multiple: 8.5, enterpriseValue: 3017500, ebitda: 355000 },
    { label: "After 3 acquisitions", multiple: 9.1, enterpriseValue: 3685500, ebitda: 405000 },
    { label: "After 4 acquisitions", multiple: 9.5, enterpriseValue: 3681250, ebitda: 387500 },
  ],
  description: "As a Small company with $420k revenue and $185k EBITDA, by acquiring 4 target(s) in the $84k-$168k revenue range, you can scale to Mid-Market tier and expand your valuation multiple from 5.0x to 12x — unlocking significant enterprise value growth.",
  risks: [
    "Integration risk — combining operations, systems, and cultures requires dedicated leadership.",
    "Customer retention risk — acquired customers may churn during transition.",
    "Financing risk — acquisitions require capital; structure debt carefully.",
    "Talent retention — key employees at the target may leave post-acquisition.",
    "Multiple simultaneous integrations increase execution complexity.",
  ],
  generatedAt: new Date().toISOString(),
};
