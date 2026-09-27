import type { ReadinessGrade, ReadinessState } from "@/lib/types/exitReadiness";

/**
 * Shared presentation for the exit readiness page.
 *
 * Kept in one place so the grade badge, the dimension chips, and the action
 * rows cannot drift apart in their wording or colour.
 */

export function formatUsd(value: number | null): string {
  if (value === null) return "Not priced";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

/** How each dimension state reads, as a chip label. */
export const STATE_LABEL: Record<ReadinessState, string> = {
  ready: "Ready",
  watch: "Watch",
  gap: "Gap",
  not_measured: "Not measured",
};

export const STATE_CLASSES: Record<ReadinessState, string> = {
  ready: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  watch: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  gap: "bg-red-400/10 text-red-300 border-red-400/20",
  not_measured: "bg-surface-700/40 text-surface-300 border-white/10",
};

/** How each overall grade reads, as a badge label. */
export const GRADE_LABEL: Record<ReadinessGrade, string> = {
  exit_ready: "Exit Ready",
  nearly_ready: "Nearly Ready",
  needs_work: "Needs Work",
  not_ready: "Not Ready",
  insufficient_data: "Insufficient Data",
};

export const GRADE_CLASSES: Record<ReadinessGrade, string> = {
  exit_ready: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  nearly_ready: "bg-teal-400/10 text-teal-300 border-teal-400/20",
  needs_work: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  not_ready: "bg-red-400/10 text-red-300 border-red-400/20",
  insufficient_data: "bg-surface-700/40 text-surface-300 border-white/10",
};

/** Bar fill colour for a dimension score, used in the dimension grid. */
export function scoreBarClass(state: ReadinessState): string {
  if (state === "ready") return "bg-emerald-400";
  if (state === "watch") return "bg-amber-400";
  if (state === "gap") return "bg-red-400";
  return "bg-surface-600";
}
