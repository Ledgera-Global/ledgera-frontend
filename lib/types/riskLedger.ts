/**
 * Corporate Risk Ledger Types (frontend)
 *
 * Mirrors `ledgera-backend/src/services/insurance/corporateRiskLedger.ts`.
 * Declared separately rather than imported because the frontend must never pull
 * a module that reaches the database client.
 *
 * The ledger is the company's risk balance sheet: what the operation is exposed
 * to, what coverage answers it, and where the two disagree.
 */

export type CoverageLine =
  | "general_liability"
  | "workers_compensation"
  | "commercial_auto"
  | "umbrella_excess"
  | "commercial_property"
  | "inland_marine"
  | "equipment_breakdown"
  | "cyber"
  | "pollution_environmental"
  | "professional_liability"
  | "surety_bond"
  | "other";

export type ExposureState = "covered" | "underinsured" | "uncovered" | "overinsured";

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  carrier: string;
  broker?: string;
  lines: CoverageLine[];
  annualPremiumCents: number;
  deductibleCents: number;
  limitCents: number;
  effectiveDate: string | null;
  expirationDate: string | null;
  namedInsured: string;
  additionalInsureds: string[];
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  line: CoverageLine;
  reserveCents: number;
  paidCents: number;
  incidentDate: string | null;
  open: boolean;
  description: string;
}

export interface RiskExposure {
  line: CoverageLine;
  label: string;
  exposureCents: number;
  coverageLimitCents: number;
  state: ExposureState;
  note: string;
}

export interface RiskSignal {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "coverage_gap" | "renewal" | "claims" | "exposure";
  title: string;
  detail: string;
}

export interface RiskLedgerSource {
  provider: string;
  kind: string;
  connected: boolean;
  note: string;
}

export interface CorporateRiskLedger {
  companyId: string;
  generatedAt: string;
  sources: RiskLedgerSource[];
  policies: InsurancePolicy[];
  claims: InsuranceClaim[];
  premium: {
    totalAnnualPremiumCents: number;
    byLine: Record<string, number>;
    policyCount: number;
  };
  exposures: RiskExposure[];
  claimsSummary: {
    openClaims: number;
    totalIncurredCents: number;
  };
  coverageGaps: string[];
  signals: RiskSignal[];
  riskScore: number;
}
