import type { IdentityDimension } from "@/lib/types/live";

import {
  DIMENSION_CLASSES,
  DIMENSION_LABEL,
  dimensionBarClass,
  dimensionBarWidth,
  formatChange,
  formatDimensionValue,
  hasScaledBar,
} from "@/lib/liveDisplay";

/**
 * The Institutional Economic Identity, dimension by dimension.
 *
 * Unmeasured dimensions are listed rather than skipped. A dimension that could
 * not be measured is a fact about the business's visibility, and hiding it
 * would make the headline score look like it was built from more evidence than
 * it was.
 *
 * For the same reason an unmeasured dimension draws no bar at all: a bar is a
 * claim about magnitude, and there is no magnitude to claim.
 */
export default function IdentityDimensionList({
  dimensions,
}: {
  dimensions: IdentityDimension[];
}) {
  const unmeasured = dimensions.filter((d) => d.status === "unknown").length;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          The Identity ({dimensions.length} dimensions)
        </h3>
        {unmeasured > 0 && (
          <span className="text-xs text-surface-400">
            {unmeasured} could not be measured from the connected sources
          </span>
        )}
      </div>

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
                    DIMENSION_CLASSES[dimension.status]
                  }`}
                >
                  {DIMENSION_LABEL[dimension.status]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-surface-200">
                  {formatDimensionValue(dimension.value, dimension.unit)}
                </span>
                {dimension.status !== "unknown" && (
                  <span className="text-xs text-surface-500">
                    {formatChange(dimension.changePct)}
                  </span>
                )}
              </div>
            </div>

            {hasScaledBar(dimension.unit) && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
                <div
                  className={`h-full rounded-full ${dimensionBarClass(
                    dimension.status
                  )}`}
                  style={{ width: `${dimensionBarWidth(dimension.value, dimension.unit)}%` }}
                />
              </div>
            )}

            <p className="mt-4 text-sm text-surface-300">{dimension.statement}</p>

            {dimension.unavailableReason && (
              <p className="mt-2 rounded-lg border border-white/10 bg-surface-900/60 px-3 py-2 text-xs text-surface-400">
                <span className="font-semibold uppercase tracking-wider text-surface-500">
                  Why not measured:{" "}
                </span>
                {dimension.unavailableReason}
              </p>
            )}

            {dimension.sources.length > 0 && (
              <p className="mt-3 text-[11px] uppercase tracking-wider text-surface-500">
                Sources: {dimension.sources.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
