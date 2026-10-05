import type { ValueCreation } from "@/lib/types/acquisitionIntelligence";

import {
  formatMultiple,
  formatSignedUsd,
  formatUsd,
} from "@/lib/acquisitionIntelligenceDisplay";

/**
 * What the deal has done to enterprise value so far.
 *
 * The number this panel is built around is net value created, and the way it is
 * reached matters. A deal is valued at the multiple it was bought on applied to
 * what it now earns — not at what similar businesses fetch today, which is a
 * different claim about a different market. What was spent on integration is
 * then added back or deducted, because unspent purchase-price budget is value
 * the buyer kept, and an overrun is value already gone.
 *
 * Because the gross and net figures move in opposite directions when
 * integration comes in under budget, both are shown. A single number would
 * invite the reader to guess which one it was.
 */

interface AcquisitionValueCreationProps {
  valueCreation: ValueCreation;
}

export default function AcquisitionValueCreation({
  valueCreation,
}: AcquisitionValueCreationProps) {
  const {
    entryMultiple,
    purchasePrice,
    underwrittenEbitda,
    actualEbitda,
    currentValueAtEntryMultiple,
    evCreated,
    integrationOverrun,
    netValueCreated,
    valueMultiple,
  } = valueCreation;

  const netPositive = netValueCreated !== null && netValueCreated > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Value Created Since Close
      </h3>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`font-mono text-3xl font-bold ${
            netValueCreated === null
              ? "text-surface-500"
              : netPositive
                ? "text-emerald-400"
                : "text-red-400"
          }`}
        >
          {formatSignedUsd(netValueCreated)}
        </span>
        <span className="text-sm text-surface-400">
          {netValueCreated === null
            ? "— one of the figures this rests on could not be measured"
            : "net of integration spend"}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-white/5 pt-5 sm:grid-cols-2">
        <Figure label="Purchase price" value={formatUsd(purchasePrice)} />
        <Figure label="Entry multiple" value={formatMultiple(entryMultiple)} />
        <Figure label="EBITDA underwritten" value={formatUsd(underwrittenEbitda)} />
        <Figure label="EBITDA now, annualised" value={formatUsd(actualEbitda)} />
        <Figure
          label="Value at entry multiple"
          value={formatUsd(currentValueAtEntryMultiple)}
        />
        <Figure
          label="Enterprise value created"
          value={formatSignedUsd(evCreated)}
          tone={toneFor(evCreated)}
        />
        <Figure
          label="Integration versus budget"
          value={describeIntegration(integrationOverrun)}
          tone={toneForInverted(integrationOverrun)}
        />
        <Figure
          label="Value multiple on cost"
          value={formatMultiple(valueMultiple)}
        />
      </dl>
    </div>
  );
}

/** One labelled figure. Tone is passed rather than derived so colour never lies. */
function Figure({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-surface-500">{label}</dt>
      <dd className={`font-mono text-sm ${tone ?? "text-surface-200"}`}>{value}</dd>
    </div>
  );
}

function toneFor(value: number | null): string {
  if (value === null) return "text-surface-500";
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-surface-400";
}

/**
 * Integration is the one figure where a negative number is good news.
 *
 * Spelled out in words rather than shown as a negative currency value, because
 * "-$60,000" next to "integration cost" reads as a shortfall to anyone not
 * holding the sign convention in their head.
 */
function describeIntegration(overrun: number | null): string {
  if (overrun === null) return "Not measured";
  if (overrun === 0) return "On budget";
  if (overrun < 0) return `Under budget by ${formatUsd(Math.abs(overrun))}`;
  return `Over budget by ${formatUsd(overrun)}`;
}

function toneForInverted(overrun: number | null): string {
  if (overrun === null) return "text-surface-500";
  if (overrun < 0) return "text-emerald-400";
  if (overrun > 0) return "text-red-400";
  return "text-surface-400";
}
