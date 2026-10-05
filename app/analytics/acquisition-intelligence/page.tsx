"use client";
import AcquisitionDealSection from "@/components/analytics/AcquisitionDealSection";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { formatDate, formatSignedUsd, formatUsd } from "@/lib/acquisitionIntelligenceDisplay";
import { fetchJson } from "@/lib/api/client";
import { ACQUISITION_INTELLIGENCE_DEMO } from "@/lib/data/acquisitionIntelligenceDemo";
import type { AcquisitionPortfolio } from "@/lib/types/acquisitionIntelligence";

const COMPANY_ID = "companyA";

/**
 * Acquisition intelligence: what the businesses we bought are now worth.
 *
 * The candidate radar on the acquisition page answers "what should we buy?".
 * This is the other half, and the half that costs money when it goes unasked:
 * was what we bought worth it? A deal that misses its underwriting is a
 * purchase-price problem, not an operating problem, and it is only visible if
 * the underwriting written at close is held against what the business has
 * actually done since.
 *
 * Every figure here traces to a stored underwriting or a recorded window. Where
 * a figure could not be established it is shown as unmeasured with the reason,
 * never as zero — a deal nobody measured and a deal that earned nothing call
 * for opposite responses.
 */
export default function AcquisitionIntelligencePage() {
  const [portfolio, setPortfolio] = useState<AcquisitionPortfolio>(
    ACQUISITION_INTELLIGENCE_DEMO
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchJson(
        `/api/acquisition-intelligence/${COMPANY_ID}`,
        ACQUISITION_INTELLIGENCE_DEMO
      );
      setPortfolio(data);
      setLoading(false);
    })();
  }, []);

  const { summary, priorities, acquisitions } = portfolio;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/acquisition-intelligence" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Acquisition Intelligence
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                What each acquisition was underwritten to earn, what it has
                earned since, and what the difference has done to enterprise
                value.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              <div>Generated {formatDate(portfolio.generatedAt)}</div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : acquisitions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-8">
              <p className="text-base text-surface-300">
                No acquisitions have been recorded against this company, so
                there is no underwriting to hold anything against.
              </p>
              <Link
                href="/analytics/acquisition"
                className="mt-4 inline-block text-sm text-brand-300 hover:text-white"
              >
                Look at acquisition candidates
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Portfolio position */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Net Value Created"
                  value={formatSignedUsd(summary.totalNetValueCreated)}
                  sub={`Across ${summary.valueMeasuredFor} of ${summary.total} deals that could be measured`}
                  highlight={summary.totalNetValueCreated > 0}
                  negative={summary.totalNetValueCreated < 0}
                />
                <MetricCard
                  label="Capital Deployed"
                  value={formatUsd(summary.purchasePriceDeployed)}
                  sub="Purchase prices paid at close"
                />
                <MetricCard
                  label="Value At Risk"
                  value={String(summary.valueAtRisk)}
                  sub={
                    summary.valueAtRisk === 0
                      ? "No deal reads as value at risk"
                      : `of ${summary.total} closed deals`
                  }
                  negative={summary.valueAtRisk > 0}
                />
                <MetricCard
                  label="On Track"
                  value={String(summary.onTrack)}
                  sub="Performing to plan or broadly on track"
                />
              </div>

              {/* What to look at first */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
                  Where To Look First
                </h2>
                <ul className="space-y-3">
                  {priorities.map((priority) => (
                    <li key={priority.acquisitionId} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      <div className="text-sm">
                        <span className="font-medium text-surface-100">
                          {priority.targetName}
                        </span>
                        <span className="text-surface-400"> — {priority.reason}</span>
                        <span className="ml-2 font-mono text-xs text-surface-500">
                          {formatSignedUsd(priority.netValueCreated)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The deals themselves */}
              {acquisitions.map((report) => (
                <AcquisitionDealSection key={report.acquisitionId} report={report} />
              ))}

              {/* Methodology */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
                  How This Is Calculated
                </h3>
                <ul className="space-y-2 text-sm text-surface-300">
                  <MethodologyLine>
                    The underwriting is read as it was written at close, not
                    reconstructed. A target that missed its case and a target
                    whose case was quietly revised downward read identically
                    otherwise.
                  </MethodologyLine>
                  <MethodologyLine>
                    Post-close revenue and EBITDA are annualised from the most
                    recent recorded window using that window's own length,
                    then measured against the annual figures in the underwriting.
                  </MethodologyLine>
                  <MethodologyLine>
                    Earnings delivery is weighted heaviest of the six dimensions.
                    A deal that is not earning what it was bought to earn is not
                    rescued by holding its customers or staying within its
                    integration budget.
                  </MethodologyLine>
                  <MethodologyLine>
                    No headline score is issued unless at least half the case by
                    weight could be measured. Below that, the deal is reported as
                    not yet measurable rather than graded on the pieces that
                    happen to be available.
                  </MethodologyLine>
                  <MethodologyLine>
                    Enterprise value is the earnings now being produced at the
                    multiple the deal was bought on, less what integration cost
                    beyond budget. What similar businesses fetch today is a
                    different claim and is not made here.
                  </MethodologyLine>
                </ul>
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

function MethodologyLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
      <span>{children}</span>
    </li>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  negative?: boolean;
}

function MetricCard({ label, value, sub, highlight, negative }: MetricCardProps) {
  const tone = negative
    ? "border-red-400/20 bg-red-400/5"
    : highlight
      ? "border-emerald-400/20 bg-emerald-400/5"
      : "border-white/10 bg-surface-900/40";

  const valueTone = negative
    ? "text-red-400"
    : highlight
      ? "text-emerald-400"
      : "text-white";

  return (
    <div className={`rounded-2xl border p-6 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
        {label}
      </div>
      <div className={`mt-3 font-mono text-2xl font-bold ${valueTone}`}>{value}</div>
      <div className="mt-1 text-xs text-surface-500">{sub}</div>
    </div>
  );
}
