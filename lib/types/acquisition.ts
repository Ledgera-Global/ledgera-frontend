// ─── Enterprise Valuation & Acquisition Domain Types ───────────────────
// Institutional-grade type definitions for M&A analytics
// Versions: 2026-07 — Live EV, activity feed, synergy breakdown, readiness

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type ValuationReadiness = "high" | "medium" | "low";

export type SignalType = "strength" | "concern" | "neutral";

export type SignalImpact = "raises_multiple" | "lowers_multiple" | "neutral";

// ─── Acquisition Score ──────────────────────────────────────────────────

export type AcquisitionScore = {
  score: number;
  scoreTrend: number; // +N this month
  recommendation: string;
  signals: string[];
};

// ─── Diligence Report ───────────────────────────────────────────────────

export type DiligenceSection = {
  title: string;
  findings: string[];
  riskLevel: RiskLevel;
};

export type DiligenceReport = {
  companyId: string;
  generatedAt: string;
  summary: string;
  sections: DiligenceSection[];
};

// ─── Enterprise Valuation ───────────────────────────────────────────────

export type MultipleRange = {
  floor: number;
  ceiling: number;
};

export type ConfidenceInterval = {
  low: number;
  high: number;
  confidencePct: number;
};

export type ValuationMetrics = {
  enterpriseValue: number;
  enterpriseValueToday: number; // change today in dollars
  enterpriseValueWeek: number;  // change this week
  enterpriseValueQuarter: number; // change this quarter
  lastUpdated: string; // ISO timestamp
  confidence: ConfidenceInterval;
  ebitda: number;
  ebitdaMarginPct: number;
  currentMultiple: number;
  benchmarkMultiple: number;
  multiplePercentile: number;
  multipleRange: MultipleRange;
};

export type ValueDriverKey =
  | "ebitdaMargin"
  | "revenueScale"
  | "arHealth"
  | "techUtilization"
  | "integrationDensity"
  | "profitLeakage";

export type ValueDriver = {
  score: number;
  scoreTrend: number; // +N this month
  weight: number;
  contribution: number;
  detail: string;
  benchmark: string;
};

export type ScenarioKey = "conservative" | "midpoint" | "optimistic";

export type Scenario = {
  multiple: number;
  enterpriseValue: number;
};

export type ValuationSignal = {
  type: SignalType;
  metric: string;
  message: string;
  impact: SignalImpact;
  magnitude: number;
};

export type EnterpriseValuation = {
  companyId: string;
  valuation: ValuationMetrics;
  valueDrivers: Record<ValueDriverKey, ValueDriver>;
  scenarios: Record<ScenarioKey, Scenario>;
  signals: ValuationSignal[];
  riskFactors: string[];
  valuationReadiness: ValuationReadiness;
  generatedAt: string;
};

// ─── Live EV & Activity Feed ────────────────────────────────────────────

export type ActivityEvent = {
  time: string; // ISO timestamp
  type: "metric_improved" | "invoice_paid" | "job_completed" | "risk_decreased" | "ebitda_updated";
  message: string;
  value?: number;
  unit?: string;
};

export type ValueCreationBreakdown = {
  todayChange: number;
  revenue: number;
  grossMargin: number;
  arCollections: number;
  dispatchEfficiency: number;
};

export type LiveEvData = {
  enterpriseValue: number;
  todayChange: number;
  weekChange: number;
  quarterChange: number;
  lastUpdated: string; // ISO timestamp — updated 13 seconds ago
  secondsSinceUpdate: number;
  activity: ActivityEvent[];
  valueCreation: ValueCreationBreakdown;
};

// ─── Multiple Factors ───────────────────────────────────────────────────

export type MultipleFactor = {
  label: string;
  impact: number; // +0.8x, -0.5x etc
  detail: string;
};

export type MultiplePotential = {
  currentMultiple: number;
  previousMultiple: number; // for trend
  ceiling: number;
  floor: number;
  projectedMultiple: number;
  factors: MultipleFactor[];
};

// ─── Synergy Breakdown ──────────────────────────────────────────────────

export type SynergyLine = {
  label: string;
  annualSavings: number;
  detail: string;
};

export type SynergyBreakdown = {
  totalAnnualSynergy: number;
  lines: SynergyLine[];
};

// ─── Missed Call Revenue Impact ──────────────────────────────────────────

export type MissedCallRevenueImpact = {
  missedCalls: number;
  estimatedBookingRate: number;
  estimatedBookableCallsLost: number;
  avgRevenuePerCall: number;
  revenueOpportunityLost: number;
  grossMarginPct: number;
  grossProfitLost: number;
  annualEbitdaImpact: number;
  enterpriseValueImpact: number;
  appliedMultiple: number;
  daysAnalyzed: number;
  periodLabel: string;
  benchmark?: {
    industryAvgBookingRate: number;
    benchmarkRevenueLost: number;
    gapVsBenchmark: number;
  };
};

// ─── Enterprise Value Growth Plan ────────────────────────────────────────

export type PriorityCategory =
  | "calls"
  | "dispatch"
  | "install_margin"
  | "maintenance"
  | "technician"
  | "pricing"
  | "ar"
  | "integration";

export type EffortLevel = "low" | "medium" | "high";

export type GrowthPriority = {
  rank: number;
  title: string;
  category: PriorityCategory;
  currentMetric: string;
  targetMetric: string;
  expectedEbitdaImpact: number;
  expectedEnterpriseValueImpact: number;
  effort: EffortLevel;
  timeframe: string;
  prescription: string;
  diagnosis: string;
};

export type EnterpriseValueGrowthPlan = {
  companyId: string;
  generatedAt: string;
  currentEnterpriseValue: number;
  currentEbitda: number;
  currentMultiple: number;
  potentialEnterpriseValue: number;
  valueCreationGap: number;
  priorities: GrowthPriority[];
  summary: string;
};

// ─── Roll-Up Strategy ───────────────────────────────────────────────────

export type RevenueRange = {
  min: number;
  max: number;
};

export type MultipleTrajectoryPoint = {
  label: string;
  multiple: number;
  enterpriseValue: number;
  ebitda: number;
};

export type ModelAssumption = {
  label: string;
  value: string;
};

export type RollupStrategy = {
  eligible: boolean;
  eligibilityReason: string;
  clientTier: string;
  clientRevenue: number;
  clientEbitda: number;
  targetTier: string;
  recommendedTargetRevenue: RevenueRange;
  recommendedTargetEbitda: RevenueRange;
  targetCount: number;
  proFormaRevenue: number;
  proFormaEbitda: number;
  proFormaEbitdaMarginPct: number;
  synergySavingsPct: number;
  combinedEnterpriseValue: number;
  combinedMultiple: number;
  currentMultiple: number;
  multipleAfterFirstDeal: number;
  multipleAfterRollup: number;
  ceilingAfterRollup: number;
  multipleTrajectory: MultipleTrajectoryPoint[];
  synergyBreakdown: SynergyBreakdown;
  modelAssumptions: ModelAssumption[];
  description: string;
  risks: string[];
  generatedAt: string;
};

// ─── Institutional Readiness ────────────────────────────────────────────

export type ReadinessCategory = {
  label: string;
  score: number;
  maxScore: number;
  status: "healthy" | "attention" | "critical";
};

export type InstitutionalReadiness = {
  overallScore: number;
  maxScore: number;
  categories: ReadinessCategory[];
  actionableNextStep: string;
};

// ─── Marketing Profit Intelligence ──────────────────────────────────────

export type CampaignChannel =
  | "google"
  | "meta"
  | "callrail"
  | "direct"
  | "other";

export type CampaignStatus =
  | "scaling"
  | "holding"
  | "trimming"
  | "candidate_off";

export type MarketingCampaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  spend: number;
  leads: number;
  bookedJobs: number;
  revenue: number;
  materialCost: number;
  laborCost: number;
  grossProfit: number;
  grossMarginPct: number;
  costPerLead: number;
  costPerBookedJob: number;
  closeRatePct: number;
  paybackMonths: number;
  status: CampaignStatus;
  /** Gross profit minus marketing spend. Optional in inputs; the engine computes it. */
  profitAfterMarketing?: number;
};

export type DiagnosticSeverity = "low" | "medium" | "high";

export type MarketingProfitDiagnostic = {
  campaignId: string;
  campaignName: string;
  severity: DiagnosticSeverity;
  finding: string;
  evidence: string;
  recommendedAction: string;
  profitImpactEstimate: number;
};

export type MarketingProfitReport = {
  companyId: string;
  generatedAt: string;
  periodLabel: string;
  totalSpend: number;
  totalRevenue: number;
  totalGrossProfit: number;
  profitAfterMarketing: number;
  marketingROAS: number;
  marketingProfitRatio: number;
  totalProfitLeaking: number;
  campaigns: MarketingCampaign[];
  diagnostics: MarketingProfitDiagnostic[];
  enterpriseValueImpact: number;
  appliedMultiple: number;
  narrative: string;
};

// ─── Benchmarking ───────────────────────────────────────────────────────

export type BenchmarkAssessment =
  | "Above median"
  | "Near top quartile"
  | "Below median";

export type BenchmarkMetric = {
  key: string;
  label: string;
  value: number;
  benchmarkValue: number;
  topQuartileValue: number;
  percentile: number;
  assessment: BenchmarkAssessment;
};

export type BenchmarkReport = {
  companyId: string;
  generatedAt: string;
  cohort: string;
  cohortSize: number;
  metrics: BenchmarkMetric[];
  summary: string;
};
