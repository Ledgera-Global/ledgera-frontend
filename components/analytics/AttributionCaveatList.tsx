import { GRADE_EXPLANATION, GRADE_LABEL } from "@/lib/interventionDisplay";
import type { AttributionCaveat, AttributionGrade } from "@/lib/types/interventions";

/**
 * The part of the page that stops the bridge being quoted out of context.
 *
 * Every caveat the engine raised is rendered verbatim, in the engine's order.
 * The grade explanation is stated once here rather than inside the badge, so
 * the badge can stay a badge and the page can carry the argument.
 */
export default function AttributionCaveatList({
  grade,
  caveats,
  hasControl,
}: {
  grade: AttributionGrade;
  caveats: AttributionCaveat[];
  hasControl: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        What this measurement does not establish
      </h3>

      <div className="mt-4 rounded-xl border border-white/10 bg-surface-950/40 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
          Grade: {GRADE_LABEL[grade]}
        </div>
        <p className="mt-2 text-sm text-surface-300">{GRADE_EXPLANATION[grade]}</p>
      </div>

      <ul className="mt-4 space-y-3">
        {caveats.map((caveat) => (
          <li key={caveat.code} className="flex gap-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm leading-relaxed text-surface-300">{caveat.message}</span>
          </li>
        ))}
      </ul>

      {!hasControl && (
        <p className="mt-4 text-sm text-surface-400">
          No untreated comparison branch was available for this window. Without one,
          the change cannot be separated from what the rest of the business was doing
          at the same time.
        </p>
      )}
    </div>
  );
}
