// ─── Default Data ──────────────────────────────────────────────────────
// Fallback data for acquisition analytics when API is unavailable
// Realistic for a $12.4M revenue HVAC company targeting institutional buyers

import type {
  AcquisitionScore,
  DiligenceReport,
  EnterpriseValuation,
  RollupStrategy,
  LiveEvData,
  MultiplePotential,
  SynergyBreakdown,
  InstitutionalReadiness,
  ActivityEvent,
  ValueCreationBreakdown,
  MultipleFactor,
} from "@/lib/types/acquisition";

const now = new Date().toISOString();

export const DEFAULT_ACQUISITION_SCORE: AcquisitionScore = {
  score: 72,
  scoreTrend: 8,
  recommendation: "Strong acquisition candidate - healthy margins with moderate operational risk. Focus areas: AR aging (22% > 60 days) and technician utilization (74%).",
  signals: [
    "Revenue growth 18% YoY - above industry median of 12%",
    "EBITDA margin 18.6% - exceeds 15% institutional floor",
    "Recurring maintenance agreements at 82% of customer base",
    "Multi-location operations in 3 metro areas",
    "AR aging needs improvement - 22% beyond 60 days",
  ],
};

export const DEFAULT_DILIGENCE_REPORT: DiligenceReport = {
  companyId: "companyA",
  generatedAt: now,
  summary: "Operational due diligence indicates a well-run HVAC platform with moderate risk concentration in AR aging and technician utilization. Financial health is strong with 18.6% EBITDA margin.",
  sections: [
    {
      title: "Financial Health",
      findings: [
        "Revenue trending up 18% YoY - $12.4M trailing twelve months",
        "EBITDA margin 18.6%, above industry benchmark of 15%",
        "Gross margin 42% - healthy for HVAC services mix",
        "Revenue diversification: 55% residential, 35% commercial, 10% new construction",
      ],
      riskLevel: "LOW",
    },
    {
      title: "Operations",
      findings: [
        "Technician utilization at 74% - below 85% institutional target",
        "Average job duration 3.2 hours vs 2.8 benchmark",
        "Dispatch inefficiency detected in 12% of jobs",
        "Fleet of 24 trucks across 3 locations",
      ],
      riskLevel: "MODERATE",
    },
    {
      title: "Accounts Receivable",
      findings: [
        "22% of AR is beyond 60 days - $214K at risk",
        "No automated collection process",
        "DSO at 42 days - above 30-day institutional target",
        "Concentration risk: top 3 customers = 35% of outstanding",
      ],
      riskLevel: "HIGH",
    },
    {
      title: "Compliance & Contracts",
      findings: [
        "All vendor agreements current and in good standing",
        "Worker classification reviewed - no red flags",
        "Insurance coverage adequate for operational scale",
        "No outstanding litigation or material claims",
      ],
      riskLevel: "LOW",
    },
  ],
};

export const DEFAULT_VALUATION: EnterpriseValuation = {
  companyId: "companyA",
  valuation: {
    enterpriseValue: 7380480,
    enterpriseValueToday: 2461,
    enterpriseValueWeek: 18234,
    enterpriseValueQuarter: 127550,
    lastUpdated: now,
    confidence: { low: 6875000, high: 7975000, confidencePct: 91 },
    ebitda: 2306400,
    ebitdaMarginPct: 18.6,
    currentMultiple: 3.2,
    benchmarkMultiple: 5.5,
    multiplePercentile: 18,
    multipleRange: { floor: 2.0, ceiling: 15.0 },
  },
  valueDrivers: {
    ebitdaMargin: {
      score: 85, scoreTrend: 3, weight: 0.30, contribution: 2.55,
      detail: "18.6% margin (24% above 15% institutional floor)",
      benchmark: "15% (mid-market minimum); 18% (strong performer); 22%+ (top quartile)",
    },
    revenueScale: {
      score: 60, scoreTrend: 5, weight: 0.20, contribution: 1.2,
      detail: "$12.4M annualized revenue - solid lower-middle-market profile",
      benchmark: "Supports 3x - 7x multiple in field service cohort; $5M+ threshold for institutional buyers",
    },
    arHealth: {
      score: 52, scoreTrend: -2, weight: 0.15, contribution: 0.78,
      detail: "78% of AR current; 22% aged 30+ days; DSO 42 days",
      benchmark: "Institutional buyers require 70%+ current; flag risk above 30%; target DSO < 35",
    },
    techUtilization: {
      score: 60, scoreTrend: 4, weight: 0.10, contribution: 0.6,
      detail: "74% technician billable hours (+4% this quarter)",
      benchmark: "80%+ utilization expected post-acquisition; gap = growth leverage worth ~$380K EBITDA",
    },
    integrationDensity: {
      score: 50, scoreTrend: 10, weight: 0.10, contribution: 0.5,
      detail: "3 data sources connected (ServiceTitan, QuickBooks, Gusto); improving",
      benchmark: "3+ integrated sources = higher predictability score; attracts PE/strategic buyers",
    },
    profitLeakage: {
      score: 65, scoreTrend: 0, weight: 0.15, contribution: 0.975,
      detail: "Cost-to-revenue ratio 22%; gross margin 42%",
      benchmark: "Acceptable range 18% - 25%; >25% signals operational drag",
    },
  },
  scenarios: {
    conservative: { multiple: 2.5, enterpriseValue: 5766000 },
    midpoint: { multiple: 4.0, enterpriseValue: 9225600 },
    optimistic: { multiple: 7.0, enterpriseValue: 16144800 },
  },
  signals: [
    { type: "strength", metric: "EBITDA Margin", message: "18.6% EBITDA margin exceeds institutional 15% floor and mid-market 18% threshold. Reflects disciplined cost structure and pricing power.", impact: "raises_multiple", magnitude: 80 },
    { type: "strength", metric: "Revenue Scale", message: "$12.4M annualized revenue places company firmly in lower-middle-market. Sufficient scale to support institutional systems and FTE overhead.", impact: "raises_multiple", magnitude: 60 },
    { type: "concern", metric: "AR Aging", message: "22% of receivables aged >60 days; DSO at 42 days. Institutional buyers target <35 DSO and <15% aged.", impact: "lowers_multiple", magnitude: -75 },
    { type: "concern", metric: "Technician Utilization", message: "74% billable utilization is 6% below institutional standard (80%). Represents ~$380K in unrealized capacity.", impact: "lowers_multiple", magnitude: -50 },
    { type: "neutral", metric: "Customer Concentration", message: "Top 3 customers = 35% of AR. Below 50% concentration threshold but warrants monitoring as scale increases.", impact: "neutral", magnitude: 0 },
    { type: "strength", metric: "Recurring Revenue", message: "82% of customer base on maintenance agreements - strong recurring revenue base improves predictability.", impact: "raises_multiple", magnitude: 50 },
  ],
  riskFactors: [
    "Customer Concentration: Top 3 customers represent 35% of AR. Mitigation: expand commercial book and geographic footprint.",
    "Technician Attrition: 74% utilization may signal retention risk; market for skilled HVAC techs is competitive.",
    "Revenue Seasonality: HVAC industry peaks Q2-Q3; seasonal working capital needs may stress cash flow.",
    "Legacy Systems: Manual dispatch and paper invoicing at 1 of 3 locations increases integration risk post-acquisition.",
  ],
  valuationReadiness: "medium",
  generatedAt: now,
};

export const DEFAULT_LIVE_EV: LiveEvData = {
  enterpriseValue: 7380480,
  todayChange: 2461,
  weekChange: 18234,
  quarterChange: 127550,
  lastUpdated: now,
  secondsSinceUpdate: 13,
  activity: [
    { time: new Date(Date.now() - 3600000).toISOString(), type: "invoice_paid", message: "3 invoices paid - $12,400 collected", value: 12400, unit: "$" },
    { time: new Date(Date.now() - 7200000).toISOString(), type: "ebitda_updated", message: "EBITDA forecast increased by $14,500", value: 14500, unit: "$" },
    { time: new Date(Date.now() - 10800000).toISOString(), type: "metric_improved", message: "Technician utilization reached 82%", value: 82, unit: "%" },
    { time: new Date(Date.now() - 14400000).toISOString(), type: "job_completed", message: "7 jobs completed - avg margin 42.3%", value: 42.3, unit: "%" },
    { time: new Date(Date.now() - 18000000).toISOString(), type: "risk_decreased", message: "AR aging improved - 60+ day bucket down 8%", value: 8, unit: "%" },
    { time: new Date(Date.now() - 21600000).toISOString(), type: "ebitda_updated", message: "Enterprise Value +$9,200 on trailing EBITDA update", value: 9200, unit: "$" },
  ],
  valueCreation: {
    todayChange: 18742,
    revenue: 12100,
    grossMargin: 3400,
    arCollections: 2100,
    dispatchEfficiency: 1142,
  },
};

export const DEFAULT_MULTIPLE_POTENTIAL: MultiplePotential = {
  currentMultiple: 3.2,
  previousMultiple: 3.1,
  ceiling: 15.0,
  floor: 2.0,
  projectedMultiple: 7.8,
  factors: [
    { label: "EBITDA margin > 18%", impact: 0.8, detail: "18.6% margin exceeds institutional floor of 15%" },
    { label: "Recurring maintenance agreements", impact: 0.6, detail: "82% of customer base on recurring contracts" },
    { label: "Multi-location operations", impact: 0.5, detail: "3 metro area locations reduce geographic concentration risk" },
    { label: "Strong technician utilization", impact: 0.4, detail: "74% utilization trending toward 80% target" },
    { label: "Healthy AR", impact: 0.3, detail: "78% current; improving collections with new system" },
    { label: "Customer concentration risk", impact: -0.5, detail: "Top 3 customers = 35% of AR" },
    { label: "AR aging > 60 days", impact: -0.3, detail: "22% of AR beyond 60 days - higher than institutional norm" },
  ],
};

export const DEFAULT_SYNERGY_BREAKDOWN: SynergyBreakdown = {
  totalAnnualSynergy: 214000,
  lines: [
    { label: "Fleet savings", annualSavings: 62000, detail: "Consolidated routing and maintenance across combined fleet" },
    { label: "Payroll optimization", annualSavings: 58000, detail: "Shared administrative functions reduce overhead" },
    { label: "Software consolidation", annualSavings: 44000, detail: "Single stack eliminates redundant SaaS licenses" },
    { label: "Purchasing leverage", annualSavings: 50000, detail: "Volume pricing on equipment and parts across combined entity" },
  ],
};

export const DEFAULT_READINESS: InstitutionalReadiness = {
  overallScore: 72,
  maxScore: 100,
  categories: [
    { label: "Financial Health", score: 85, maxScore: 100, status: "healthy" },
    { label: "Operations", score: 68, maxScore: 100, status: "attention" },
    { label: "AR Management", score: 52, maxScore: 100, status: "critical" },
    { label: "Data Integration", score: 50, maxScore: 100, status: "attention" },
    { label: "Recurring Revenue", score: 82, maxScore: 100, status: "healthy" },
    { label: "Customer Diversification", score: 65, maxScore: 100, status: "attention" },
  ],
  actionableNextStep: "Implement automated AR collections to reduce 60+ day bucket from 22% to <15%",
};

export const DEFAULT_ROLLUP_STRATEGY: RollupStrategy = {
  eligible: true,
  eligibilityReason: "Acquisition-ready with Lower-Middle-Market profile. A tuck-in strategy can accelerate to Institutional tier.",
  clientTier: "mid",
  clientRevenue: 12400000,
  clientEbitda: 2306400,
  targetTier: "large",
  recommendedTargetRevenue: { min: 2480000, max: 4960000 },
  recommendedTargetEbitda: { min: 248000, max: 1240000 },
  targetCount: 3,
  proFormaRevenue: 27280000,
  proFormaEbitda: 5290320,
  proFormaEbitdaMarginPct: 19.4,
  synergySavingsPct: 12,
  combinedEnterpriseValue: 47612880,
  combinedMultiple: 9.0,
  currentMultiple: 3.2,
  multipleAfterFirstDeal: 5.0,
  multipleAfterRollup: 9.0,
  ceilingAfterRollup: 12.0,
  multipleTrajectory: [
    { label: "Standalone", multiple: 3.2, enterpriseValue: 7380480, ebitda: 2306400 },
    { label: "1 Acquisition", multiple: 5.0, enterpriseValue: 16532000, ebitda: 3306400 },
    { label: "2 Acquisitions", multiple: 7.0, enterpriseValue: 32239200, ebitda: 4605600 },
    { label: "Regional Platform", multiple: 9.0, enterpriseValue: 47612880, ebitda: 5290320 },
    { label: "National Platform", multiple: 12.0, enterpriseValue: 72179200, ebitda: 6014933 },
  ],
  synergyBreakdown: DEFAULT_SYNERGY_BREAKDOWN,
  modelAssumptions: [
    { label: "Procurement synergy", value: "15% cost reduction on equipment and parts" },
    { label: "SG&A reduction", value: "4% through shared administrative functions" },
    { label: "EBITDA margin maintained", value: "Targets acquired at 15-18% margin; post-synergy expansion to 19.4%" },
    { label: "Customer churn", value: "No material churn assumed; retention rate 92%+" },
    { label: "Debt financing", value: "80% debt / 20% equity; assumes 8% cost of debt" },
    { label: "Integration timeline", value: "6 months per acquisition; full synergies realized in 12 months" },
    { label: "Tech stack consolidation", value: "Acquired companies migrate to Ledgera/ServiceTitan within 90 days" },
  ],
  description: "As a Lower-Middle-Market company with $12.4M revenue and $2.3M EBITDA, you are well-positioned to execute a tuck-in acquisition strategy. By acquiring 3 target(s) in the $2.5M-$5.0M revenue range, you can scale to Institutional tier and expand your valuation multiple from 3.2x to 12.0x - unlocking $64.8M in enterprise value.",
  risks: [
    "Integration risk - combining operations, systems, and cultures across multiple acquisitions requires dedicated M&A leadership.",
    "Customer retention risk - acquired customers may churn during transition; target retention rate 92%+",
    "Financing risk - $8-15M in acquisition capital required; structure debt carefully at current rate environment.",
    "Talent retention - key employees at acquired targets may leave post-acquisition; consider earn-outs and retention bonuses.",
    "Market risk - HVAC multiple compression in rising rate environment could reduce exit valuation.",
  ],
  generatedAt: now,
};

export const DEFAULT_VALUE_CREATION: ValueCreationBreakdown = {
  todayChange: 18742,
  revenue: 12100,
  grossMargin: 3400,
  arCollections: 2100,
  dispatchEfficiency: 1142,
};

export const DEFAULT_ACTIVITY_EVENTS: ActivityEvent[] = DEFAULT_LIVE_EV.activity;
