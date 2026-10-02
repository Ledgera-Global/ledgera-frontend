import type {
  DimensionStatus,
  DimensionUnit,
  FreshnessState,
  ImpactClass,
  SyncCadence,
} from "@/lib/types/live";

/**
 * Shared presentation for the live visibility page.
 *
 * Kept in one place so the freshness badge, the identity chips, and the event
 * feed cannot drift apart in their wording or colour. The colour rules here
 * carry the product's central claim: anything that may not be presented as
 * current is visually distinct from anything that may.
 */

// ── Money ───────────────────────────────────────────────────────────────────

/**
 * Cents to a whole-dollar string. Rounded, never truncated, because a truncated
 * figure reads as a smaller number than the one actually recorded.
 */
export function formatCents(cents: number | null): string {
  if (cents === null) return "No amount";
  const sign = cents < 0 ? "-" : "";
  const dollars = Math.abs(Math.round(cents / 100));
  return `${sign}${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars)}`;
}

/** Signed cents for the event feed, where direction is the point. */
export function formatSignedCents(cents: number | null): string {
  if (cents === null) return "";
  const formatted = formatCents(Math.abs(cents));
  return cents < 0 ? `-${formatted}` : `+${formatted}`;
}

// ── Dimension values ────────────────────────────────────────────────────────

export function formatDimensionValue(
  value: number | null,
  unit: DimensionUnit
): string {
  if (value === null) return "Not measured";

  switch (unit) {
    case "cents":
      return formatCents(value);
    case "percent":
      return `${value.toFixed(0)}%`;
    case "days":
      return `${value.toFixed(0)} days`;
    case "ratio":
      return value.toFixed(2);
    case "count":
      return String(Math.round(value));
  }
}

/** The change against the prior window, or a stated reason there is none. */
export function formatChange(changePct: number | null): string {
  if (changePct === null) return "No prior period";
  const arrow = changePct > 0 ? "▲" : changePct < 0 ? "▼" : "—";
  const magnitude = Math.abs(changePct).toFixed(1);
  return `${arrow} ${magnitude}% vs prior`;
}

// ── Dimension status ────────────────────────────────────────────────────────

export const DIMENSION_LABEL: Record<DimensionStatus, string> = {
  strong: "Strong",
  adequate: "Adequate",
  weak: "Weak",
  unknown: "Not measured",
};

export const DIMENSION_CLASSES: Record<DimensionStatus, string> = {
  strong: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  adequate: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  weak: "bg-red-400/10 text-red-300 border-red-400/20",
  unknown: "bg-surface-700/40 text-surface-300 border-white/10",
};

/** Bar fill for a dimension, by status. Unknown renders no fill at all. */
export function dimensionBarClass(status: DimensionStatus): string {
  if (status === "strong") return "bg-emerald-400";
  if (status === "adequate") return "bg-amber-400";
  if (status === "weak") return "bg-red-400";
  return "bg-transparent";
}

/**
 * Bar width for a dimension.
 *
 * An unknown dimension gets zero width rather than a mid-point guess: drawing a
 * bar for a number we do not have is the exact failure this page exists to
 * prevent.
 */
export function dimensionBarWidth(
  value: number | null,
  unit: DimensionUnit
): number {
  if (value === null) return 0;
  if (unit === "percent") return Math.max(0, Math.min(100, value));
  if (unit === "days") return Math.max(0, Math.min(100, (value / 180) * 100));
  // Cents, ratios and counts have no natural 0-100 scale, so the bar is
  // suppressed rather than fabricated.
  return 0;
}

export function hasScaledBar(unit: DimensionUnit): boolean {
  return unit === "percent" || unit === "days";
}

// ── Freshness ───────────────────────────────────────────────────────────────

export const FRESHNESS_LABEL: Record<FreshnessState, string> = {
  live: "Live",
  current: "Current",
  overdue: "Overdue",
  stale: "Stale",
  failing: "Failing",
  never: "Never synced",
};

export const FRESHNESS_CLASSES: Record<FreshnessState, string> = {
  live: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  current: "bg-teal-400/10 text-teal-300 border-teal-400/25",
  overdue: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  stale: "bg-red-400/10 text-red-300 border-red-400/25",
  failing: "bg-red-400/10 text-red-300 border-red-400/25",
  never: "bg-surface-700/40 text-surface-300 border-white/10",
};

export function freshnessDotClass(freshness: FreshnessState): string {
  if (freshness === "live" || freshness === "current") return "bg-emerald-400";
  if (freshness === "overdue") return "bg-amber-400";
  return "bg-red-400";
}

export const CADENCE_LABEL: Record<SyncCadence, string> = {
  realtime: "Push (realtime)",
  five_minutes: "Every 5 minutes",
  fifteen_minutes: "Every 15 minutes",
  hourly: "Hourly",
  daily: "Daily",
  manual: "Manual / on demand",
};

// ── Events ──────────────────────────────────────────────────────────────────

export const IMPACT_LABEL: Record<ImpactClass, string> = {
  revenue: "Revenue",
  cost: "Cost",
  cash: "Cash",
  risk: "Risk",
  operational: "Operations",
};

export const IMPACT_CLASSES: Record<ImpactClass, string> = {
  revenue: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  cost: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  cash: "bg-teal-400/10 text-teal-300 border-teal-400/20",
  risk: "bg-red-400/10 text-red-300 border-red-400/20",
  operational: "bg-surface-700/40 text-surface-300 border-white/10",
};

// ── Time ────────────────────────────────────────────────────────────────────

/** An age in seconds as a person would say it. Null means "never". */
export function formatAge(seconds: number | null): string {
  if (seconds === null) return "never";
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * A timestamp as a clock time plus how long ago it was.
 *
 * Rendered from a date the caller supplies rather than from `Date.now()` inside
 * the formatter, so a list of rows and its header cannot disagree about what
 * "now" is.
 */
export function formatTimestamp(iso: string, now: Date = new Date()): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "unknown time";

  const clock = at.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const secondsAgo = Math.max(0, Math.round((now.getTime() - at.getTime()) / 1000));
  return `${clock} (${formatAge(secondsAgo)})`;
}

/** A date range in the identity window, for the header. */
export function formatWindow(startIso: string, endIso: string): string {
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = new Date(startIso).toLocaleDateString("en-US", options);
  const end = new Date(endIso).toLocaleDateString("en-US", {
    ...options,
    year: "numeric",
  });
  return `${start} – ${end}`;
}
