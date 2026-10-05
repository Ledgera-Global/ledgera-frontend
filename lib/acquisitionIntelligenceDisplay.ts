import type { DimensionKey, HealthStatus } from "@/lib/types/acquisitionIntelligence";

/**
 * Presentation for the acquisition intelligence page.
 *
 * Kept in one place so the health panel, the variance table, and the deal list
 * cannot disagree about how a grade or a figure reads.
 *
 * The rule that shapes nearly every function here: `null` means "not measured",
 * never "zero". A deal whose post-close EBITDA could not be established is a
 * different product of work from one that earned nothing, and printing "$0"
 * for both would hide the one that needs investigating.
 */

export function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not measured";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** A signed figure, so value destroyed reads as negative at a glance. */
export function formatSignedUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not measured";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  if (value === 0) return formatted;
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatMultiple(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not measured";
  return `${value.toFixed(2)}x`;
}

export function formatPercent(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return "Not measured";
  return `${value.toFixed(digits)}%`;
}

/** A signed percentage, for a variance line. */
export function formatSignedPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return "Not measured";
  const formatted = `${Math.abs(value).toFixed(digits)}%`;
  if (value === 0) return formatted;
  return value > 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatMonthsSettled(months: number): string {
  if (months <= 0) return "closed this month";
  if (months === 1) return "1 month since close";
  if (months < 24) return `${months} months since close`;
  return `${Math.floor(months / 12)} years since close`;
}

/**
 * A date as a person reads it rather than as a machine stores it.
 *
 * Rendered in UTC deliberately. Window boundaries arrive as midnight UTC, and a
 * reader west of Greenwich would otherwise see a period start a day earlier
 * than the period it belongs to.
 */
export function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** How each graded dimension reads, as a chip label. */
export const STATUS_LABEL: Record<HealthStatus, string> = {
  strong: "Strong",
  adequate: "Adequate",
  weak: "Weak",
  unknown: "Not measured",
};

export const STATUS_CLASSES: Record<HealthStatus, string> = {
  strong: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  adequate: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  weak: "bg-red-400/10 text-red-300 border-red-400/20",
  unknown: "bg-surface-700/40 text-surface-300 border-white/10",
};

/** Bar fill colour for a graded dimension. */
export function statusBarClass(status: HealthStatus): string {
  if (status === "strong") return "bg-emerald-400";
  if (status === "adequate") return "bg-amber-400";
  if (status === "weak") return "bg-red-400";
  return "bg-surface-600";
}

/**
 * How a score band reads.
 *
 * A lookup rather than a `Record<Band, string>`, because "not yet measurable"
 * is not a grade the backend chose — it is the absence of one, and it must
 * still render if a future band is added without this file being updated.
 */
export function bandClasses(band: string): string {
  switch (band) {
    case "performing to plan":
      return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
    case "broadly on track":
      return "bg-teal-400/10 text-teal-300 border-teal-400/20";
    case "underperforming":
      return "bg-amber-400/10 text-amber-300 border-amber-400/20";
    case "value at risk":
      return "bg-red-400/10 text-red-300 border-red-400/20";
    default:
      return "bg-surface-700/40 text-surface-300 border-white/10";
  }
}

export function bandLabel(band: string): string {
  if (band === "not yet measurable") return "Not Yet Measurable";
  return band.replace(/\b\w/g, (character) => character.toUpperCase());
}

/** How a variance's direction reads, given it may be unknowable. */
export function varianceClasses(favourable: boolean | null): string {
  if (favourable === null) return "text-surface-400";
  return favourable ? "text-emerald-400" : "text-red-400";
}

/** The plain-English name of each dimension, for a column heading or a chip. */
export const DIMENSION_ORDER: DimensionKey[] = [
  "earnings_delivery",
  "revenue_delivery",
  "integration_discipline",
  "synergy_realization",
  "retention",
  "leverage",
];
