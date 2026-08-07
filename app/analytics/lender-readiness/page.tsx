"use client";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gauge } from "@/components/analytics/Gauge";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { NAV_LINKS } from "@/lib/constants/styling";

const COMPANY_ID = "companyA";

// ─── Types ─────────────────────────────────────────────────────────────

type Status = "green" | "yellow" | "red";

interface LenderReportSection<T> {
  status: Status;
  data: T;
  notes: string[];
}

interface LenderReport {
  companyId: string;
  reportId: string;
  generatedAt: string;
  overallScore: number;
  verdict: string;
  headline: string;
  sections: {
    debt: LenderReportSection<{
      totalDebt: number;
      monthlyDebtPayments: number;
      annualInterestExpense: number;
      weightedAvgRate: number;
      variableRatePortion: number;
      totalBalloonPayments: number;
      personalGuaranteeExposure: number;
      maturitySchedule: { year: number; amount: number; items: string[] }[];
      items: { name: string; principal: number; interestRate: number; lender: string }[];
    }>;
    debtHealth: LenderReportSection<{ score: number; rating: string }>;
    leverage: LenderReportSection<{ totalDebt: number; ebitda: number; ratio: number; assessment: string }>;
    interestCoverage: LenderReportSection<{ ebit: number; annualInterest: number; coverageRatio: number; status: string }>;
    evImpact: LenderReportSection<{
      currentDebtCostAnnual: number;
      potentialSavingsAnnual: number;
      evImpact: number;
      narrative: string;
    }>;
    refinance: LenderReportSection<{
      totalCurrentInterest: number;
      totalOptimizedInterest: number;
      totalSavings: number;
      opportunities: {
        type: string;
        currentRate: number;
        estimatedNewRate: number;
        annualSavings: number;
        breakevenMonths: number;
        recommendation: string;
      }[];
    }>;
    cashFlow: LenderReportSection<{ revenue: number; grossMarginPct: number; freeCashFlow: number }>;
    covenants: LenderReportSection<{
      totalCovenants: number;
      greenCount: number;
      yellowCount: number;
      redCount: number;
      overallStatus: string;
    }>;
    cyber: LenderReportSection<{ overallScore: number; status: string }>;
    credit: LenderReportSection<{
      businessCredit: { name: string; score: number; trend: string }[];
      overallHealth: string;
    }>;
  };
  keyRisks: string[];
  lenderConfidenceNotes: string[];
}

// ─── Fallback demo report (renders when the API is unreachable) ────────

const FALLBACK_REPORT: LenderReport = {
  companyId: COMPANY_ID,
  reportId: "LDR-DEMO",
  generatedAt: new Date().toISOString(),
  overallScore: 64,
  verdict: "Conditional Approval Likely",
  headline:
    "This company carries roughly $21K/yr of avoidable interest. Refinancing the credit-card and working-capital facilities would strengthen the balance sheet before your next lender conversation.",
  sections: {
    debt: {
      status: "yellow",
      data: {
        totalDebt: 1284000,
        monthlyDebtPayments: 28000,
        annualInterestExpense: 141160,
        weightedAvgRate: 11.0,
        variableRatePortion: 254000,
        totalBalloonPayments: 145000,
        personalGuaranteeExposure: 790000,
        maturitySchedule: [
          { year: 2027, amount: 180000, items: ["Equipment Loan"] },
          { year: 2028, amount: 684000, items: ["Truck Loans", "Credit Cards"] },
          { year: 2029, amount: 420000, items: ["Working Capital Loan"] },
        ],
        items: [
          { name: "Equipment Loan", principal: 420000, interestRate: 6.9, lender: "Bank of America" },
          { name: "Truck Loans", principal: 610000, interestRate: 8.2, lender: "Mercedes Financial" },
          { name: "Working Capital Loan", principal: 180000, interestRate: 13.4, lender: "OnDeck" },
          { name: "Credit Cards", principal: 74000, interestRate: 26.0, lender: "Chase / Amex" },
        ],
      },
      notes: [],
    },
    debtHealth: { status: "yellow", data: { score: 47, rating: "Fair" }, notes: [] },
    leverage: {
      status: "yellow",
      data: { totalDebt: 1284000, ebitda: 1100000, ratio: 1.17, assessment: "Moderate leverage - within bank comfort zone" },
      notes: [],
    },
    interestCoverage: {
      status: "green",
      data: { ebit: 847000, annualInterest: 141160, coverageRatio: 6.0, status: "Strong" },
      notes: [],
    },
    evImpact: {
      status: "yellow",
      data: {
        currentDebtCostAnnual: 141160,
        potentialSavingsAnnual: 54760,
        evImpact: 246420,
        narrative: "Your company is worth roughly $246K less than it could be at the current blended rate of 11%.",
      },
      notes: [],
    },
    refinance: {
      status: "yellow",
      data: {
        totalCurrentInterest: 141160,
        totalOptimizedInterest: 120440,
        totalSavings: 20870,
        opportunities: [
          {
            type: "Debt Consolidation - Credit Cards",
            currentRate: 26,
            estimatedNewRate: 8.5,
            annualSavings: 12950,
            breakevenMonths: 2,
            recommendation: "Refinance Credit Cards from 26% to ~8.5% - saves $13K/yr, breaks even in 2 months.",
          },
          {
            type: "SBA Refinance - Working Capital Loan",
            currentRate: 13.4,
            estimatedNewRate: 9,
            annualSavings: 7920,
            breakevenMonths: 7,
            recommendation: "Refinance Working Capital Loan from 13.4% to ~9% - saves $8K/yr, breaks even in 7 months.",
          },
        ],
      },
      notes: [],
    },
    cashFlow: { status: "green", data: { revenue: 420000, grossMarginPct: 40, freeCashFlow: 3600 }, notes: [] },
    covenants: {
      status: "yellow",
      data: { totalCovenants: 6, greenCount: 3, yellowCount: 2, redCount: 1, overallStatus: "Watch" },
      notes: [],
    },
    cyber: { status: "yellow", data: { overallScore: 62, status: "Needs Improvement" }, notes: [] },
    credit: {
      status: "yellow",
      data: {
        businessCredit: [
          { name: "Experian Business", score: 72, trend: "stable" },
          { name: "Equifax Business", score: 65, trend: "down" },
          { name: "Dun & Bradstreet", score: 78, trend: "up" },
        ],
        overallHealth: "Good",
      },
      notes: [],
    },
  },
  keyRisks: [
    "Rate exposure: 20% of debt is variable-rate.",
    "Balloon exposure: $145K in balloon payments due (1 facility/facilities).",
    "Personal guarantees: $790K of debt is personally guaranteed.",
    "Cyber posture (62/100) may fail insurer underwriting or raise premium materially.",
    "Refinance opportunity: ~$21K/yr in interest savings identified - strengthen the balance sheet before applying.",
  ],
  lenderConfidenceNotes: [
    "Debt service burden: $28.0K/mo across 4 facilities at a 11% blended rate.",
    "Debt/EBITDA of 1.17x is within standard SBA/equipment underwriting parameters.",
    "Covenant status: 3/6 tracked covenants green (Watch).",
    "Cyber insurance readiness: 62/100 (Needs Improvement) - insurers currently require MFA + tested backups + endpoint protection.",
  ],
};

// ─── Formatting helpers ─────────────────────────────────────────────────

const fmtDollars = (value: number): string =>
  "$" + (value / 1000).toFixed(0) + "K";

const STATUS_STYLES: Record<Status, string> = {
  green: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  yellow: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  red: "bg-red-400/10 text-red-300 border-red-400/20",
};

const STATUS_LABEL: Record<Status, string> = {
  green: "Solid",
  yellow: "Conditional",
  red: "Attention",
};

// ─── Page ───────────────────────────────────────────────────────────────

export default function LenderReadinessPage() {
  const [scrolled, setScrolled] = useState(false);
  const [report, setReport] = useState<LenderReport>(FALLBACK_REPORT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const data = await fetchJson(`/api/institutional/lender-report/${COMPANY_ID}`, FALLBACK_REPORT);
      setReport(data);
      setLoading(false);
    })();
  }, []);

  const s = report.sections;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
              L
            </span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/analytics/lender-readiness"
                    ? "text-white"
                    : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <InstitutionalNav currentHref="/analytics/lender-readiness" />
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-3">
                Lender Readiness Report
              </h1>
              <p className="max-w-2xl text-base text-surface-300">
                One consolidated institutional pack - debt, covenants, cyber, credit, and
                refinance - the way an underwriter reads your business.
              </p>
            </div>
            <div className="text-right text-sm text-surface-400">
              <div>{report.reportId}</div>
              <div>
                Generated{" "}
                {new Date(report.generatedAt).toLocaleDateString("en-US", {
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
              {/* Hero score */}
              <div className="rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-500/[0.08] to-white/[0.02] p-8">
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                  <Gauge score={report.overallScore} size={160} />
                  <div className="flex-1">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
                        report.overallScore >= 70
                          ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                          : report.overallScore >= 40
                          ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                          : "bg-red-400/10 text-red-300 border-red-400/20"
                      }`}
                    >
                      {report.verdict}
                    </div>
                    <p className="mt-4 text-lg leading-relaxed text-surface-200">
                      {report.headline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key risks */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300 mb-4">
                  Key Risks ({report.keyRisks.length})
                </h2>
                <ul className="space-y-2">
                  {report.keyRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Underwriting snapshot */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Total Debt"
                  value={fmtDollars(s.debt.data.totalDebt)}
                  sub={`${s.debt.data.weightedAvgRate}% blended`}
                  status={s.debt.status}
                  statusLabel={STATUS_LABEL[s.debt.status]}
                />
                <MetricCard
                  label="Debt / EBITDA"
                  value={`${s.leverage.data.ratio.toFixed(2)}x`}
                  sub={s.leverage.data.assessment}
                  status={s.leverage.status}
                  statusLabel={s.leverage.data.ratio < 2.5 ? "Low" : "Elevated"}
                />
                <MetricCard
                  label="Interest Coverage"
                  value={`${s.interestCoverage.data.coverageRatio.toFixed(1)}x`}
                  sub={`${fmtDollars(s.interestCoverage.data.ebit)} EBIT / ${fmtDollars(s.interestCoverage.data.annualInterest)} interest`}
                  status={s.interestCoverage.status}
                  statusLabel={s.interestCoverage.data.status}
                />
                <MetricCard
                  label="Debt Health"
                  value={`${s.debtHealth.data.score}/100`}
                  sub={s.debtHealth.data.rating}
                  status={s.debtHealth.status}
                  statusLabel={STATUS_LABEL[s.debtHealth.status]}
                />
              </div>

              {/* Covenant + cyber + credit */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                    Covenant Status
                  </h3>
                  <div className="text-3xl font-bold text-white">
                    {s.covenants.data.greenCount}/{s.covenants.data.totalCovenants}
                    <span className="text-base font-normal text-surface-400"> green</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {s.covenants.data.greenCount} green
                    </span>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                      {s.covenants.data.yellowCount} yellow
                    </span>
                    <span className="rounded-full bg-red-400/10 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                      {s.covenants.data.redCount} red
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-surface-400">
                    Overall:{" "}
                    <span
                      className={
                        s.covenants.data.overallStatus === "Compliant"
                          ? "text-emerald-400"
                          : s.covenants.data.overallStatus === "Watch"
                          ? "text-amber-400"
                          : "text-red-400"
                      }
                    >
                      {s.covenants.data.overallStatus}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                    Cyber Insurance Readiness
                  </h3>
                  <div className="flex items-center gap-4">
                    <Gauge score={s.cyber.data.overallScore} size={92} />
                    <div>
                      <div className="text-xl font-bold text-white">
                        {s.cyber.data.overallScore}/100
                      </div>
                      <div className="text-sm text-surface-400">{s.cyber.data.status}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                    Business Credit
                  </h3>
                  <div className="space-y-2">
                    {s.credit.data.businessCredit.map((bureau) => (
                      <div key={bureau.name} className="flex items-center justify-between text-sm">
                        <span className="text-surface-300">{bureau.name}</span>
                        <span
                          className={`font-mono font-semibold ${
                            bureau.trend === "up"
                              ? "text-emerald-400"
                              : bureau.trend === "down"
                              ? "text-red-400"
                              : "text-surface-300"
                          }`}
                        >
                          {bureau.score}
                          {bureau.trend === "up" ? " \u2191" : bureau.trend === "down" ? " \u2193" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-surface-500">
                    Overall health: <span className="text-surface-300">{s.credit.data.overallHealth}</span>
                  </div>
                </div>
              </div>

              {/* Debt stack + maturity */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                    Debt Stack
                  </h3>
                  <div className="space-y-3">
                    {s.debt.data.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium text-surface-100">{item.name}</div>
                          <div className="text-xs text-surface-500">{item.lender}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-surface-100">{fmtDollars(item.principal)}</div>
                          <div className="text-xs text-surface-500">{item.interestRate}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-sm">
                    <div>
                      <div className="text-xs text-surface-500">Monthly payments</div>
                      <div className="font-mono text-surface-100">{fmtDollars(s.debt.data.monthlyDebtPayments)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-surface-500">Annual interest</div>
                      <div className="font-mono text-surface-100">{fmtDollars(s.debt.data.annualInterestExpense)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-surface-500">Balloons due</div>
                      <div className="font-mono text-amber-300">{fmtDollars(s.debt.data.totalBalloonPayments)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-surface-500">Personal guarantees</div>
                      <div className="font-mono text-amber-300">{fmtDollars(s.debt.data.personalGuaranteeExposure)}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                    Maturity Timeline
                  </h3>
                  <div className="space-y-3">
                    {s.debt.data.maturitySchedule.map((row) => (
                      <div key={row.year} className="flex items-center gap-4">
                        <span className="w-14 shrink-0 font-mono text-sm text-surface-300">
                          {row.year}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
                            style={{
                              width: `${Math.min(
                                100,
                                (row.amount / Math.max(s.debt.data.totalDebt, 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right font-mono text-sm text-surface-200">
                          {fmtDollars(row.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-surface-500">
                    Variable rate exposure: {fmtDollars(s.debt.data.variableRatePortion)} of debt
                  </div>
                </div>
              </div>

              {/* Refinance opportunities */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
                    Refinance Opportunities
                  </h3>
                  <div className="text-sm">
                    <span className="text-surface-400">Potential annual savings: </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {fmtDollars(s.refinance.data.totalSavings)}
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.refinance.data.opportunities.map((opp, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-surface-950/40 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-surface-100">{opp.type}</span>
                        <span className="font-mono text-sm text-emerald-400">
                          +{fmtDollars(opp.annualSavings)}/yr
                        </span>
                      </div>
                      <div className="text-xs text-surface-500 mb-3">
                        {opp.currentRate}% &rarr; ~{opp.estimatedNewRate}% &middot; break-even in{" "}
                        {opp.breakevenMonths} months
                      </div>
                      <p className="text-xs text-surface-400">{opp.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* EV impact */}
              <div className="rounded-2xl border border-brand-400/20 bg-brand-400/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-300 mb-4">
                  Enterprise Value Impact
                </h3>
                <p className="text-base text-surface-200">{s.evImpact.data.narrative}</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-surface-500">Current interest cost</div>
                    <div className="font-mono text-lg text-white">{fmtDollars(s.evImpact.data.currentDebtCostAnnual)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-surface-500">Potential savings</div>
                    <div className="font-mono text-lg text-emerald-400">{fmtDollars(s.evImpact.data.potentialSavingsAnnual)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-surface-500">Value impact</div>
                    <div className="font-mono text-lg text-amber-300">{fmtDollars(s.evImpact.data.evImpact)}</div>
                  </div>
                </div>
              </div>

              {/* Underwriter summary */}
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
                  Underwriter Summary
                </h3>
                <ul className="space-y-2">
                  {report.lenderConfidenceNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                      <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {note}
                    </li>
                  ))}
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
          <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">
            Landing
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─── Metric card ────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  status: Status;
  statusLabel: string;
}

function MetricCard({ label, value, sub, status, statusLabel }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
          {label}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status]}`}>
          {statusLabel}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-surface-500 line-clamp-2">{sub}</div>
    </div>
  );
}
