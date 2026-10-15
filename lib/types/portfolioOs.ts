/**
 * Types for the Portfolio OS screens.
 *
 * These mirror what the backend actually serialises, field for field. They are
 * written out rather than inferred from the backend source because the frontend
 * is a separate deployment: the contract is the JSON, not the TypeScript, and a
 * type that silently tracked a backend refactor would hide a breaking change
 * instead of failing at the boundary.
 *
 * Every optional-looking field here is required in the payload. If a response
 * is missing one, the shape is wrong and the screen should say so rather than
 * render a hole.
 */

/** Weakest first. Matches `PORTFOLIO_ROLES` on the backend. */
export type PortfolioRole = "viewer" | "operator" | "gp";

/** One portfolio the signed-in user belongs to. Powers the portfolio picker. */
export interface PortfolioMembershipSummary {
  portfolioId: string;
  portfolioName: string;
  role: PortfolioRole;
  companyCount: number;
}

export type PortfolioHealth = "strong" | "watch" | "underperforming" | "no_data";

/** One operating company inside a portfolio. */
export interface PortfolioCompany {
  companyId: string;
  name: string;
  health: PortfolioHealth;
  revenue: number;
  grossProfit: number;
  grossMarginPct: number;
  ebitda: number;
  ebitdaMarginPct: number;
  jobsAnalyzed: number;
  /** Rank by EBITDA margin among companies with data. Null when unmeasured. */
  marginRank: number | null;
  /** Annualized EBITDA gap to the portfolio median. Negative = above median. */
  ebitdaGapToMedian: number | null;
  topIssue: string | null;
}

export interface PortfolioCapitalSummary {
  identifiedCostOptimization: number;
  potentialEbitdaImprovement: number;
  potentialEvCreationLow: number;
  potentialEvCreationMid: number;
  potentialEvCreationHigh: number;
  findingsRequiringReview: number;
}

export interface PortfolioSummary {
  totalCompanies: number;
  withData: number;
  strong: number;
  watch: number;
  underperforming: number;
  noData: number;
  portfolioRevenue: number;
  portfolioEbitda: number;
  blendedMarginPct: number;
  valueCreationGap: number;
}

export interface PortfolioPriority {
  companyId: string;
  companyName: string;
  reason: string;
  estimatedAnnualEbitdaLift: number;
}

/** `GET /portfolio/:id/overview` */
export interface PortfolioCoverage {
  totalCompanies: number;
  companiesWithData: number;
  companiesWithoutData: { companyId: string; companyName: string }[];
}

export interface PortfolioOverview {
  generatedAt: string;
  portfolioId: string;
  portfolioName: string;
  role: PortfolioRole;
  coverage: PortfolioCoverage;
  totals: {
    revenue: number;
    grossProfit: number;
    ebitda: number;
    blendedMarginPct: number;
    invoiced: number;
    collected: number;
    uncollected: number;
    jobsAnalyzed: number;
  };
  capital: PortfolioCapitalSummary;
  health: PortfolioSummary;
  priorities: PortfolioPriority[];
  note: string;
}

/** `GET /portfolio/:id/companies` */
export interface PortfolioCompaniesResponse {
  generatedAt: string;
  portfolioId: string;
  portfolioName: string;
  role: PortfolioRole;
  companies: PortfolioCompany[];
  priorities: PortfolioPriority[];
  summary: PortfolioSummary;
}

/** `GET /portfolio/:id/comparison` */
export type ComparisonUnit = "usd" | "percent" | "count";

export interface ComparisonColumn {
  key: string;
  label: string;
  unit: ComparisonUnit;
  higherIsBetter: boolean;
  basis: string;
}

export interface ComparisonRow {
  companyId: string;
  companyName: string;
  health: PortfolioHealth;
  /** Index-aligned to `columns`. Null where the company was not measured. */
  values: (number | null)[];
  rank: number | null;
  noData: boolean;
}

export interface PortfolioComparison {
  generatedAt: string;
  portfolioId: string;
  portfolioName: string;
  role: PortfolioRole;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  medians: (number | null)[];
  rankBy: string;
  withData: number;
  totalCompanies: number;
  note: string;
}

/** `GET /portfolio/:id/capital-allocation` */
export interface CapitalAllocationTarget {
  rank: number;
  companyId: string;
  companyName: string;
  health: PortfolioHealth;
  currentEbitdaMarginPct: number;
  portfolioMedianMarginPct: number;
  marginGapPct: number;
  annualEbitdaOpportunity: number;
  evOpportunityLow: number;
  evOpportunityMid: number;
  evOpportunityHigh: number;
  shareOfOpportunity: number;
  rationale: string;
}

export interface UnmeasuredCompany {
  companyId: string;
  companyName: string;
  reason: string;
}

export interface CapitalAllocation {
  generatedAt: string;
  portfolioId: string;
  portfolioName: string;
  role: PortfolioRole;
  portfolioMedianMarginPct: number;
  evMultiple: number;
  bandNote: string;
  targets: CapitalAllocationTarget[];
  unmeasured: UnmeasuredCompany[];
  totalAnnualEbitdaOpportunity: number;
  totalEvOpportunityMid: number;
  identifiedCostOptimization: number;
  note: string;
}

/** `GET /portfolio` */
export interface PortfolioListResponse {
  portfolios: PortfolioMembershipSummary[];
}
