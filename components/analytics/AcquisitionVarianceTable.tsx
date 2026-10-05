import type { Variance } from "@/lib/types/acquisitionIntelligence";

import {
  formatSignedPercent,
  formatSignedUsd,
  formatUsd,
  varianceClasses,
} from "@/lib/acquisitionIntelligenceDisplay";

/**
 * Underwritten against actual, line by line.
 *
 * Built as a real table so the three figures line up down the column and can be
 * compared by eye — which is the whole job. On narrow screens it becomes a
 * stack of cards rather than a horizontally scrolling table, because a financial
 * figure that requires sideways scrolling to reach is a figure nobody reads.
 *
 * Integration spend is the one line where "more than budget" is bad. The
 * direction is decided by the backend and carried on `favourable`, so this
 * component never has to know which metrics invert.
 */

interface AcquisitionVarianceTableProps {
  variances: Variance[];
}

export default function AcquisitionVarianceTable({ variances }: AcquisitionVarianceTableProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Underwriting Versus Actual
      </h3>

      <div className="mt-4 hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
              <th className="pb-2 font-medium">Metric</th>
              <th className="pb-2 text-right font-medium">Underwritten</th>
              <th className="pb-2 text-right font-medium">Actual</th>
              <th className="pb-2 text-right font-medium">Variance</th>
            </tr>
          </thead>
          <tbody>
            {variances.map((variance) => (
              <tr key={variance.metric} className="border-b border-white/5 last:border-0">
                <td className="py-3 text-surface-200">{variance.label}</td>
                <td className="py-3 text-right font-mono text-surface-300">
                  {formatUsd(variance.underwritten)}
                </td>
                <td className="py-3 text-right font-mono text-surface-100">
                  {formatUsd(variance.actual)}
                </td>
                <td
                  className={`py-3 text-right font-mono ${varianceClasses(variance.favourable)}`}
                >
                  <div>{formatSignedUsd(variance.varianceAbs)}</div>
                  <div className="text-xs opacity-80">
                    {formatSignedPercent(variance.variancePct)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {variances.map((variance) => (
          <div key={variance.metric} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="text-sm font-medium text-surface-200">{variance.label}</div>
            <div className="mt-2 flex items-baseline justify-between gap-4 text-xs">
              <span className="text-surface-500">Underwritten</span>
              <span className="font-mono text-surface-300">{formatUsd(variance.underwritten)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4 text-xs">
              <span className="text-surface-500">Actual</span>
              <span className="font-mono text-surface-100">{formatUsd(variance.actual)}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4 text-xs">
              <span className="text-surface-500">Variance</span>
              <span className={`font-mono ${varianceClasses(variance.favourable)}`}>
                {formatSignedUsd(variance.varianceAbs)} ({formatSignedPercent(variance.variancePct)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
