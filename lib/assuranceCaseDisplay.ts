import {
  CLOSED_CASE_STATUSES,
  type AssuranceCaseStatus,
} from "@/lib/types/assuranceCases";

/**
 * Presentation for assurance cases.
 *
 * Formatting and vocabulary live here so no component invents its own. The
 * status wording is the load-bearing part: "closed" on its own reads as
 * "handled" in a board pack, so every closed state names which of the three
 * things actually happened.
 */

export const STATUS_LABEL: Record<AssuranceCaseStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  in_progress: "In progress",
  recovered: "Recovered",
  written_off: "Written off",
  dismissed: "Dismissed",
};

export const STATUS_CLASSES: Record<AssuranceCaseStatus, string> = {
  open: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  acknowledged: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  in_progress: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  recovered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  written_off: "border-white/20 bg-white/[0.04] text-surface-300",
  dismissed: "border-white/20 bg-white/[0.04] text-surface-400",
};

export const STATUS_EXPLANATION: Record<AssuranceCaseStatus, string> = {
  open: "Detected, and nobody has picked it up yet.",
  acknowledged: "Someone has seen it and owns it, but no work has started.",
  in_progress: "Work is underway to collect or correct it.",
  recovered:
    "Money came back. The recovered amount and the note record how much and how.",
  written_off:
    "The owner decided it will not be collected. The amount stays on the record as a known loss.",
  dismissed:
    "The owner decided the finding was wrong. The note records why the detector was mistaken.",
};

/** The statuses an operator can move a case to, in the order the form offers them. */
export const CLOSABLE_STATUSES: readonly AssuranceCaseStatus[] = CLOSED_CASE_STATUSES;

export function isClosedStatus(status: AssuranceCaseStatus): boolean {
  return CLOSED_CASE_STATUSES.includes(status);
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const SEVERITY_CLASSES: Record<string, string> = {
  critical: "border-rose-400/50 bg-rose-500/15 text-rose-200",
  high: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  medium: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  low: "border-white/20 bg-white/[0.04] text-surface-300",
};

export function severityLabel(severity: string): string {
  return SEVERITY_LABEL[severity] ?? capitalise(severity);
}

export function severityClasses(severity: string): string {
  return SEVERITY_CLASSES[severity] ?? SEVERITY_CLASSES.low;
}

/** Whole-dollar currency from integer cents. */
export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Days until a due date, or null when there is no due date. */
export function dueInDays(dueAt: string | null, nowIso: string): number | null {
  if (dueAt === null) return null;
  const dueMs = Date.parse(dueAt);
  const nowMs = Date.parse(nowIso);
  if (Number.isNaN(dueMs) || Number.isNaN(nowMs)) return null;
  return Math.floor((dueMs - nowMs) / 86_400_000);
}

/** Plain-language due date, including the overdue case. */
export function describeDue(dueAt: string | null, nowIso: string): string {
  const days = dueInDays(dueAt, nowIso);
  if (days === null || dueAt === null) return "No due date";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${formatDate(dueAt)}`;
}

/**
 * Detected again after closing — the highest-signal row on the screen.
 *
 * It means someone closed the case and the condition came back, so the fix did
 * not hold. It is derived from the two timestamps rather than stored, so it
 * cannot be cleared by editing a status.
 */
export function reopenedAfterClosure(
  status: AssuranceCaseStatus,
  lastSeenAt: string,
  resolvedAt: string | null
): boolean {
  if (!isClosedStatus(status) || resolvedAt === null) return false;
  return Date.parse(lastSeenAt) > Date.parse(resolvedAt);
}

/**
 * What the close-out form must collect before it can be submitted.
 *
 * These are hints, not the authority: the backend re-checks every closure
 * against its own policy and returns the sentence to show when it refuses.
 * Duplicating the rules here only avoids a pointless round trip.
 */
export function closeOutHint(status: AssuranceCaseStatus): string {
  if (status === "recovered") {
    return "Record how much actually came back and what happened. If a paid change is being credited, the intervention must carry a supported attribution.";
  }
  if (status === "written_off") {
    return "Record why it will not be collected. The amount stays on the record as a known loss, so the note is what a reader will rely on.";
  }
  if (status === "dismissed") {
    return "Record why the finding was wrong. A dismissal is a claim about the detector, so it needs a reason.";
  }
  return "";
}

function capitalise(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).replace(/_/g, " ");
}
