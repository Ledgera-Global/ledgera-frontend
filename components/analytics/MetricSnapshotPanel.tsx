import type { ReactNode } from "react";
import type { QuoteState } from "@/lib/metricStandard/useMetricStandard";
import type { MetricSnapshot, SnapshotVerification } from "@/lib/types/metricStandard";

import {
  describeVerification,
  formatMetricValue,
  formatPeriod,
  formatTimestamp,
  shortDigest,
} from "@/lib/metricStandardDisplay";

/**
 * The quoted figure, or the reason there is not one.
 *
 * Four outcomes are kept apart on purpose. Loading, "no figure on record" and
 * "the read failed" all look like an empty space if you let them, and a reader
 * cannot tell a metric nobody has produced from a metric the platform could not
 * fetch for them. Each gets its own words here.
 */

interface MetricSnapshotPanelProps {
  quoteState: QuoteState;
  snapshot: MetricSnapshot | null;
  verification: SnapshotVerification | null;
  detail: string | null;
  loading: boolean;
}

export default function MetricSnapshotPanel({
  quoteState,
  snapshot,
  verification,
  detail,
  loading,
}: MetricSnapshotPanelProps) {
  return (
    <section
      aria-labelledby="metric-quote-heading"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
    >
      <h2
        id="metric-quote-heading"
        className="text-xs font-semibold uppercase tracking-wider text-white/40"
      >
        Quoted figure for this company
      </h2>

      {loading ? (
        <p className="mt-4 text-sm text-white/50">Reading the quote of record.</p>
      ) : quoteState === "unreadable" ? (
        <UnreadableNotice />
      ) : quoteState === "none" ? (
        <NoQuoteNotice detail={detail} />
      ) : snapshot !== null ? (
        <QuotedFigure snapshot={snapshot} verification={verification} />
      ) : (
        <UnreadableNotice />
      )}
    </section>
  );
}

function QuotedFigure({
  snapshot,
  verification,
}: {
  snapshot: MetricSnapshot;
  verification: SnapshotVerification | null;
}) {
  return (
    <div className="mt-4">
      <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {formatMetricValue(snapshot.value, snapshot.unit)}
      </p>
      <p className="mt-1 text-sm text-white/55">{formatPeriod(snapshot)}</p>

      {snapshot.value === null && snapshot.refusalReason !== null && (
        <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm leading-relaxed text-amber-100">
          The platform declined to publish a figure: {snapshot.refusalReason}. The
          refusal is recorded and sealed; it is not a missing number.
        </p>
      )}

      {verification !== null && (
        <div className="mt-6">
          <p className="text-sm leading-relaxed text-white/70">
            {describeVerification(verification)}
          </p>
          <ul className="mt-3 space-y-1.5">
            {verification.checks.map((check) => (
              <li key={check.name} className="flex items-start gap-2.5 text-xs">
                <span
                  aria-hidden="true"
                  className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    check.passed ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <span className="text-white/60">
                  <span className="font-mono text-white/80">{check.name}</span>
                  {" — "}
                  {check.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
        <Field label="Citation" mono>
          {snapshot.citation}
        </Field>
        <Field label="Sealed" mono>
          {formatTimestamp(snapshot.producedAt)}
        </Field>
        <Field label="Snapshot id" mono>
          {snapshot.snapshotId}
        </Field>
        <Field label="Body digest" mono>
          {shortDigest(snapshot.digest)}
        </Field>
        <Field label="Inputs digest" mono>
          {shortDigest(snapshot.inputsDigest)}
        </Field>
        <Field label="Definition digest" mono>
          {shortDigest(snapshot.definitionDigest)}
        </Field>
      </dl>
    </div>
  );
}

function NoQuoteNotice({ detail }: { detail: string | null }) {
  const reason = detail !== null && detail.trim() !== "" ? detail : null;

  return (
    <div className="mt-4 space-y-3">
      {reason !== null && (
        <p className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/70">
          {reason}
        </p>
      )}
      <p className="text-sm leading-relaxed text-white/75">
        Nothing has been quoted as this metric for this company yet. The definition
        on the right is published; the figure is not.
      </p>
    </div>
  );
}

function UnreadableNotice() {
  return (
    <div className="mt-4">
      <p
        role="alert"
        className="rounded-xl border border-rose-400/25 bg-rose-400/[0.06] p-4 text-sm leading-relaxed text-rose-100"
      >
        The quote could not be read. This screen cannot tell whether a figure
        exists, so it will not imply either answer. Reload once the backend is
        reachable.
      </p>
    </div>
  );
}

function Field({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </dt>
      <dd
        className={`mt-1 break-all text-xs text-white/70 ${
          mono ? "select-all font-mono" : ""
        }`}
      >
        {children}
      </dd>
    </div>
  );
}
