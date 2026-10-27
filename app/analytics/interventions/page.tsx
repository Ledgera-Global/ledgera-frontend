"use client";
import AppHeader from "@/components/layouts/AppHeader";
import AttributionCaveatList from "@/components/analytics/AttributionCaveatList";
import AttributionGradeBadge from "@/components/analytics/AttributionGradeBadge";
import DataSourceNotice from "@/components/analytics/DataSourceNotice";
import EbitdaBridgePanel from "@/components/analytics/EbitdaBridgePanel";
import GrossProfitBridgeTable from "@/components/analytics/GrossProfitBridgeTable";
import InterventionList from "@/components/analytics/InterventionList";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { useInterventionAttribution } from "@/lib/interventions/useInterventionAttribution";

import {
  formatDate,
  formatSignedUsd,
  formatUsd,
  signedClass,
} from "@/lib/interventionDisplay";

/**
 * Intervention attribution: what a vendor change was worth, and how far that
 * claim can be trusted.
 *
 * The order of the page is the argument. Headline and grade first, then the
 * bridge, then what it nets to after the fee, then the caveats, then the window
 * that produced it. A reader who stops early has still seen the grade.
 */
export default function InterventionsPage() {
  const {
    list,
    selectedId,
    attribution,
    source,
    loading,
    saving,
    saveError,
    select,
    saveTreatmentEnd,
    clearSaveError,
  } = useInterventionAttribution();

  const selected = list.interventions.find((row) => row.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/interventions" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3">
                Intervention Attribution
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                What each vendor change did to gross profit, what it was worth after
                the fee, and what the measurement cannot prove.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              {attribution
                ? `Evaluated ${formatDate(attribution.evaluatedAt)}`
                : "Not evaluated"}
            </div>
          </div>

          {!loading && (
            <DataSourceNotice source={source} subject="intervention attribution" />
          )}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : attribution === null ? (
            <NoAttributionRecorded />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <InterventionList
                  interventions={list.interventions}
                  selectedId={selectedId}
                  onSelect={select}
                />

                {selected && (
                  <WindowEditor
                    treatmentEnd={selected.treatmentEnd}
                    saving={saving}
                    error={saveError}
                    onSave={saveTreatmentEnd}
                    onDismissError={clearSaveError}
                  />
                )}
              </aside>

              <div className="space-y-8">
                <div className="rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
                  <AttributionGradeBadge grade={attribution.grade} />
                  <p className="mt-4 text-lg leading-relaxed text-surface-200">
                    {attribution.headline}
                  </p>
                  <p className="mt-3 text-sm text-surface-400">
                    {attribution.label} measured over {attribution.treatment.days} days
                    of treated work against {attribution.baseline.days} baseline days.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Gross Profit Change"
                    value={formatSignedUsd(attribution.grossProfit.changeCents)}
                    sub="Across the two windows"
                    tone={attribution.grossProfit.changeCents}
                  />
                  <MetricCard
                    label="Net Effect"
                    value={formatSignedUsd(attribution.ebitda.netEbitdaEffectCents)}
                    sub="After the vendor fee"
                    tone={attribution.ebitda.netEbitdaEffectCents}
                  />
                  <MetricCard
                    label="Annualised"
                    value={formatSignedUsd(attribution.ebitda.annualisedNetEffectCents)}
                    sub="Straight-line, not a forecast"
                    tone={attribution.ebitda.annualisedNetEffectCents}
                  />
                  <MetricCard
                    label="Vendor Fee"
                    value={formatUsd(attribution.ebitda.vendorCostCents)}
                    sub="Paid over the same window"
                    tone={0}
                  />
                </div>

                <GrossProfitBridgeTable
                  bridge={attribution.grossProfit}
                  baseline={attribution.baseline}
                  treatment={attribution.treatment}
                />

                <EbitdaBridgePanel ebitda={attribution.ebitda} />

                <AttributionCaveatList
                  grade={attribution.grade}
                  caveats={attribution.caveats}
                  hasControl={attribution.control !== null}
                />
{attribution.control && (
                  <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
                      Untreated Comparison Branch
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                          Baseline
                        </div>
                        <div className="mt-2 font-mono text-lg font-bold text-white">
                          {formatUsd(attribution.control.baseline.grossProfitCents)}
                        </div>
                        <div className="mt-1 text-xs text-surface-500">
                          {attribution.control.baseline.completedJobs} jobs
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                          Treatment
                        </div>
                        <div className="mt-2 font-mono text-lg font-bold text-white">
                          {formatUsd(attribution.control.treatment.grossProfitCents)}
                        </div>
                        <div className="mt-1 text-xs text-surface-500">
                          {attribution.control.treatment.completedJobs} jobs
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-surface-300">
                      This branch was not exposed to the vendor. It exists to price out
                      the season and the market, so the treated change can be read
                      against something that moved on its own.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} Ledgera Global Inc.
          </span>
          <div className="flex gap-6">
            <Link
              href="/analytics/data-coverage"
              className="text-sm text-surface-400 hover:text-white transition-colors"
            >
              Data Coverage
            </Link>
            <Link
              href="/analytics"
              className="text-sm text-surface-400 hover:text-white transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
/**
 * Shown when the selected intervention has no attribution recorded.
 *
 * The page renders nothing here rather than keeping the last attribution it
 * held. A bridge belonging to a different vendor, left on screen because the
 * new request failed, is exactly the misreading this screen exists to prevent.
 */
function NoAttributionRecorded() {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8">
      <h2 className="text-lg font-semibold text-white">
        No attribution recorded for this intervention
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-surface-300">
        Nothing has been measured for this intervention yet, so no profit bridge
        is shown. Attribution needs a baseline window and a treated window with
        enough completed work in each; until both exist there is no honest number
        to put here.
      </p>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  tone: number;
}

function MetricCard({ label, value, sub, tone }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
        {label}
      </div>
      <div className={`mt-3 font-mono text-2xl font-bold ${signedClass(tone)}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-surface-500">{sub}</div>
    </div>
  );
}

interface WindowEditorProps {
  treatmentEnd: string | null;
  saving: boolean;
  error: string | null;
  onSave: (treatmentEnd: string | null) => Promise<void>;
  onDismissError: () => void;
}

/**
 * Closing or reopening the treated window.
 *
 * The date is the one input the owner controls directly that changes the result,
 * so the control states plainly what closing the window does: it fixes the
 * number. While the window stays open the figure keeps moving.
 */
function WindowEditor({
  treatmentEnd,
  saving,
  error,
  onSave,
  onDismissError,
}: WindowEditorProps) {
  const isOpen = treatmentEnd === null;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Measurement Window
      </h3>
      <p className="mt-2 text-sm text-surface-300">
        {isOpen
          ? "Open. The treated window runs to today, so the result moves as new work is completed."
          : `Closed ${formatDate(treatmentEnd)}. The result is fixed unless the date is corrected.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(isOpen ? new Date().toISOString() : null)}
          className="rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-500/20 disabled:opacity-50"
        >
          {saving ? "Saving" : isOpen ? "Close window today" : "Reopen window"}
        </button>
        {error && (
          <button
            type="button"
            onClick={onDismissError}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-surface-300 transition-colors hover:border-white/30"
          >
            Dismiss
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}
