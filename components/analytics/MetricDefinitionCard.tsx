import type { MetricSnapshot, PolicyEntry } from "@/lib/types/metricStandard";

import {
  earningsBasisText,
  refusalRuleText,
  requiredInputStatus,
} from "@/lib/metricStandardDisplay";

/**
 * One published metric, shown as its definition rather than as a number.
 *
 * This is the part of the screen that answers "how would I check this figure
 * myself". The question it settles, the formula, the inputs it needs and the
 * case where the platform is forbidden to answer are all here, in the standard's
 * own words, so a reader never has to accept a number on production's authority.
 */

interface MetricDefinitionCardProps {
  entry: PolicyEntry;
  /** Whose quote the presence marks come from; null when nothing is on record. */
  snapshot: MetricSnapshot | null;
}

export default function MetricDefinitionCard({
  entry,
  snapshot,
}: MetricDefinitionCardProps) {
  const { definition, citation } = entry;
  const inputs = requiredInputStatus(definition, snapshot);
  const recorded = inputs.filter((input) => input.present).length;
  const basis = earningsBasisText(definition.earningsBasis);

  return (
    <section
      aria-labelledby="metric-definition-heading"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="metric-definition-heading" className="text-lg font-semibold text-white">
          {definition.label}
        </h2>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-xs text-white/60">
          {definition.version}
        </span>
        <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-xs text-white/60">
          {definition.unit}
        </span>
      </div>

      <dl className="mt-6 space-y-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">
            The question it answers
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-white/80">
            {definition.question}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">
            How it is computed
          </dt>
          <dd className="mt-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4">
            <code className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-emerald-100/90">
              {definition.formula}
            </code>
          </dd>
        </div>

        <div>
          <dt className="flex items-baseline justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            <span>Inputs it requires</span>
            <span className="font-mono text-[11px] normal-case tracking-normal text-white/35">
              {snapshot === null
                ? "no quote to check against"
                : `${recorded} of ${inputs.length} recorded`}
            </span>
          </dt>
          <dd className="mt-2">
            <ul className="space-y-1.5">
              {inputs.map((input) => (
                <li key={input.name} className="flex items-center gap-2.5 text-sm">
                  <InputMark present={input.present} hasSnapshot={snapshot !== null} />
                  <span className="font-mono text-xs text-white/75">{input.name}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">
            When it refuses to answer
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-white/70">
            {refusalRuleText(definition)}
          </dd>
        </div>

        {basis !== null && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Earnings basis
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-white/70">
              {basis}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Citation
          </dt>
          <dd className="mt-2">
            <code className="select-all font-mono text-xs text-sky-200/90">
              {citation}
            </code>
          </dd>
        </div>
      </dl>
    </section>
  );
}

/**
 * Three states, not two. "No quote yet" is not the same as "required but
 * missing from a quote that exists", and showing them alike would hide a real
 * defect in a sealed record.
 */
function InputMark({
  present,
  hasSnapshot,
}: {
  present: boolean;
  hasSnapshot: boolean;
}) {
  if (!hasSnapshot) {
    return (
      <span
        aria-label="Not yet quoted"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/25"
      />
    );
  }

  return present ? (
    <svg
      aria-label="Recorded in the quote"
      className="h-3.5 w-3.5 shrink-0 text-emerald-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg
      aria-label="Required but absent from the quote"
      className="h-3.5 w-3.5 shrink-0 text-rose-400"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}
