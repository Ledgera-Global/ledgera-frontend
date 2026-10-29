"use client";
import AppHeader from "@/components/layouts/AppHeader";
import AssuranceCaseList from "@/components/analytics/AssuranceCaseList";
import CaseDetailPanel from "@/components/analytics/CaseDetailPanel";
import DataSourceNotice from "@/components/analytics/DataSourceNotice";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { formatDate, formatUsd } from "@/lib/assuranceCaseDisplay";
import { useAssuranceCases } from "@/lib/assuranceCases/useAssuranceCases";

/**
 * Revenue assurance cases: what is leaking, who owns it, and what was decided.
 *
 * The page is built around accountability rather than detection. A finding that
 * nobody owns and nobody can close is a notification; a case carries an owner, a
 * due date and a recorded decision, so "we are on it" and "we decided not to
 * collect it" are different, visible states.
 */
export default function AssuranceCasesPage() {
  const {
    list,
    selectedId,
    selected,
    interventions,
    linkedAttribution,
    linkedAttributionLoading,
    source,
    loading,
    saving,
    syncing,
    saveError,
    syncNote,
    select,
    updateCase,
    sync,
    clearSaveError,
    clearSyncNote,
  } = useAssuranceCases();

  const nowIso = list.evaluatedAt;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/assurance-cases" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Revenue Assurance Cases
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                Every control failure becomes a case with an owner, an amount and
                a recorded decision. Nothing is called recovered until someone
                says what came back and how.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              {list.count > 0
                ? `${list.count} on record, ${formatUsd(list.openAtStakeCents)} still open`
                : "Nothing on record"}
              <div className="mt-1 text-xs text-surface-500">
                Checked {formatDate(list.evaluatedAt)}
              </div>
            </div>
          </div>

          {!loading && (
            <DataSourceNotice source={source} subject="assurance cases" />
          )}

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-500/20 disabled:opacity-50"
            >
              {syncing ? "Checking the ledger" : "Run the check"}
            </button>
            {syncNote && (
              <>
                <p className="text-sm text-surface-300">{syncNote}</p>
                <button
                  type="button"
                  onClick={clearSyncNote}
                  className="text-xs text-surface-500 underline hover:text-surface-300"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
              <aside>
                <AssuranceCaseList
                  cases={list.cases}
                  selectedId={selectedId}
                  nowIso={nowIso}
                  onSelect={select}
                />
              </aside>

              <div>
                {selected === null ? (
                  <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8">
                    <h2 className="text-lg font-semibold text-white">
                      No case selected
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-surface-300">
                      Pick a case from the list to see what was found, what it is
                      worth and what has been decided about it.
                    </p>
                  </div>
                ) : (
                  <CaseDetailPanel
                    caseRow={selected}
                    interventions={interventions.interventions}
                    linkedAttribution={linkedAttribution}
                    linkedAttributionLoading={linkedAttributionLoading}
                    nowIso={nowIso}
                    saving={saving}
                    error={saveError}
                    onSubmit={(input) => updateCase(selected.id, input)}
                    onDismissError={clearSaveError}
                  />
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
              href="/analytics/interventions"
              className="text-sm text-surface-400 transition-colors hover:text-white"
            >
              Interventions
            </Link>
            <Link
              href="/analytics"
              className="text-sm text-surface-400 transition-colors hover:text-white"
            >
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
