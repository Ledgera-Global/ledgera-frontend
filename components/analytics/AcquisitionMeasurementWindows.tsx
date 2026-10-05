import { formatDate, formatUsd } from "@/lib/acquisitionIntelligenceDisplay";
import type { AcquisitionPeriodReading } from "@/lib/types/acquisitionIntelligence";

/**
 * Every window of post-close results on file for this acquisition.
 *
 * The point of showing all of them, rather than only the latest, is that the
 * verdict is drawn from the most recent window alone. A reader who cannot see
 * the earlier windows has no way to tell whether the deal is improving or
 * sliding, and no way to tell a one-off bad quarter from a trend.
 *
 * The latest window is marked, because "annualised from Q2 2026" is a different
 * claim from "annualised from the trailing twelve months" and the reader is
 * entitled to know which one they are looking at.
 *
 * Each row also carries where its figures came from. `recorded` means somebody
 * reported them for this deal; `derived` means they were reconstructed from the
 * company's own records because nobody did. Both are usable, but only one of
 * them was ever checked by a person against the target's books.
 */

interface AcquisitionMeasurementWindowsProps {
  periods: AcquisitionPeriodReading[];
}

export default function AcquisitionMeasurementWindows({
  periods,
}: AcquisitionMeasurementWindowsProps) {
  if (periods.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          Measurement Windows
        </h3>
        <p className="mt-3 text-sm text-surface-400">
          No post-close results have been recorded for this acquisition, so nothing
          can be measured against the underwriting yet.
        </p>
      </div>
    );
  }

  const latestIndex = periods.length - 1;
  const latest = periods[latestIndex];

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Measurement Windows
      </h3>

      <ul className="mt-4 space-y-4">
        {periods.map((period, index) => {
          const isLatest = index === latestIndex;

          return (
            <li
              key={`${period.periodStart}-${period.label}`}
              className={`border-b border-white/5 pb-4 last:border-0 last:pb-0 ${
                isLatest ? "" : "opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-surface-100">
                    {period.label}
                  </span>
                  {isLatest && (
                    <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                      Drives the verdict
                    </span>
                  )}
                </div>
                <SourceChip source={period.source} />
              </div>

              <div className="mt-1 text-xs text-surface-500">
                {formatDate(period.periodStart)} to {formatDate(period.periodEnd)}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                <Cell label="Revenue" value={period.actualRevenue} />
                <Cell label="EBITDA" value={period.actualEbitda} />
                <Cell label="Integration spend" value={period.actualIntegrationCost} />
                <Cell label="Synergies, annualised" value={period.actualSynergyAnnual} />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-white/5 pt-4 text-xs text-surface-500">
        Revenue and EBITDA from {latest.label} are annualised by the window's own
        length and compared against the annual figures written at close.
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-[11px] text-surface-500">{label}</div>
      <div className="font-mono text-xs text-surface-200">{formatUsd(value)}</div>
    </div>
  );
}

/**
 * Where a window's figures came from.
 *
 * Worded rather than colour-coded alone, because "derived" is not a warning —
 * it is a different, usually weaker, kind of evidence, and the difference
 * matters most on the window the verdict rests on.
 */
function SourceChip({ source }: { source: AcquisitionPeriodReading["source"] }) {
  if (source === "recorded") {
    return (
      <span
        title="Reported against this acquisition by a person."
        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface-300"
      >
        Recorded
      </span>
    );
  }

  return (
    <span
      title="Reconstructed from the company's own records; not reported against this acquisition."
      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300"
    >
      Derived
    </span>
  );
}
