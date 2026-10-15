/**
 * Formatting and labelling for the Portfolio OS screens.
 *
 * Kept apart from the components so the rules that decide what a blank looks
 * like are stated once. The rule that matters most here is the blank: a company
 * that was not measured has a null, and a null must never be rendered as a
 * zero, a dash that reads like a zero, or an empty cell that looks like a
 * styling bug. It renders as an explicit "Not measured".
 */

import type {
  ComparisonUnit,
  PortfolioHealth,
  PortfolioRole,
} from "./types/portfolioOs";

/** The one string used everywhere a value could not be measured. */
export const NOT_MEASURED = "Not measured";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Whole dollars. `null` renders as the explicit not-measured label. */
export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return NOT_MEASURED;
  }
  return usd.format(value);
}

/** One decimal place. `null` renders as the explicit not-measured label. */
export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return NOT_MEASURED;
  }
  return `${value.toFixed(1)}%`;
}

/** Plain count. `null` renders as the explicit not-measured label. */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return NOT_MEASURED;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

/** Format a comparison cell according to its column's unit. */
export function formatByUnit(
  value: number | null,
  unit: ComparisonUnit
): string {
  switch (unit) {
    case "usd":
      return formatUsd(value);
    case "percent":
      return formatPct(value);
    case "count":
      return formatCount(value);
  }
}

/**
 * Compact currency for headline tiles, where the full figure would overflow a
 * card on a narrow screen. Above $1m it switches to millions with one decimal,
 * and says so with the suffix rather than by dropping digits silently.
 */
export function formatUsdCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return NOT_MEASURED;
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return usd.format(value);
}

/** Readable label for a health band. Never abbreviated. */
export const HEALTH_LABELS: Record<PortfolioHealth, string> = {
  strong: "Strong",
  watch: "Watch",
  underperforming: "Underperforming",
  no_data: "No data",
};

/** Tailwind classes for a health pill. */
export const HEALTH_CLASSES: Record<PortfolioHealth, string> = {
  strong: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  watch: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  underperforming: "border-red-400/30 bg-red-500/10 text-red-200",
  no_data: "border-white/10 bg-white/[0.03] text-surface-400",
};

/**
 * What each role may do, in the user's words rather than the enum's.
 *
 * Mirrors `PORTFOLIO_ROLE_LABELS` on the backend. Duplicated deliberately: the
 * backend's copy is for logs and API consumers, this one is for the screen, and
 * a UI that reached into the backend for its own labels would need a request to
 * explain a permission the user already holds.
 */
export const ROLE_LABELS: Record<PortfolioRole, string> = {
  viewer: "Viewer - read-only access to every report in this portfolio",
  operator: "Operator - may also trigger data refreshes",
  gp: "GP - may also manage portfolio membership",
};

/** Short form of the role, for a compact badge. */
export const ROLE_BADGES: Record<PortfolioRole, string> = {
  viewer: "Viewer",
  operator: "Operator",
  gp: "GP",
};

/**
 * Share of the portfolio's total opportunity, as a percentage string.
 * `null` (no opportunity anywhere in the portfolio) renders as not measured
 * rather than as 0%, which would imply the company had been assessed.
 */
export function formatShare(share: number | null | undefined): string {
  if (share === null || share === undefined || !Number.isFinite(share)) {
    return NOT_MEASURED;
  }
  return `${(share * 100).toFixed(1)}%`;
}
