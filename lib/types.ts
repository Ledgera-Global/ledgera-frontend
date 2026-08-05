// Shared types for the Ledgera platform

export type DashboardMetrics = {
  windowDays: number;
  totalRevenue: number;
  totalProfit: number;
  avgMarginPct: number;
  moneyLeakedThisWeek: number;
};

export type ProfitAlertSeverity = "CLEAN" | "HIGH" | "CRITICAL";

export type ProfitAlert = {
  type: string;
  severity: ProfitAlertSeverity;
  title: string;
  detail: string;
  estimatedLostDollars?: number;
};

export type ProfitAlertsResponse = {
  windowDays: number;
  generatedAt: string;
  alerts: ProfitAlert[];
};

export type JobRow = {
  jobId: string;
  revenue: number;
  cost: number;
  profit: number;
  technician: string;
  durationHours: number | null;
  durationText: string | null;
};

export type JobsResponse = {
  jobs: JobRow[];
};

export type TechnicianRow = {
  technicianId: string;
  technicianName: string | null;
  jobsCount: number;
  revenue: number;
  profit: number;
  marginPct: number;
  revenuePerJob: number;
  profitPerJob: number;
  avgJobDurationHours: number;
  efficiencyScore: number;
};

export type TechnicianEfficiencyResponse = {
  windowDays: number;
  technicians: TechnicianRow[];
};

export type CashFlowResponse = {
  cashIn: number;
  cashOut: number;
  realCashFlow: number;
};

export type LeakageScoreResponse = {
  score: number;
  signal: string;
  totalLeakage: number;
  breakdown: {
    uncollectedRevenue: number;
    underpricedServices: number;
    laborInefficiency: number;
  };
};

export type Lead = {
  companyId: string;
  company: string;
  revenue: string;
  techs: number;
  score: number;
  tier: "HOT" | "WARM" | "COLD";
};

// ─── Integration Types ──────────────────────────────────────────────────

export type IntegrationProvider =
  | "servicetitan"
  | "quickbooks"
  | "gusto"
  | "adpWorkforceNow"
  | "paychexFlex"
  | "netsuite"
  | "calendly"
  | "twilio"
  | "stripe"
  | "samsara";

export type IntegrationStatus = "connected" | "not_connected" | "error" | "demo";

export type IntegrationInfo = {
  provider: IntegrationProvider;
  label: string;
  description: string;
  category: "field-service" | "accounting" | "payroll" | "crm" | "payments" | "communications" | "scheduling" | "data-warehouse";
  status: IntegrationStatus;
  logo?: string;
  docsUrl?: string;
};

// ─── Executive Dashboard Types ──────────────────────────────────────────

export type MarginBucket = {
  revenue: number;
  profit: number;
  margin: number;
};

export type TechRevenueRow = {
  technicianId: string;
  technicianName: string | null;
  revenue: number;
};

export type ArAgingBucket = {
  bucket: string;
  total: number;
  count: number;
};

export type EbitdaForecast = {
  ebitda: number;
  revenue: number;
  expenses: number;
  message: string;
};

export type ValuationResult = {
  ebitda: number;
  valuation: number;
  valuationReadiness: string;
};

export type ExecutiveDashboardResponse = {
  margin: Record<string, MarginBucket>;
  techRevenue: TechRevenueRow[];
  ar: ArAgingBucket[];
  forecast: EbitdaForecast;
  valuation: ValuationResult;
};

// ─── Analytics Types ────────────────────────────────────────────────────

export type MarginInsight = {
  service: string;
  revenue: number;
  profit: number;
  margin: number;
};

export type CallMetric = {
  metric: string;
  value: number;
  unit: string;
};

export type PartsLeakageScore = {
  score: number;
  totalPartsLeakage: number;
  highRiskParts: number;
};

export type ServiceProfitRow = {
  serviceType: string;
  revenue: number;
  profit: number;
  marginPct: number;
  jobCount: number;
};

export type TechProfitRow = {
  technicianId: string;
  technicianName: string | null;
  revenue: number;
  profit: number;
  marginPct: number;
};

export type ArAgingResponse = {
  buckets: ArAgingBucket[];
  totalOutstanding: number;
  atRiskAmount: number;
};

export type EbitdaForecastResponse = {
  currentEbitda: number;
  forecastedEbitda: number;
  growthPct: number;
  message: string;
};

// ─── Acquisition & Diligence Types ──────────────────────────────────────

export type AcquisitionScore = {
  score: number;
  recommendation: string;
  signals: string[];
};

export type DiligenceReport = {
  companyId: string;
  generatedAt: string;
  summary: string;
  sections: {
    title: string;
    findings: string[];
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  }[];
};

// ─── AI Executive Report ────────────────────────────────────────────────

export type AiExecutiveReport = {
  companyId: string;
  report: string;
};

// ─── Platform Stats ─────────────────────────────────────────────────────

export type PlatformStats = {
  totalCompanies: number;
  totalJobsAnalyzed: number;
  totalRevenueTracked: number;
  totalLeakageDetected: number;
  activeIntegrations: number;
};
