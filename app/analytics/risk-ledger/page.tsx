"use client";
import AppHeader from "@/components/layouts/AppHeader";
import InsurancePolicyTable from "@/components/analytics/InsurancePolicyTable";
import Link from "next/link";
import RiskExposureGrid from "@/components/analytics/RiskExposureGrid";
import RiskSignalList from "@/components/analytics/RiskSignalList";
import { useEffect, useState } from "react";
import { Gauge } from "@/components/analytics/Gauge";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { RISK_LEDGER_DEMO } from "@/lib/data/riskLedgerDemo";
import type { CorporateRiskLedger } from "@/lib/types/riskLedger";

import {
  countExposures,
  formatCents,
  formatCentsExact,
  riskScoreVerdict,
} from "@/lib/riskLedgerDisplay";

const COMPANY_ID = "companyA";

/**
 * Corporate Risk Ledger: what the operation is exposed to, what coverage answers
 * it, and where the two disagree.
 *
 * The ledger joins two things Ledgera already knows — the operating profile
 * (revenue, payroll, fleet, locations, equipment) and the insurance portfolio —
 * so every exposure figure traces to a policy or to the operation itself. The
 * page renders the backend's verdict; it never recomputes one.
 */
export default function RiskLedgerPage() {
  const [ledger, setLedger] = useState<CorporateRiskLedger>(RISK_LEDGER_DEMO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchJson(
        `/api/insurance/${COMPANY_ID}/risk-ledger`,
        RISK_LEDGER_DEMO
      );
      setLedger(data);
      setLoading(false);
    })();
  }, []);

  const verdict = riskScoreVerdict(ledger.riskScore);
  const counts = countExposures(ledger.exposures.map((e) => e.state));

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/risk-ledger" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3">
                Corporate Risk Ledger
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                The risk balance sheet: every exposure the operation carries,
                the coverage that answers it, and the gaps between them.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              <div>
                Generated{" "}
                {new Date(ledger.generatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-8">
              {/* Verdict */}
              <div className="rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                  <Gauge score={ledger.riskScore} size={160} />
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${verdict.className}`}
                    >
                      {verdict.label}
                    </div>
                    <p className="mt-4 text-lg leading-relaxed text-surface-200">
                      {counts.uncovered > 0
                        ? `${counts.uncovered} line${counts.uncovered === 1 ? "" : "s"} of risk are entirely uninsured, and ${counts.underinsured} more are insured below what this operation exposes.`
                        : `${counts.underinsured} line${counts.underinsured === 1 ? "" : "s"} of coverage sit below what this operation exposes.`}
                    </p>
                    <p className="mt-4 text-sm text-surface-400">
                      {ledger.policies.length} policies, {formatCents(ledger.premium.totalAnnualPremiumCents)} of annual premium,
                      measured against the operating profile Ledgera already holds.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Annual Premium"
                  value={formatCents(ledger.premium.totalAnnualPremiumCents)}
                  sub={`Across ${ledger.premium.policyCount} policies`}
                />
                <MetricCard
                  label="Uninsured Lines"
                  value={String(counts.uncovered)}
                  sub={
                    ledger.coverageGaps.length === 0
                      ? "No gaps found"
                      : ledger.coverageGaps.join(", ")
                  }
                  highlight={counts.uncovered > 0}
                />
                <MetricCard
                  label="Underinsured Lines"
                  value={String(counts.underinsured)}
                  sub="Limit below the modelled exposure"
                />
                <MetricCard
                  label="Open Claims"
                  value={String(ledger.claimsSummary.openClaims)}
                  sub={`${formatCentsExact(ledger.claimsSummary.totalIncurredCents)} reserves and paid losses`}
                />
              </div>

              <RiskSignalList signals={ledger.signals} />

              <RiskExposureGrid exposures={ledger.exposures} />

              <InsurancePolicyTable policies={ledger.policies} />

              {/* Sources and methodology */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                  Where This Data Comes From
                </h3>
                <ul className="space-y-2">
                  {ledger.sources.map((source) => (
                    <li
                      key={source.provider}
                      className="flex items-start gap-2 text-sm text-surface-300"
                    >
                      <span
                        className={`mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${
                          source.connected ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span>
                        <span className="font-medium text-white">{source.provider}</span>{" "}
                        ({source.kind}) — {source.note}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Exposure is modelled from the operating profile; coverage comes from
                    the connected insurance portfolio. Neither number is asserted by hand.
                  </li>
                  <li className="flex items-start gap-2 text-sm text-surface-300">
                    <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    The risk score is the share of exposure lines carrying coverage at or
                    above the modelled level. It answers how much of this risk is
                    answered, not whether the policy is cheap.
                  </li>
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
            className="text-sm text-surface-400 hover:text-white transition-colors"
          >
            Analytics
          </Link>
        </div>
      </footer>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}

function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-red-400/20 bg-red-400/5"
          : "border-white/10 bg-surface-900/40"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
        {label}
      </div>
      <div
        className={`mt-3 font-mono text-2xl font-bold ${
          highlight ? "text-red-300" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-surface-500">{sub}</div>
    </div>
  );
}
