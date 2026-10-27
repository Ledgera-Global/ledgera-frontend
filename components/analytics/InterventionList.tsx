import { formatDate, formatUsd, openWindowNote } from "@/lib/interventionDisplay";
import type { InterventionSummary } from "@/lib/types/interventions";

/**
 * The interventions under measurement, and which one the page is showing.
 *
 * The open/closed state of the treatment window is stated on every row, because
 * an open window means the figure below it will move. A closed one is a claim
 * that can be quoted.
 */
export default function InterventionList({
  interventions,
  selectedId,
  onSelect,
}: {
  interventions: InterventionSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (interventions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <p className="text-sm text-surface-400">
          No vendor interventions have been recorded for this company yet. Activation
          dates drive the measurement window, so there is nothing to attribute until one
          is logged.
        </p>
      </div>
    );
  }

  const selected = interventions.find((intervention) => intervention.id === selectedId);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
        Interventions
      </h3>

      <ul className="space-y-2">
        {interventions.map((intervention) => {
          const isSelected = intervention.id === selectedId;
          return (
            <li key={intervention.id}>
              <button
                type="button"
                onClick={() => onSelect(intervention.id)}
                aria-pressed={isSelected}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-brand-400/40 bg-brand-500/[0.08]"
                    : "border-white/10 bg-surface-950/40 hover:border-white/25"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{intervention.label}</span>
                  <span className="font-mono text-xs text-surface-400">
                    {formatUsd(intervention.monthlyVendorCostCents)}/mo
                  </span>
                </div>
                <div className="mt-1 text-xs text-surface-400">{intervention.providerName}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-surface-500">
                  <span>Activated {formatDate(intervention.activatedAt)}</span>
                  <span aria-hidden="true">/</span>
                  <span>
                    {intervention.treatmentEnd === null
                      ? "Window open"
                      : `Closed ${formatDate(intervention.treatmentEnd)}`}
                  </span>
                  {intervention.hasControl && (
                    <>
                      <span aria-hidden="true">/</span>
                      <span className="text-emerald-400">Control branch</span>
                    </>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-surface-500">
        {openWindowNote(selected ? selected.treatmentEnd : null)}
      </p>
    </div>
  );
}
