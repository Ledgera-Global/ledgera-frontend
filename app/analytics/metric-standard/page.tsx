"use client";
import AppHeader from "@/components/layouts/AppHeader";
import DataSourceNotice from "@/components/analytics/DataSourceNotice";
import Link from "next/link";
import MetricDefinitionCard from "@/components/analytics/MetricDefinitionCard";
import MetricSnapshotPanel from "@/components/analytics/MetricSnapshotPanel";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { useMetricStandard } from "@/lib/metricStandard/useMetricStandard";

/**
 * Metric Standard: the definitions the platform publishes, and the figure it
 * has quoted under them for this company.
 *
 * Most analytics screens show a number and ask to be believed. This one shows
 * the promise behind the number first - the question it answers, the formula,
 * the inputs it requires, the rule under which it refuses, and the citation -
 * and only then the figure sealed under it. The order is the argument: if the
 * definition is sound, the figure can be checked by anyone holding the same
 * inputs, without taking production's word for it.
 *
 * The failure this page is built to avoid is the quiet one. An absent figure can
 * mean "not yet quoted", "quoted and refused", or "the backend could not be
 * reached", and merging those into one empty state lets a reader take a missing
 * answer for a zero, or an outage for a fact about their business. Each state
 * gets its own words.
 */
export default function MetricStandardPage() {
  const {
    policy,
    selectedId,
    selected,
    snapshot,
    verification,
    quoteState,
    quoteDetail,
    storage,
    source,
    loading,
    loadingQuote,
    select,
  } = useMetricStandard();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/metric-standard" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="mb-3 text-3xl font-semibold text-white">
              Metric Standard
            </h1>
            <p className="max-w-3xl text-base text-surface-300">
              Every figure Ledgera quotes rests on a published definition, is
              sealed with a digest, and is citable by version. This page shows
              the definitions, the cases in which each one refuses to answer,
              and the figure on record.
            </p>
          </div>

          <DataSourceNotice
            source={source}
            subject="metric standard"
            demoTitle="Showing the published standard, not a quoted figure"
            demoBody="No live metric standard was returned for this company, so the definitions and citations below come from the bundled LMS-2026.1 policy. The definitions are real; what is absent is a sealed figure, which belongs to one company and is only read once you are signed in."
          />

          {loading ? (
            <LoadingSkeleton count={2} />
          ) : policy.policy.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-sm leading-relaxed text-white/70">
                The metric standard could not be loaded, so there are no
                definitions to show. This is a failure to read, not a finding
                that no metrics exist.
              </p>
            </div>
          ) : (
            <>
              <nav aria-label="Published metrics" className="mb-8">
                <ul className="flex flex-wrap gap-2">
                  {policy.policy.map((entry) => {
                    const isSelected = entry.definition.id === selectedId;
                    return (
                      <li key={entry.definition.id}>
                        <button
                          type="button"
                          onClick={() => select(entry.definition.id)}
                          aria-pressed={isSelected}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            isSelected
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-white/[0.02] text-white/65 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {entry.definition.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {selected !== null && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <MetricSnapshotPanel
                    quoteState={quoteState}
                    snapshot={snapshot}
                    verification={verification}
                    detail={quoteDetail}
                    loading={loadingQuote}
                  />
                  <MetricDefinitionCard entry={selected} snapshot={snapshot} />
                </div>
              )}

              {storage !== "" && (
                <p className="mt-6 text-xs leading-relaxed text-white/40">
                  Revisions of these definitions are recorded in{" "}
                  <code className="select-all font-mono text-white/60">
                    {storage}
                  </code>
                  . A figure is only reproducible against the version it cites.
                </p>
              )}
            </>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-surface-900/40 p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
              How To Read This Page
            </h2>
            <ul className="space-y-3 text-sm text-surface-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  A <span className="text-white">definition</span> is published
                  independently of any company. Its version is part of its
                  identity: two versions are two different promises, and a quote
                  records which one it was sealed under.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  A <span className="text-white">refusal</span> is a recorded
                  decision, not a gap in the data. Where a metric's rule
                  forbids publishing a figure, the refusal is sealed with its
                  reason so the absence can be explained rather than excused.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  Verification re-hashes the sealed body and its inputs. A record
                  that fails is shown as failed, never quietly dropped, because a
                  figure that changed after sealing is worse than no figure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  Nothing on record and could-not-be-read are kept apart
                  everywhere on this page. Only one of them is a fact about the
                  business.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} Ledgera Global Inc.
          </span>
          <Link
            href="/analytics"
            className="text-sm text-surface-400 transition-colors hover:text-white"
          >
            Analytics
          </Link>
        </div>
      </footer>
    </div>
  );
}
