import type { ReadinessDimension } from "@/lib/types/exitReadiness";

import {
  STATE_CLASSES,
  STATE_LABEL,
  scoreBarClass,
} from "@/lib/exitReadinessDisplay";

/**
 * Every dimension a buyer tests in diligence, with what the business shows
 * today, what the buyer expects to see, and why they care.
 *
 * Unmeasured dimensions are shown rather than hidden: a gap nobody measured is
 * still a gap, and hiding it would make the score look better than the business.
 */
export default function ExitDimensionGrid({
  dimensions,
}: {
  dimensions: ReadinessDimension[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-5">
        Diligence Dimensions ({dimensions.length})
      </h3>

      <ul className="space-y-4">
        {dimensions.map((dimension) => (
          <li
            key={dimension.key}
            className="rounded-xl border border-white/10 bg-surface-950/40 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-semibold text-white">
                  {dimension.label}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    STATE_CLASSES[dimension.state]
                  }`}
                >
                  {STATE_LABEL[dimension.state]}
                </span>
              </div>
              <span className="font-mono text-sm text-surface-300">
                {dimension.score === null ? "not measured" : `${dimension.score}/100`}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
              <div
                className={`h-full rounded-full ${scoreBarClass(dimension.state)}`}
                style={{ width: `${dimension.score ?? 0}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-surface-300">{dimension.observed}</p>

            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <div className="font-semibold uppercase tracking-wider text-surface-500">
                  Buyer expects
                </div>
                <div className="mt-1 text-surface-400">{dimension.exitStandard}</div>
              </div>
              <div>
                <div className="font-semibold uppercase tracking-wider text-surface-500">
                  Why it matters
                </div>
                <div className="mt-1 text-surface-400">{dimension.whyItMatters}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
