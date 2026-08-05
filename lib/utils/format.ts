// ─── Formatting Utilities ─────────────────────────────────────────────
// Institutional-grade formatting helpers for financial data

/**
 * Format a number as USD currency with 0 decimal places.
 * @example fmt(925000) → "$925,000"
 */
export function fmt(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

/**
 * Format a number as a percentage with one decimal place.
 * @example pct(22.0) → "22.0%"
 */
export function pct(v: number): string {
  return `${v.toFixed(1)}%`;
}

/**
 * Format a multiple value.
 * @example mult(5.0) → "5.0x"
 */
export function mult(v: number): string {
  return `${v.toFixed(1)}x`;
}

/**
 * Short format for large numbers (millions / thousands).
 * @example compact(925000) → "$925K"
 * @example compact(1250000) → "$1.3M"
 */
export function compact(v: number): string {
  if (Math.abs(v) >= 1_000_000) {
    return `$${(v / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(v) >= 1_000) {
    return `$${(v / 1_000).toFixed(0)}K`;
  }
  return fmt(v);
}

/**
 * Convert a camelCase string to Title Case with spaces.
 * @example titleCase("ebitdaMargin") → "Ebitda Margin"
 */
export function titleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Format a timestamp to relative time like "Updated 10:32 PM"
 */
export function formatUpdateTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date for reports with full date + time.
 */
export function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
