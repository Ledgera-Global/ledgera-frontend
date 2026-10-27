import { formatSignedUsd, signedClass } from "@/lib/interventionDisplay";
import type { EbitdaBridge } from "@/lib/types/interventions";

/**
 * What the gross profit change is worth after the vendor is paid.
 *
 * The dispatcher saving is kept separate from the vendor fee rather than netted
 * into one tidy number, because the two have different evidence behind them:
 * the fee is an invoice, the saving is an owner's estimate. Collapsing them
 * would let a declared input inherit the credibility of a paid one.
 */
export default function EbitdaBridgePanel({ ebitda }: { ebitda: EbitdaBridge }) {
  const rows = [
    {
      label: "Gross profit change",
      amount: ebitda.grossProfitChangeCents,
      note: "Measured across the two windows above",
    },
    {
      label: "Dispatcher cost saved",
      amount: ebitda.dispatcherCostChangeCents,
      note: "Owner-declared, not measured from a payroll system",
    },
    {
      label: "Vendor fee",
      amount: ebitda.vendorCostCents,
      note: "What was actually paid over the same window",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-5">
        Net EBITDA Effect
      </h3>

      <ul className="divide-y divide-white/5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start justify-between gap-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">{row.label}</div>
              <div className="mt-0.5 text-xs text-surface-500">{row.note}</div>
            </div>
            <span className={`shrink-0 font-mono text-sm font-semibold ${signedClass(row.amount)}`}>
              {formatSignedUsd(row.amount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
            Over the window
          </div>
          <div
            className={`mt-2 font-mono text-xl font-bold ${signedClass(
              ebitda.netEbitdaEffectCents
            )}`}
          >
            {formatSignedUsd(ebitda.netEbitdaEffectCents)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
            Annualised
          </div>
          <div
            className={`mt-2 font-mono text-xl font-bold ${signedClass(
              ebitda.annualisedNetEffectCents
            )}`}
          >
            {formatSignedUsd(ebitda.annualisedNetEffectCents)}
          </div>
          <div className="mt-1 text-xs text-surface-500">
            Straight-line from this window, not a forecast
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-surface-950/40 p-4 text-sm text-surface-300">
        {ebitda.verdict}
      </p>

      <p className="mt-3 text-xs text-surface-500">
        Annualising assumes the next twelve months look like this window. Nothing
        on this page establishes that, which is why the annual figure is shown
        beside the window figure and never instead of it.
      </p>
    </div>
  );
}
