import CaseStatusPill from "@/components/analytics/CaseStatusPill";
import type { AssuranceCase } from "@/lib/types/assuranceCases";

import {
  formatUsd,
  reopenedAfterClosure,
  severityClasses,
  severityLabel,
} from "@/lib/assuranceCaseDisplay";

/**
 * The working list, ordered the way an operator should read it.
 *
 * Ordering is explicit rather than "whatever the API returned": cases that came
 * back after being closed first, because those mean a fix did not hold; then
 * open cases by amount, because that is where the most money is unaccounted
 * for; then everything else, longest-waiting first.
 *
 * A closed case stays in the list with its status named. Hiding it would make
 * "we dealt with it" unfalsifiable.
 */

interface AssuranceCaseListProps {
  cases: readonly AssuranceCase[];
  selectedId: string | null;
  nowIso: string;
  onSelect: (caseId: string) => void;
}

export default function AssuranceCaseList({
  cases,
  selectedId,
  nowIso,
  onSelect,
}: AssuranceCaseListProps) {
  const ordered = orderCases(cases);

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <p className="text-sm text-surface-300">
          No cases have been recorded. Run the check to look for control failures
          in the ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          Cases
        </h2>
        <p className="mt-1 text-xs text-surface-500">
          {ordered.length} on record
        </p>
      </div>
      <ul className="divide-y divide-white/5">
        {ordered.map((row) => {
          const isSelected = row.id === selectedId;
          const reopened = reopenedAfterClosure(
            row.status,
            row.lastSeenAt,
            row.resolvedAt
          );
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`w-full px-5 py-4 text-left transition-colors ${
                  isSelected
                    ? "bg-brand-500/10"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityClasses(
                      row.severity
                    )}`}
                  >
                    {severityLabel(row.severity)}
                  </span>
                  <span className="font-mono text-sm font-semibold text-white">
                    {formatUsd(row.amountCents)}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium leading-snug text-surface-100">
                  {row.title}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CaseStatusPill status={row.status} />
                  <span className="text-xs text-surface-500">
                    {row.ageLabel}
                  </span>
                  {row.detectionCount > 1 && (
                    <span className="text-xs text-surface-500">
                      seen {row.detectionCount} times
                    </span>
                  )}
                </div>

                {reopened && (
                  <p className="mt-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-xs text-rose-200">
                    Detected again after it was closed — the fix did not hold.
                  </p>
                )}

                {row.dueAt !== null && !isClosed(row) && (
                  <p className="mt-2 text-xs text-surface-400">
                    {describeDueShort(row.dueAt, nowIso)}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function isClosed(row: AssuranceCase): boolean {
  return (
    row.status === "recovered" ||
    row.status === "written_off" ||
    row.status === "dismissed"
  );
}

function describeDueShort(dueAt: string, nowIso: string): string {
  const days = Math.floor(
    (Date.parse(dueAt) - Date.parse(nowIso)) / 86_400_000
  );
  if (Number.isNaN(days)) return "";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

/** Reopened, then open by amount, then the rest longest-open first. */
function orderCases(cases: readonly AssuranceCase[]): AssuranceCase[] {
  return [...cases].sort((a, b) => {
    const aReopened = reopenedAfterClosure(a.status, a.lastSeenAt, a.resolvedAt);
    const bReopened = reopenedAfterClosure(b.status, b.lastSeenAt, b.resolvedAt);
    if (aReopened !== bReopened) return aReopened ? -1 : 1;

    const aOpen = !isClosed(a);
    const bOpen = !isClosed(b);
    if (aOpen !== bOpen) return aOpen ? -1 : 1;

    if (aOpen) return b.amountCents - a.amountCents;
    return b.daysOpen - a.daysOpen;
  });
}
