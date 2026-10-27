import type { GrossProfitBridge, WindowMetrics } from "@/lib/types/interventions";

import {
  formatSignedPct,
  formatSignedUsd,
  formatUsd,
  formatWindowDates,
  signedClass,
} from "@/lib/interventionDisplay";

/**
 * The bridge: where the gross profit change came from, line by line.
 *
 * Job count, ticket and margin are each priced at the other two held constant,
 * and the cross-term is shown rather than folded into the largest line. Hiding
 * it would let the four rows look like they add up when they do not, and the
 * reconciliation flag exists precisely so a reader can check.
 */
export default function GrossProfitBridgeTable({
  bridge,
  baseline,
  treatment,
}: {
  bridge: GrossProfitBridge;
  baseline: WindowMetrics;
  treatment: WindowMetrics;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-5">
        Gross Profit Bridge
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <WindowCell label="Baseline" window={baseline} muted />
        <WindowCell label="Treated" window={treatment} />
        <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
            Change
          </div>
          <div className={`mt-2 font-mono text-xl font-bold ${signedClass(bridge.changeCents)}`}>
            {formatSignedUsd(bridge.changeCents)}
          </div>
          <div className="mt-1 text-xs text-surface-500">
            {formatSignedPct(bridge.changePct)} against the baseline
          </div>
        </div>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-surface-500">
            <th className="pb-2 font-semibold">Driver</th>
            <th className="pb-2 text-right font-semibold">Gross profit</th>
            <th className="pb-2 pl-4 font-semibold">What it means</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bridge.components.map((component) => (
            <tr key={component.key}>
              <td className="py-3 pr-4 font-medium text-white">{component.label}</td>
              <td
                className={`py-3 pr-4 text-right font-mono font-semibold ${signedClass(
                  component.amountCents
                )}`}
              >
                {formatSignedUsd(component.amountCents)}
              </td>
              <td className="py-3 pl-4 text-surface-300">{component.interpretation}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/10">
            <td className="pt-3 font-semibold text-white">Sum of drivers</td>
            <td
              className={`pt-3 text-right font-mono font-bold ${signedClass(bridge.changeCents)}`}
            >
              {formatSignedUsd(bridge.changeCents)}
            </td>
            <td className="pt-3 pl-4">
              {bridge.reconciles ? (
                <span className="text-xs text-emerald-400">
                  Adds back to the measured change exactly
                </span>
              ) : (
                <span className="text-xs text-rose-400">
                  Does not add back to the measured change ({formatUsd(
                    bridge.postGrossProfitCents - bridge.preGrossProfitCents
                  )}
                  ). Treat every row above as unreliable.
                </span>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** One measurement window, stated with its own dates and job count. */
function WindowCell({
  label,
  window,
  muted = false,
}: {
  label: string;
  window: WindowMetrics;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        muted ? "border-white/10 bg-surface-950/40" : "border-brand-400/20 bg-brand-500/[0.06]"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-xl font-bold text-white">
        {formatUsd(window.grossProfitCents)}
      </div>
      <div className="mt-1 text-xs text-surface-500">
        {window.completedJobs} jobs over {window.days} days
      </div>
      <div className="mt-1 text-xs text-surface-500">
        {formatWindowDates(window.startIso, window.endIso)}
      </div>
    </div>
  );
}
