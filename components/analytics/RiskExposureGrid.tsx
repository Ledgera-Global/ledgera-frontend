import type { RiskExposure } from "@/lib/types/riskLedger";

import {
  EXPOSURE_STATE_CLASSES,
  EXPOSURE_STATE_LABEL,
  formatCents,
} from "@/lib/riskLedgerDisplay";

/**
 * The risk balance sheet: every line of exposure beside the limit that answers
 * it, and the verdict the backend reached on the pair.
 */
export default function RiskExposureGrid({ exposures }: { exposures: RiskExposure[] }) {
  if (exposures.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <p className="text-sm text-surface-300">
          No exposures could be computed from the connected portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-300">
          Risk Balance Sheet
        </h2>
        <p className="mt-1 text-xs text-surface-500">
          Exposure is what the operation puts at risk; the limit is what the portfolio answers it with.
        </p>
      </div>

      <div className="hidden grid-cols-12 gap-4 border-b border-white/5 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-surface-500 lg:grid">
        <div className="col-span-4">Line</div>
        <div className="col-span-3 text-right">Exposure</div>
        <div className="col-span-3 text-right">Coverage Limit</div>
        <div className="col-span-2 text-right">State</div>
      </div>

      <ul className="divide-y divide-white/5">
        {exposures.map((exposure) => (
          <li
            key={exposure.line}
            className="grid grid-cols-1 gap-2 px-6 py-4 lg:grid-cols-12 lg:items-center lg:gap-4"
          >
            <div className="lg:col-span-4">
              <div className="text-sm font-medium text-white">{exposure.label}</div>
              <div className="mt-1 text-xs text-surface-500">{exposure.note}</div>
            </div>
            <div className="flex justify-between text-sm lg:col-span-3 lg:justify-end">
              <span className="text-surface-500 lg:hidden">Exposure</span>
              <span className="font-mono text-surface-200">{formatCents(exposure.exposureCents)}</span>
            </div>
            <div className="flex justify-between text-sm lg:col-span-3 lg:justify-end">
              <span className="text-surface-500 lg:hidden">Coverage Limit</span>
              <span className="font-mono text-surface-200">
                {exposure.coverageLimitCents === 0 ? "None" : formatCents(exposure.coverageLimitCents)}
              </span>
            </div>
            <div className="flex justify-start lg:col-span-2 lg:justify-end">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  EXPOSURE_STATE_CLASSES[exposure.state]
                }`}
              >
                {EXPOSURE_STATE_LABEL[exposure.state]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
