// ─── Enterprise Valuation & Acquisition Domain Types ───────────────────
// Institutional-grade type definitions for M&A analytics

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type ValuationReadiness = "high" | "medium" | "low";

export type SignalType = "strength" | "concern" | "neutral";

export type SignalImpact = "raises_multiple" | "lowers_multiple" | "neutral";

// ─── Acquisition Score ──────────────────────────────────────────────────

export type AcquisitionScore = {
  score: number;
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

export type ValuationMetrics = {
  enterpriseValue: number;
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
  description: string;
  risks: string[];
  generatedAt: string;
};
