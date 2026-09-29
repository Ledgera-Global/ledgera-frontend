import type { CoverageLine, ExposureState, RiskSignal } from "@/lib/types/riskLedger";

/**
 * Presentation helpers for the Corporate Risk Ledger.
 *
 * Every string here is a label for a value the backend already computed —
 * nothing on this page derives a financial figure. Keeping the vocabulary in
 * one place means the exposure grid, the signals list and the policy table
 * cannot disagree about what "underinsured" means.
 */

export const COVERAGE_LABEL: Record<CoverageLine, string> = {
  general_liability: "General liability",
  workers_compensation: "Workers' compensation",
  commercial_auto: "Commercial auto",
  umbrella_excess: "Umbrella / excess",
  commercial_property: "Commercial property",
  inland_marine: "Inland marine",
  equipment_breakdown: "Equipment breakdown",
  cyber: "Cyber",
  pollution_environmental: "Pollution / environmental",
  professional_liability: "Professional liability",
  surety_bond: "Surety bond",
  other: "Other",
};

export const EXPOSURE_STATE_LABEL: Record<ExposureState, string> = {
  covered: "Covered",
  underinsured: "Underinsured",
  uncovered: "Uncovered",
  overinsured: "Overinsured",
};

/** Tailwind classes for an exposure state badge. */
export const EXPOSURE_STATE_CLASSES: Record<ExposureState, string> = {
  covered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  underinsured: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  uncovered: "border-red-400/30 bg-red-400/10 text-red-300",
  overinsured: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

export const SEVERITY_CLASSES: Record<RiskSignal["severity"], string> = {
  critical: "border-red-400/30 bg-red-400/10 text-red-300",
  high: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  medium: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  low: "border-white/15 bg-white/5 text-surface-300",
};

export const SEVERITY_LABEL: Record<RiskSignal["severity"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Format whole cents as US dollars, rounding to the nearest dollar. */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Format whole cents as US dollars with cents shown. */
export function formatCentsExact(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format an ISO date as a short US date, or an em dash when absent. */
export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A one-line read on the overall risk score. */
export function riskScoreVerdict(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: "Well covered", className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" };
  }
  if (score >= 60) {
    return { label: "Broadly covered", className: "border-sky-400/30 bg-sky-400/10 text-sky-300" };
  }
  if (score >= 35) {
    return { label: "Gaps to close", className: "border-amber-400/30 bg-amber-400/10 text-amber-300" };
  }
  return { label: "Materially underinsured", className: "border-red-400/30 bg-red-400/10 text-red-300" };
}

/** Count exposures by state. */
export function countExposures(states: ExposureState[]): Record<ExposureState, number> {
  const counts: Record<ExposureState, number> = {
    covered: 0,
    underinsured: 0,
    uncovered: 0,
    overinsured: 0,
  };
  for (const state of states) counts[state] += 1;
  return counts;
}
