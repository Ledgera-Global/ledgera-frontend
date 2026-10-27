"use client";
import AppHeader from "@/components/layouts/AppHeader";
import CoverageLayerGrid from "@/components/analytics/CoverageLayerGrid";
import DataSourceNotice from "@/components/analytics/DataSourceNotice";
import Link from "next/link";
import QuestionCoverageList from "@/components/analytics/QuestionCoverageList";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";

import {
  combineDataSources,
  readSourced,
  type DataSource,
} from "@/lib/dataProvenance";

import {
  NETWORK_COVERAGE_DEMO,
  NETWORK_QUESTIONS_DEMO,
} from "@/lib/data/networkCoverageDemo";
import {
  LAYER_LABEL,
  STATE_CLASSES,
  STATE_LABEL,
  STATE_SUMMARY,
  formatLayers,
} from "@/lib/networkCoverageDisplay";
import type {
  AnswerableQuestionsResponse,
  NetworkCoverageReport,
} from "@/lib/types/networkCoverage";

/**
 * Data-network coverage: which economic questions the connected systems can
 * actually answer, and which are blocked by a missing layer.
 *
 * The blocked list is the product, not the answerable one. A number the business
 * cannot support is worse than an honest gap, so every blocked question states
 * the layer that would unblock it and what connecting it would unlock.
 */
const COMPANY_ID = "companyA";

export default function DataCoveragePage() {
  const [report, setReport] = useState<NetworkCoverageReport>(NETWORK_COVERAGE_DEMO);
  const [questions, setQuestions] =
    useState<AnswerableQuestionsResponse>(NETWORK_QUESTIONS_DEMO);
  const [source, setSource] = useState<DataSource>("demo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [coverage, answerable] = await Promise.all([
        readSourced<NetworkCoverageReport>(
          `/api/network-coverage/${COMPANY_ID}`
        ),
        readSourced<AnswerableQuestionsResponse>(
          `/api/network-coverage/${COMPANY_ID}/questions`
        ),
      ]);
      if (cancelled) return;
      setSource(combineDataSources([coverage, answerable]));
      // The example is only rendered when it was served as the example, or when
      // nothing could be read at all - and in that case the notice says so.
      setReport(coverage.data ?? NETWORK_COVERAGE_DEMO);
      setQuestions(answerable.data ?? NETWORK_QUESTIONS_DEMO);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextBest = report.nextBestConnection;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/data-coverage" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3">Data Coverage</h1>
              <p className="max-w-2xl text-base text-surface-300">
                Which economic questions the connected systems can answer today, and
                which stay blocked until another layer is connected.
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${STATE_CLASSES[report.state]}`}
            >
              {STATE_LABEL[report.state]}
            </span>
          </div>

          {!loading && (
            <DataSourceNotice source={source} subject="network coverage" />
          )}

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-10">
              <section className="rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
                <p className="text-lg leading-relaxed text-surface-200">
                  {report.headline}
                </p>
                <p className="mt-3 text-sm text-surface-400">
                  {STATE_SUMMARY[report.state]}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Stat label="Answerable now" value={String(report.answerableCount)} />
                  <Stat label="Blocked" value={String(questions.blockedCount)} />
                  <Stat label="Questions tracked" value={String(report.totalQuestions)} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
                  Layers
                </h2>
                <CoverageLayerGrid layers={report.layers} />
              </section>

              {nextBest && (
                <section className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-200">
                    Next best connection
                  </h2>
                  <p className="mt-3 text-base text-surface-200">
                    Connecting{" "}
                    <span className="font-semibold text-white">
                      {LAYER_LABEL[nextBest.layer]}
                    </span>{" "}
                    unlocks {nextBest.unlocks}{" "}
                    {nextBest.unlocks === 1 ? "question" : "questions"} outright.
                  </p>
                  <p className="mt-2 text-sm text-surface-400">
                    Supported by {formatLayers([nextBest.layer])}:{" "}
                    {nextBest.providerIds.join(", ")}.
                  </p>
                </section>
              )}

              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
                  Economic questions
                </h2>
                <QuestionCoverageList
                  answerable={questions.answerable}
                  blocked={questions.blocked}
                />
              </section>
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
              className="text-sm text-surface-400 hover:text-white transition-colors"
            >
              Interventions
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
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
