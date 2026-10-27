import type { AttributionGrade } from "@/lib/types/interventions";

/**
 * Presentation for intervention attribution.
 *
 * Formatting lives here so no component invents its own rounding, and so the
 * grade's meaning is stated once. The grade is not decoration: a screen that
 * shows the bridge without it invites an owner to quote a directional
 * observation as a proven result.
 */

export const GRADE_LABEL: Record<AttributionGrade, string> = {
  not_enough_data: "Not enough data",
  directional: "Directional only",
  supported: "Supported by a control",
};

export const GRADE_CLASSES: Record<AttributionGrade, string> = {
  not_enough_data: "border-white/15 bg-surface-900/60 text-surface-300",
  directional: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  supported: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

export const GRADE_EXPLANATION: Record<AttributionGrade, string> = {
  not_enough_data:
    "One or both windows carry too little completed work to compare. No conclusion is offered.",
  directional:
    "A before-and-after comparison moved. Nothing here rules out a company-wide trend, so this is not yet a reason to credit or blame the vendor.",
  supported:
    "An untreated comparison branch moved less than the treated branch, which prices out the season and the market. It is still observational: only a randomised or staggered rollout would support a causal claim.",
};

/** Whole-dollar currency from integer cents. */
export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Signed currency, so a negative is unmistakable in a table. */
export function formatSignedUsd(cents: number): string {
  return `${cents >= 0 ? "+" : "-"}${formatUsd(Math.abs(cents))}`;
}

export function formatSignedPct(pct: number | null): string {
  if (pct === null) return "n/a";
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** Colour by direction, used only where the sign is the point. */
export function signedClass(cents: number): string {
  if (cents > 0) return "text-emerald-400";
  if (cents < 0) return "text-rose-400";
  return "text-surface-300";
}

export function formatWindowDates(startIso: string, endIso: string): string {
  const format = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${format(startIso)} to ${format(endIso)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Banner text for an open or closed measurement window. */
export function openWindowNote(treatmentEnd: string | null): string {
  return treatmentEnd === null
    ? "This window is still open, so the result moves as new work is completed."
    : "This window has been closed, so the result is fixed unless the dates are corrected.";
}
