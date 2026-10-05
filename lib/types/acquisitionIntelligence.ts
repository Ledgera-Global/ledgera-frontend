/**
 * Acquisition Intelligence — the shape the backend returns.
 *
 * Mirrors `ledgera-backend/src/services/acquisition/acquisitionTypes.ts`. Two
 * rules carried over from there matter at this layer too:
 *
 *   Absence is not zero. A figure that could not be measured arrives as `null`
 *   carrying a reason. Rendering it as 0 would make a deal that was never
 *   measured look like a deal that earned nothing, and only one of those is
 *   worth investigating.
 *
 *   A score is only offered where enough of the case is measurable. When the
 *   backend withholds one, `score` is null and `band` reads "not yet
 *   measurable" — a state to display, not an error to paper over.
 */

export type HealthStatus = "strong" | "adequate" | "weak" | "unknown";

export type DimensionKey =
  | "earnings_delivery"
  | "revenue_delivery"
  | "integration_discipline"
  | "synergy_realization"
  | "retention"
  | "leverage";

/** One measurement window of the acquisition's post-close results. */
export interface AcquisitionPeriodReading {
  label: string;
  periodStart: string;
  periodEnd: string;
  actualRevenue: number | null;
  actualEbitda: number | null;
  actualIntegrationCost: number | null;
  actualSynergyAnnual: number | null;
  source: "recorded" | "derived";
}

/** Underwritten versus actual for one metric. */
export interface Variance {
  metric: string;
  label: string;
  underwritten: number | null;
  actual: number | null;
  varianceAbs: number | null;
  variancePct: number | null;
  favourable: boolean | null;
}

/** One graded dimension of the deal. */
export interface HealthDimension {
  key: DimensionKey;
  label: string;
  weight: number;
  status: HealthStatus;
  value: number | null;
  statement: string;
  unavailableReason?: string;
}

/** What the acquisition has done to enterprise value so far. */
export interface ValueCreation {
  entryMultiple: number | null;
  purchasePrice: number;
  underwrittenEbitda: number | null;
  actualEbitda: number | null;
  currentValueAtEntryMultiple: number | null;
  evCreated: number | null;
  integrationOverrun: number | null;
  netValueCreated: number | null;
  valueMultiple: number | null;
}

/** The full report for one acquisition. */
export interface AcquisitionReport {
  acquisitionId: string;
  targetName: string;
  industry: string | null;
  geography: string | null;
  closedAt: string;
  monthsSinceClose: number;
  periods: AcquisitionPeriodReading[];
  variances: Variance[];
  health: {
    score: number | null;
    band: string;
    measuredWeight: number;
    coverage: number;
    dimensions: HealthDimension[];
  };
  valueCreation: ValueCreation;
  note: string;
}

/** The portfolio view: every acquisition the tenant has closed. */
export interface AcquisitionPortfolio {
  generatedAt: string;
  acquisitions: AcquisitionReport[];
  summary: {
    total: number;
    scored: number;
    valueAtRisk: number;
    underperforming: number;
    onTrack: number;
    totalNetValueCreated: number;
    valueMeasuredFor: number;
    purchasePriceDeployed: number;
  };
  priorities: {
    acquisitionId: string;
    targetName: string;
    reason: string;
    netValueCreated: number | null;
  }[];
}
