import { SEVERITY_CLASSES, SEVERITY_LABEL } from "@/lib/riskLedgerDisplay";
import type { RiskSignal } from "@/lib/types/riskLedger";

const CATEGORY_LABEL: Record<RiskSignal["category"], string> = {
  coverage_gap: "Coverage gap",
  renewal: "Renewal",
  claims: "Claims",
  exposure: "Exposure",
};

/**
 * What the ledger wants the operator to look at, worst first. Ordering is the
 * backend's; this component only renders it.
 */
export default function RiskSignalList({ signals }: { signals: RiskSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
        <p className="text-sm text-emerald-200">
          No coverage gaps, renewals inside the warning window, or limit shortfalls
          were found in the connected portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-300">
          What Needs Attention ({signals.length})
        </h2>
      </div>
      <ul className="divide-y divide-white/5">
        {signals.map((signal) => (
          <li key={signal.id} className="flex flex-wrap items-start gap-3 px-6 py-4">
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                SEVERITY_CLASSES[signal.severity]
              }`}
            >
              {SEVERITY_LABEL[signal.severity]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-white">{signal.title}</span>
                <span className="text-[11px] uppercase tracking-wider text-surface-500">
                  {CATEGORY_LABEL[signal.category]}
                </span>
              </div>
              <p className="mt-1 text-xs text-surface-400">{signal.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
