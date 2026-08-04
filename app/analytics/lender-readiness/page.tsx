"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Acquisition", href: "/analytics/acquisition" },
  { label: "Lender Readiness", href: "/analytics/lender-readiness" },
];

type RiskLevel = "HIGH" | "MODERATE" | "LOW";
type ControlStatus = "missing" | "partial" | "ok";

type LenderReport = {
  companyId: string;
  title: string;
  summary: string;
  score: { overall: number; debt: number; cyber: number; leverage: number; coverage: number; covenant: number; credit: number };
  verdict: string;
  headline: string;
  generatedAt: string;
  keyRisks: { level: RiskLevel; label: string; detail: string }[];
  debt: {
    totalDebt: number;
    monthlyPayments: number;
    annualInterestExpense: number;
    weightedAvgRate: number;
    debtToEbitda: number;
    interestCoverage: number;
    ebitda: number;
    ebit: number;
    interest: number;
    debtByType: { name: string; balance: number; rate: number; monthly: number; maturity: string }[];
    maturitySchedule: { year: number; amount: number }[];
    variableVsFixed: { fixed: number; variable: number };
    balloonPayments: { creditor: string; due: string; amount: number }[];
    personalGuarantees: number;
  };
  covenants: {
    status: string;
    items: { name: string; current: number; limit?: number; minimum?: number; unit: string; status: string; headroomPct?: number }[];
  };
  refinance: {
    opportunities: { name: string; description: string; targetRate: number; eligibleDebt: number }[];
    currentAnnualInterest: number;
    potentialAnnualInterest: number;
    annualSavings: number;
  };
  enterpriseValueImpact: { currentValue: number; potentialValue: number; impact: number; rationale: string };
  cyber: { score: number; riskLevel: string; controls: { name: string; status: ControlStatus }[]; readiness: number };
  credit: { business: { bureaus: { bureau: string; score: number; band: string }[] }; status: string };
  underwriterSummary: string;
};

const DEFAULT_REPORT: LenderReport = {
  companyId: "companyA",
  title: "Lender Readiness Report",
  summary: "Consolidated institutional view of debt, covenants, cyber posture, credit health, and refinance opportunity.",
  score: { overall: 64, debt: 47, cyber: 62, leverage: 70, coverage: 80, covenant: 66, credit: 55 },
  verdict: "Conditional Approval Likely",
  headline: "Debt is costly (26% credit cards) and cyber posture is moderate — refinance before applying for best terms.",
  generatedAt: new Date().toISOString(),
  keyRisks: [
    { level: "HIGH", label: "Credit card debt", detail: "$74,000 at 26% interest is the largest drag on borrowing cost." },
    { level: "MODERATE", label: "Cyber readiness", detail: "No offline backups and missing MFA leave the business exposed to ransomware." },
    { level: "MODERATE", label: "Covenant headroom", detail: "Debt/EBITDA at 1.17x leaves thin headroom to the 2.00x bank limit." },
    { level: "LOW", label: "Interest coverage", detail: "EBIT covers interest 6.0x — comfortably above the 2.0x lender threshold." },
  ],
  debt: {
    totalDebt: 1284000,
    monthlyPayments: 18950,
    annualInterestExpense: 118320,
    weightedAvgRate: 11.9,
    debtToEbitda: 1.17,
    interestCoverage: 6.0,
    ebitda: 1100000,
    ebit: 850000,
    interest: 170000,
    debtByType: [
      { name: "Equipment Loan", balance: 420000, rate: 6.9, monthly: 8100, maturity: "2028-06-01" },
      { name: "Truck Loans", balance: 610000, rate: 8.2, monthly: 7550, maturity: "2027-11-01" },
      { name: "Working Capital Loan", balance: 180000, rate: 13.4, monthly: 2900, maturity: "2026-12-01" },
      { name: "Credit Cards", balance: 74000, rate: 26.0, monthly: 2400, maturity: "2026-08-01" },
    ],
    maturitySchedule: [
      { year: 2026, amount: 180000 },
      { year: 2027, amount: 320000 },
      { year: 2028, amount: 900000 },
      { year: 2029, amount: 210000 },
    ],
    variableVsFixed: { fixed: 1030000, variable: 254000 },
    balloonPayments: [{ creditor: "Equipment Loan", due: "2028-06-01", amount: 95000 }],
    personalGuarantees: 2,
  },
  covenants: {
    status: "MONITOR",
    items: [
      { name: "Debt / EBITDA", current: 1.17, limit: 2.0, unit: "x", status: "within", headroomPct: 41 },
      { name: "Interest Coverage", current: 6.0, minimum: 2.0, unit: "x", status: "within" },
      { name: "Current Ratio", current: 1.4, minimum: 1.1, unit: "x", status: "within" },
      { name: "Minimum EBITDA", current: 1100000, minimum: 750000, unit: "$", status: "within" },
      { name: "Leverage (Senior Debt/EBITDA)", current: 1.17, limit: 2.25, unit: "x", status: "within" },
    ],
  },
  refinance: {
    opportunities: [
      { name: "SBA 7(a) refinance", description: "Refinance working capital + credit cards below 10%", targetRate: 9.5, eligibleDebt: 254000 },
      { name: "Equipment loan consolidation", description: "Consolidate equipment + trucks at 7.2%", targetRate: 7.2, eligibleDebt: 1030000 },
    ],
    currentAnnualInterest: 118320,
    potentialAnnualInterest: 80920,
    annualSavings: 37400,
  },
  enterpriseValueImpact: {
    currentValue: 4620000,
    potentialValue: 4862000,
    impact: -242000,
    rationale: "High-rate debt (11.9% blended) raises the buyer's cost of capital and depresses the effective enterprise value.",
  },
  cyber: {
    score: 62,
    riskLevel: "Moderate Risk",
    controls: [
      { name: "MFA enabled", status: "partial" },
      { name: "Endpoint protection", status: "ok" },
      { name: "Offline backups", status: "missing" },
      { name: "Restore testing", status: "missing" },
      { name: "Phishing protection", status: "partial" },
      { name: "Software updates", status: "ok" },
    ],
    readiness: 58,
  },
  credit: {
    business: {
      bureaus: [
        { bureau: "Experian Intelliscore", score: 68, band: "Fair" },
        { bureau: "Equifax Business", score: 64, band: "Fair" },
        { bureau: "Dun & Bradstreet", score: 71, band: "Good" },
      ],
    },
    status: "FAIR",
  },
  underwriterSummary:
    "A sound operating business with healthy EBITDA coverage. Primary concerns are the high-cost credit card balance, moderate cyber posture, and limited covenant headroom. Refinancing the 26% credit card debt and enabling MFA + offline backups would materially improve approval odds.",
};

const scoreColors = [
  { min: 70, className: "text-emerald-400", gauge: "#22c55e" },
  { min: 40, className: "text-amber-400", gauge: "#eab308" },
  { min: 0, className: "text-red-400", gauge: "#ef4444" },
];

function scoreColor(score: number) {
  return scoreColors.find((c) => score >= c.min) ?? scoreColors[scoreColors.length - 1];
}

const riskBadgeColors: Record<RiskLevel, string> = {
  HIGH: "bg-red-400/10 text-red-200 border-red-400/20",
  MODERATE: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  LOW: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
};

function Gauge({ score, size = 140 }: { score: number; size?: number }) {
  const s = 10, r = (size - s) / 2, c = 2 * Math.PI * r, f = (score / 100) * c;
  const color = scoreColor(score).gauge;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={s} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={s} strokeDasharray={`${f} ${c - f}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="32" fontWeight="700">{score}</text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="11">/ 100</text>
    </svg>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full bg-sky-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function LenderReadinessPage() {
  const [scrolled, setScrolled] = useState(false);
  const [report, setReport] = useState<LenderReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/institutional/lender-report/companyA")
      .then((r) => r.json())
      .then((data: LenderReport) => { setReport(data); setLoading(false); })
      .catch(() => { setReport(DEFAULT_REPORT); setLoading(false); });
  }, []);

  const r = report ?? DEFAULT_REPORT;
  const sc = r.score;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-slate-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`text-sm font-medium transition-colors ${link.href === "/analytics/lender-readiness" ? "text-white" : "text-slate-300 hover:text-white"}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 animate-pulse">
                  <div className="h-4 w-1/2 rounded bg-slate-800 mb-4" />
                  <div className="h-24 rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Hero */}
              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/[0.08] to-white/[0.02] p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-8">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-3">{r.title}</h1>
                    <p className="max-w-2xl text-base text-slate-300 leading-6">{r.summary}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">{r.verdict}</span>
                      <span className="text-xs text-slate-500">Updated {new Date(r.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <Gauge score={sc.overall} />
                    <div className={`text-lg font-bold ${scoreColor(sc.overall).className}`}>{r.verdict}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                  <p className="text-sm text-slate-200 leading-6">{r.headline}</p>
                </div>
              </div>

              {/* Key Risks */}
              <SectionCard title="Key Risks" subtitle="What lenders will scrutinize first">
                <div className="grid gap-4 sm:grid-cols-2">
                  {r.keyRisks.map((risk) => (
                    <div key={risk.label} className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{risk.label}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${riskBadgeColors[risk.level]}`}>{risk.level}</span>
                      </div>
                      <p className="text-sm text-slate-400">{risk.detail}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Debt Overview */}
              <SectionCard title="Debt Intelligence" subtitle="Total debt, cost of capital, and leverage ratios">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <StatCard label="Total Debt" value={`$${(r.debt.totalDebt / 1000).toFixed(0)}k`} sub={`${(r.debt.monthlyPayments / 1000).toFixed(1)}k monthly payments`} />
                  <StatCard label="Interest Expense" value={`$${(r.debt.annualInterestExpense / 1000).toFixed(0)}k/yr`} sub={`${r.debt.weightedAvgRate}% blended rate`} />
                  <StatCard label="Debt / EBITDA" value={`${r.debt.debtToEbitda}x`} sub="Private equity benchmark < 3.0x" />
                  <StatCard label="Interest Coverage" value={`${r.debt.interestCoverage}x`} sub="Lender minimum typically 2.0x" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  {r.debt.debtByType.map((d) => (
                    <div key={d.name} className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                      <div className="text-xs text-slate-400 mb-1">{d.name}</div>
                      <div className="text-lg font-bold text-white">${(d.balance / 1000).toFixed(0)}k</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-mono ${d.rate >= 20 ? "text-red-400" : d.rate >= 12 ? "text-amber-400" : "text-emerald-400"}`}>{d.rate}%</span>
                        <span className="text-xs text-slate-500">{d.maturity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Maturity Schedule</h3>
                    <div className="space-y-3">
                      {r.debt.maturitySchedule.map((m) => {
                        const pct = (m.amount / Math.max(...r.debt.maturitySchedule.map((x) => x.amount))) * 100;
                        return (
                          <div key={m.year} className="flex items-center gap-4">
                            <span className="w-12 text-sm font-semibold text-slate-300">{m.year}</span>
                            <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-20 text-right text-sm font-bold text-white">${(m.amount / 1000).toFixed(0)}k</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Structure</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Fixed rate</span>
                        <span className="font-bold text-white">${(r.debt.variableVsFixed.fixed / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Variable rate</span>
                        <span className="font-bold text-amber-400">${(r.debt.variableVsFixed.variable / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Balloon payments</span>
                        <span className="font-bold text-amber-400">{r.debt.balloonPayments.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Personal guarantees</span>
                        <span className="font-bold text-white">{r.debt.personalGuarantees}</span>
                      </div>
                      {r.debt.balloonPayments.map((b) => (
                        <div key={b.creditor} className="rounded-lg border border-amber-400/15 bg-amber-400/5 p-3 text-xs text-slate-300">
                          <span className="font-semibold text-amber-300">{b.creditor}</span>: ${(b.amount / 1000).toFixed(0)}k due {b.due}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Score grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Debt Health", value: sc.debt },
                  { label: "Leverage", value: sc.leverage },
                  { label: "Interest Coverage", value: sc.coverage },
                  { label: "Covenant", value: sc.covenant },
                  { label: "Cyber", value: sc.cyber },
                  { label: "Credit", value: sc.credit },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
                      <span className={`text-lg font-bold ${scoreColor(item.value).className}`}>{item.value}</span>
                    </div>
                    <Bar value={item.value} max={100} />
                  </div>
                ))}
              </div>

              {/* Covenants */}
              <SectionCard title="Covenant Monitoring" subtitle={`Lender covenant status: ${r.covenants.status}`}>
                <div className="space-y-3">
                  {r.covenants.items.map((c) => {
                    const val = c.unit === "$" ? `$${(c.current / 1000).toFixed(0)}k` : `${c.current}${c.unit}`;
                    const limit = c.unit === "$" && c.limit != null ? `$${(c.limit / 1000).toFixed(0)}k` : c.minimum != null ? `${c.minimum}${c.unit}` : `${c.limit}${c.unit}`;
                    return (
                      <div key={c.name} className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/30 p-4">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{c.name}</div>
                          <div className="text-xs text-slate-500">Limit: {limit}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-400">{val}</div>
                        <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-0.5 text-[11px] text-emerald-300">Within</span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Refinance Opportunities */}
              <SectionCard title="Refinance Opportunities" subtitle="Lower-cost structures available today">
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  {r.refinance.opportunities.map((o) => (
                    <div key={o.name} className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                      <div className="text-sm font-semibold text-white mb-1">{o.name}</div>
                      <p className="text-xs text-slate-400 mb-3">{o.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{`$${(o.eligibleDebt / 1000).toFixed(0)}k eligible`}</span>
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/5 px-2.5 py-0.5 text-xs font-bold text-sky-300">{o.targetRate}% target</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
                  <div className="text-xs text-slate-400 mb-1">Annual interest savings</div>
                  <div className="text-3xl font-bold text-emerald-400">${(r.refinance.annualSavings / 1000).toFixed(0)}k / yr</div>
                  <div className="text-xs text-slate-500 mt-1">${(r.refinance.currentAnnualInterest / 1000).toFixed(0)}k current → ${(r.refinance.potentialAnnualInterest / 1000).toFixed(0)}k potential</div>
                </div>
              </SectionCard>

              {/* EV Impact */}
              <SectionCard title="Enterprise Value Impact" subtitle="How your debt stack affects sale value">
                <div className="grid gap-4 sm:grid-cols-3 mb-4">
                  <StatCard label="Current EV" value={`$${(r.enterpriseValueImpact.currentValue / 1000000).toFixed(1)}M`} />
                  <StatCard label="Potential EV" value={`$${(r.enterpriseValueImpact.potentialValue / 1000000).toFixed(1)}M`} />
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Value at Risk</div>
                    <div className="text-lg font-bold text-red-400">-${(Math.abs(r.enterpriseValueImpact.impact) / 1000).toFixed(0)}k</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-6">{r.enterpriseValueImpact.rationale}</p>
              </SectionCard>

              {/* Cyber */}
              <SectionCard title="Cyber Risk" subtitle={`Cyber health score ${r.cyber.score}/100 — ${r.cyber.riskLevel}`}>
                <div className="grid gap-4 sm:grid-cols-2 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Cyber Health</span>
                      <span className={`text-lg font-bold ${scoreColor(r.cyber.score).className}`}>{r.cyber.score}/100</span>
                    </div>
                    <Bar value={r.cyber.score} max={100} />
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-400">Cyber Insurance Readiness</span>
                      <span className={`text-lg font-bold ${scoreColor(r.cyber.readiness).className}`}>{r.cyber.readiness}/100</span>
                    </div>
                    <Bar value={r.cyber.readiness} max={100} />
                  </div>
                  <div className="space-y-2">
                    {r.cyber.controls.map((c) => (
                      <div key={c.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/30 px-3 py-2">
                        <span className="text-sm text-slate-300">{c.name}</span>
                        <span className={`text-xs font-semibold ${c.status === "ok" ? "text-emerald-400" : c.status === "partial" ? "text-amber-400" : "text-red-400"}`}>
                          {c.status === "ok" ? "In Place" : c.status === "partial" ? "Partial" : "Missing"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Credit */}
              <SectionCard title="Credit Score Monitoring" subtitle={`Overall credit status: ${r.credit.status}`}>
                <div className="grid gap-4 sm:grid-cols-3">
                  {r.credit.business.bureaus.map((b) => (
                    <div key={b.bureau} className="rounded-xl border border-white/10 bg-slate-900/30 p-4 text-center">
                      <div className="text-xs text-slate-400 mb-1">{b.bureau}</div>
                      <div className={`text-3xl font-bold ${scoreColor(b.score).className}`}>{b.score}</div>
                      <div className="text-xs text-slate-500 mt-1">{b.band}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Underwriter Summary */}
              <SectionCard title="Underwriter Summary">
                <p className="text-sm text-slate-300 leading-7 max-w-3xl">{r.underwriterSummary}</p>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Landing</Link>
        </div>
      </footer>
    </div>
  );
}
