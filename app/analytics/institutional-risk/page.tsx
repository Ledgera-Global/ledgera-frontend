"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { NAV_LINKS } from "@/lib/constants/styling";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function pct(v: number) {
  return v.toFixed(1) + "%";
}

function Gauge({ score, size = 100 }: { score: number; size?: number }) {
  const s = 8, r = (size - s) / 2, c = 2 * Math.PI * r, f = (score / 100) * c;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={s}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={s} strokeDasharray={`${f} ${c-f}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="22" fontWeight="700">{score}</text>
      <text x="50%" y="65%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="9">/ 100</text>
    </svg>
  );
}

function S({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-surface-400">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Bar({ label, value, max, color = "bg-brand-400", ffn = (v: number) => String(v) }: { label: string; value: number; max: number; color?: string; ffn?: (v: number) => string }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-300">{label}</span>
        <span className="text-white font-semibold">{ffn(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: w + "%" }} />
      </div>
    </div>
  );
}

function StatusBadge({ status, good, warn, bad }: { status: string; good: string; warn: string; bad: string }) {
  const lower = status.toLowerCase();
  const color = lower === good ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" :
    lower === warn ? "text-amber-300 border-amber-400/20 bg-amber-400/10" :
    "text-red-300 border-red-400/20 bg-red-400/10";
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>{status}</span>;
}

type DebtItem = { name: string; principal: number; interestRate: number; lender: string };
type MaturityItem = { year: number; amount: number; items: string[] };
type FlowItem = { label: string; amount: number; color: string; pct: number };
type RefinanceOpp = { type: string; currentRate: number; estimatedNewRate: number; annualSavings: number };
type DarkWebAlert = { id: string; type: string; email: string; foundAt: string; source: string; severity: string; action: string; };
type LoginAnomaly = { id: string; timestamp: string; user: string; location: string; type: string; severity: string; };
type FraudSignal = { id: string; type: string; amount: number; description: string; severity: string; status: string; recommendation: string; };
type VendorRisk = { vendorName: string; category: string; riskScore: number; riskLevel: string; hasMfa: boolean; };
type CovenantItem = { name: string; metric: string; threshold: string; currentValue: string; status: string; };

type ExecutiveRiskDashboard = {
  financial: {
    revenue: number; grossMarginPct: number; ebitda: number; cash: number;
    debt: { totalDebt: number; monthlyDebtPayments: number; annualInterestExpense: number; weightedAvgRate: number; variableRatePortion: number; totalBalloonPayments: number; personalGuaranteeExposure: number; items: DebtItem[]; maturitySchedule: MaturityItem[]; };
    debtHealth: { score: number; rating: string; factors: Record<string, number> };
    debtToEbitda: { totalDebt: number; ebitda: number; ratio: number; assessment: string };
    interestCoverage: { ebit: number; annualInterest: number; coverageRatio: number; status: string };
    enterpriseValueImpact: { potentialSavingsAnnual: number; evImpact: number; narrative: string };
    refinanceOpportunities: { totalSavings: number; opportunities: RefinanceOpp[] };
    cashFlowWaterfall: { flowItems: FlowItem[] };
  };
  operational: { technicianUtilization: number; bookingRate: number; membershipRenewalRate: number; installCloseRate: number; maintenanceRevenue: number };
  risk: { cyberHealth: { score: number; rating: string }; fraudAlerts: number; darkWebAlerts: number; cashRunway: number; covenantStatus: string; covenantAtRisk: number; };
  growth: { acquisitionReadiness: string; multiLocationCount: number; customerLifetimeValue: number; marketingROI: number; expansionCapacity: string; };
};

const DASHBOARD_DEFAULTS: ExecutiveRiskDashboard = {
  financial: {
    revenue: 420000, grossMarginPct: 40.0, ebitda: 1100000, cash: 185000,
    debt: {
      totalDebt: 1284000, monthlyDebtPayments: 28000, annualInterestExpense: 166780,
      weightedAvgRate: 13.0, variableRatePortion: 254000, totalBalloonPayments: 145000, personalGuaranteeExposure: 790000,
      items: [
        { name: "Equipment Loan", principal: 420000, interestRate: 6.9, lender: "Bank of America" },
        { name: "Truck Loans", principal: 610000, interestRate: 8.2, lender: "Mercedes Financial" },
        { name: "Working Capital Loan", principal: 180000, interestRate: 13.4, lender: "OnDeck" },
        { name: "Credit Cards", principal: 74000, interestRate: 26.0, lender: "Chase / Amex" },
      ],
      maturitySchedule: [{ year: 2028, amount: 684000, items: ["Truck Loans", "Credit Cards"] }, { year: 2029, amount: 180000, items: ["Working Capital Loan"] }, { year: 2031, amount: 420000, items: ["Equipment Loan"] }],
    },
    debtHealth: { score: 47, rating: "High Risk", factors: {} },
    debtToEbitda: { totalDebt: 1284000, ebitda: 1100000, ratio: 1.17, assessment: "Moderate leverage" },
    interestCoverage: { ebit: 850000, annualInterest: 166780, coverageRatio: 5.1, status: "Strong" },
    enterpriseValueImpact: { potentialSavingsAnnual: 83330, evImpact: 374985, narrative: "Because your debt carries high interest rates averaging 13.0%, your company is worth approximately $375K less than it could be." },
    refinanceOpportunities: { totalSavings: 12950, opportunities: [{ type: "Debt Consolidation — Credit Cards", currentRate: 26.0, estimatedNewRate: 8.5, annualSavings: 12950 }] },
    cashFlowWaterfall: {
      flowItems: [
        { label: "Revenue", amount: 420000, color: "#22c55e", pct: 100 },
        { label: "COGS", amount: -252000, color: "#ef4444", pct: 60 },
        { label: "Gross Profit", amount: 168000, color: "#22c55e", pct: 40 },
        { label: "Payroll", amount: -98000, color: "#f97316", pct: 23 },
        { label: "Rent", amount: -18000, color: "#eab308", pct: 4 },
        { label: "Marketing", amount: -12000, color: "#a855f7", pct: 3 },
        { label: "Interest", amount: -28000, color: "#ef4444", pct: 7 },
        { label: "Taxes", amount: -8400, color: "#94a3b8", pct: 2 },
        { label: "Net Income", amount: 3600, color: "#22c55e", pct: 1 },
      ],
    },
  },
  operational: { technicianUtilization: 72, bookingRate: 84, membershipRenewalRate: 82, installCloseRate: 38, maintenanceRevenue: 216000 },
  risk: { cyberHealth: { score: 65, rating: "Good" }, fraudAlerts: 3, darkWebAlerts: 3, cashRunway: 3.2, covenantStatus: "Watch", covenantAtRisk: 2 },
  growth: { acquisitionReadiness: "Pre-Revenue Threshold", multiLocationCount: 3, customerLifetimeValue: 4200, marketingROI: 3.2, expansionCapacity: "Moderate — strengthen cash flow before new locations" },
};

// ─── Phase 2 Demo Data ─────────────────────────────────────────────────

const CYBER_DARK_WEB: DarkWebAlert[] = [
  { id: "dw-1", type: "credential_leak", email: "admin@apexhvac.com", foundAt: "2026-06-15", source: "Dark Web Forum — breached database dump", severity: "critical", action: "Immediately reset password and enable MFA" },
  { id: "dw-2", type: "email_exposure", email: "ap@apexhvac.com", foundAt: "2026-05-22", source: "LinkedIn scrape", severity: "medium", action: "Monitor for targeted phishing" },
  { id: "dw-3", type: "password_leak", email: "dispatcher@apexhvac.com", foundAt: "2026-07-01", source: "HaveIBeenPwned", severity: "high", action: "Reset password. Enforce unique passwords." },
];

const CYBER_LOGIN_ANOMALIES: LoginAnomaly[] = [
  { id: "la-1", timestamp: "2026-07-28T03:15:00Z", user: "admin@apexhvac.com", location: "Moscow, Russia", type: "impossible_travel", severity: "critical" },
  { id: "la-2", timestamp: "2026-07-27T22:40:00Z", user: "tech4@apexhvac.com", location: "Unknown (TOR exit node)", type: "new_device", severity: "high" },
  { id: "la-3", timestamp: "2026-07-26T01:10:00Z", user: "dispatcher@apexhvac.com", location: "Charlotte, NC", type: "off_hours", severity: "medium" },
];

const CYBER_FRAUD_SIGNALS: FraudSignal[] = [
  { id: "fs-1", type: "duplicate_invoice", amount: 4250, description: "Invoice #INV-4421 matches #INV-4398 from ABC Supply", severity: "high", status: "open", recommendation: "Verify with vendor before payment" },
  { id: "fs-2", type: "suspicious_vendor", amount: 12000, description: "New vendor with same bank routing as existing vendor", severity: "critical", status: "open", recommendation: "Verify vendor authenticity" },
  { id: "fs-3", type: "ach_anomaly", amount: 85000, description: "ACH transfer to new bank account — exceeds normal pattern by 340%", severity: "critical", status: "investigating", recommendation: "Contact bank immediately" },
];

const CYBER_VENDORS: VendorRisk[] = [
  { vendorName: "ServiceTitan", category: "Field Service", riskScore: 15, riskLevel: "low", hasMfa: true },
  { vendorName: "QuickBooks Online", category: "Accounting", riskScore: 12, riskLevel: "low", hasMfa: true },
  { vendorName: "Microsoft 365", category: "Productivity", riskScore: 10, riskLevel: "low", hasMfa: true },
  { vendorName: "Google Workspace", category: "Productivity", riskScore: 10, riskLevel: "low", hasMfa: true },
  { vendorName: "Gusto", category: "Payroll", riskScore: 20, riskLevel: "low", hasMfa: true },
  { vendorName: "Chase Paymentech", category: "Payments", riskScore: 25, riskLevel: "low", hasMfa: true },
];

const COVENANTS: CovenantItem[] = [
  { name: "Debt/EBITDA < 3.0x", metric: "1.17x", threshold: "3.0x", currentValue: "1.17x", status: "compliant" },
  { name: "Minimum Cash $50K", metric: "$185K", threshold: "$50K", currentValue: "$185K", status: "compliant" },
  { name: "Current Ratio > 1.5", metric: "1.68", threshold: "1.5", currentValue: "1.68", status: "compliant" },
  { name: "Minimum EBITDA $750K", metric: "$1.1M", threshold: "$750K", currentValue: "$1.1M", status: "compliant" },
  { name: "Leverage < 2.5x", metric: "1.17x", threshold: "2.5x", currentValue: "1.17x", status: "compliant" },
];

const RANSOMWARE_READINESS = {
  score: 65,
  backupFrequencyHours: 24,
  hasOfflineBackups: false,
  recoveryTimeHours: 48,
  lastRestoreTestDate: "2026-04-15",
  hasEndpointIsolation: true,
  status: "Needs Improvement" as const,
  gaps: ["No offline backups", "Recovery time > 24h", "Restore test > 3 months ago"],
};

const CREDIT_SCORES = {
  business: [
    { bureau: "Experian", score: 72, range: "Fair", trend: "stable" as const },
    { bureau: "Equifax", score: 68, range: "Fair", trend: "down" as const },
    { bureau: "Dun & Bradstreet", score: 75, range: "Good", trend: "up" as const },
  ],
  personal: [
    { bureau: "Personal (owner)", score: 720, range: "Good", trend: "stable" as const },
  ],
};

const CYBER_INSURANCE_READINESS = {
  overallScore: 58,
  mfaImplemented: true,
  backupsConfigured: true,
  endpointProtection: true,
  employeeTraining: false,
  patchManagement: false,
  incidentResponsePlan: false,
  estimatedPremiumRange: "$12K-$18K/yr",
  recommendations: [
    "Conduct quarterly employee security training",
    "Implement automated patch management",
    "Create and test an incident response plan",
  ],
};

const BANK_FRAUD_ALERTS = [
  { type: "Unusual ACH Transfer", amount: 85000, date: "2026-07-28", risk: "critical" as const, detail: "ACH to new account ending 8892" },
  { type: "Duplicate Payment", amount: 4250, date: "2026-07-25", risk: "high" as const, detail: "Invoice #4421 duplicate of #4398" },
  { type: "New Vendor Payment", amount: 12000, date: "2026-07-24", risk: "high" as const, detail: "PremierHVAC Parts LLC — verify registration" },
];

const EMAIL_SECURITY = {
  dmarcEnabled: true,
  spfEnabled: true,
  dkimEnabled: true,
  phishingSimulationClickRate: 14,
  spoofAttemptsLast30d: 8,
  blockedThreatsLast30d: 145,
  impersonationAttempts: 3,
  score: 60,
};

const PERMISSION_AUDIT = [
  { name: "Admin Users", count: 4, sensitive: true, lastReview: "2026-01-15" },
  { name: "Payroll Access", count: 2, sensitive: true, lastReview: "2026-03-01" },
  { name: "Banking Access", count: 3, sensitive: true, lastReview: "2025-11-10" },
  { name: "Accounting Access", count: 5, sensitive: true, lastReview: "2026-02-20" },
  { name: "ServiceTitan Admin", count: 6, sensitive: true, lastReview: "2025-12-05" },
  { name: "Unused Accounts (>90d)", count: 3, sensitive: false, lastReview: null },
];

function CollapsibleSection({ title, sub, defaultOpen = false, children }: { title: string; sub?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface-950/60 shadow-xl shadow-black/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {sub && <p className="mt-0.5 text-xs text-surface-400">{sub}</p>}
        </div>
        <svg className={`w-5 h-5 text-surface-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

export default function InstitutionalRiskPage() {
  const { user } = useAuth();
  const COMPANY_ID = user?.companyId || "companyA";
  const [scrolled, setScrolled] = useState(false);
  const [dashboard, setDashboard] = useState<ExecutiveRiskDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const d = await fetchJson(`/api/institutional/executive-risk-dashboard/${COMPANY_ID}`, DASHBOARD_DEFAULTS);
      setDashboard(d);
      setLoading(false);
    })();
  }, []);

  const d = dashboard;
  const f = d?.financial;
  const r = d?.risk;
  const o = d?.operational;
  const g = d?.growth;

  const sevColor = (severity: string) => {
    if (severity === "critical") return "text-red-300 bg-red-400/10 border-red-400/20";
    if (severity === "high") return "text-orange-300 bg-orange-400/10 border-orange-400/20";
    if (severity === "medium") return "text-amber-300 bg-amber-400/10 border-amber-400/20";
    return "text-surface-300 bg-surface-800 border-surface-700";
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={`text-sm font-medium transition-colors ${link.href === "/analytics/institutional-risk" ? "text-white" : "text-surface-300 hover:text-white"}`}>{link.label}</Link>
            ))}          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-3">Institutional Risk Dashboard</h1>
            <p className="max-w-3xl text-base text-surface-300">
              One-screen executive view combining Financial Intelligence, Operational Health, Risk Posture, Growth Capacity, and Institutional Cybersecurity. Built for owners, CFOs, and private equity operating partners.
            </p>
          </div>

          {loading ? <LoadingSkeleton count={6} /> : d && (
<InstitutionalNav currentHref="/analytics/institutional-risk" linkClassName="text-sm font-medium text-surface-300 hover:text-white transition-colors" />
            <div className="space-y-8">
              {/* ═══════════════════════════════════════════════════════════
                  PHASE 1 — FINANCIAL & OPERATIONAL INTELLIGENCE
                 ═══════════════════════════════════════════════════════════ */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-400" />
                  Phase 1 — Financial & Operational Intelligence
                </h2>

                {/* ROW 1: Financial Health Summary */}
                <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                  <S title="Revenue">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-300">{fmt(f!.revenue)}</p>
                      <p className="text-xs text-surface-400 mt-1">Monthly</p>
                    </div>
                  </S>
                  <S title="EBITDA">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{fmt(f!.ebitda)}</p>
                      <p className="text-xs text-surface-400 mt-1">Trailing 12 months</p>
                    </div>
                  </S>
                  <S title="Cash on Hand">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-300">{fmt(f!.cash)}</p>
                      <p className="text-xs text-surface-400 mt-1">{r?.cashRunway.toFixed(1)} months runway</p>
                    </div>
                  </S>
                  <S title="Gross Margin">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-300">{pct(f!.grossMarginPct)}</p>
                      <p className="text-xs text-surface-400 mt-1">vs 45% benchmark</p>
                    </div>
                  </S>
                </div>

                {/* ROW 2: Debt Intelligence */}
                <div className="grid gap-6 mb-6 lg:grid-cols-3">
                  <S title="Debt Dashboard" sub={`${fmt(f!.debt.totalDebt)} total across ${f!.debt.items.length} facilities`}>
                    <div className="space-y-3">
                      <Bar label="Monthly Payments" value={f!.debt.monthlyDebtPayments} max={f!.debt.totalDebt / 12} color="bg-red-500" ffn={fmt} />
                      <Bar label="Interest Expense" value={f!.debt.annualInterestExpense} max={f!.debt.totalDebt * 0.15} color="bg-amber-500" ffn={fmt} />
                      <Bar label="Weighted Avg Rate" value={f!.debt.weightedAvgRate} max={20} color="bg-rose-500" ffn={(v) => v.toFixed(1) + "%"} />
                      <Bar label="Variable Rate Exposure" value={f!.debt.variableRatePortion} max={f!.debt.totalDebt} color="bg-orange-500" ffn={fmt} />
                      <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                        <span className="text-surface-400">Personal Guarantees</span>
                        <span className="font-semibold text-red-300">{fmt(f!.debt.personalGuaranteeExposure)}</span>
                      </div>
                      {f!.debt.maturitySchedule.length > 0 && (
                        <div className="mt-3 border-t border-white/5 pt-3">
                          <p className="text-xs font-semibold text-surface-400 mb-2">Maturity Timeline</p>
                          <div className="flex gap-2">
                            {f!.debt.maturitySchedule.map((m) => (
                              <div key={m.year} className="flex-1 rounded-lg border border-white/10 bg-surface-900/50 p-2 text-center">
                                <p className="text-xs text-surface-400">{m.year}</p>
                                <p className="text-sm font-bold text-white">{fmt(m.amount)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {f!.debt.items.map((item, i) => (
                          <div key={i} className="rounded-lg border border-white/5 bg-surface-900/40 px-2.5 py-1.5 text-xs flex-1 min-w-[100px]">
                            <p className="font-medium text-white truncate">{item.name}</p>
                            <p className="text-surface-400">{item.interestRate}% · {fmt(item.principal)}</p>
                            <p className="text-surface-500 truncate">{item.lender}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </S>

                  <S title="Debt Health" sub={`Score: ${f!.debtHealth.score}/100 — ${f!.debtHealth.rating}`}>
                    <div className="flex flex-col items-center gap-4">
                      <Gauge score={f!.debtHealth.score} size={130} />
                      <div className="w-full space-y-2">
                        <Bar label="Debt/EBITDA" value={f!.debtToEbitda.ratio} max={6} color="bg-brand-400" ffn={(v) => v.toFixed(2) + "x"} />
                        <Bar label="Interest Coverage" value={Math.min(f!.interestCoverage.coverageRatio, 10)} max={10} color="bg-emerald-500" ffn={(v) => v.toFixed(1) + "x"} />
                      </div>
                      <p className="text-xs text-surface-400 text-center">{f!.debtToEbitda.assessment}</p>
                      <div className="w-full border-t border-white/5 pt-3 space-y-1.5">
                        {Object.entries(f!.debtHealth.factors).filter(([_, v]) => v > 0).slice(0, 5).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-surface-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-surface-200">{v}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </S>

                  <div className="space-y-4">
                    <S title="Enterprise Value Impact">
                      <div className="text-center">
                        <p className="text-sm text-surface-400 mb-2">High-interest debt reduces your company value by</p>
                        <p className="text-3xl font-bold text-red-300">{fmt(f!.enterpriseValueImpact.evImpact)}</p>
                        <p className="mt-3 text-xs text-surface-300 leading-relaxed">{f!.enterpriseValueImpact.narrative}</p>
                      </div>
                    </S>
                    <S title="Refinance Opportunities" sub={`${fmt(f!.refinanceOpportunities.totalSavings)}/yr potential savings`}>
                      {f!.refinanceOpportunities.opportunities.map((o, i) => (
                        <div key={i} className="mb-2 rounded-xl border border-white/10 bg-surface-900/50 p-3">
                          <p className="text-xs font-medium text-white">{o.type}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-surface-400">{o.currentRate}% → {o.estimatedNewRate}%</span>
                            <span className="text-xs font-semibold text-emerald-300">Save {fmt(o.annualSavings)}/yr</span>
                          </div>
                        </div>
                      ))}
                      {f!.refinanceOpportunities.opportunities.length === 0 && (
                        <p className="text-xs text-surface-500 text-center">No actionable opportunities</p>
                      )}
                    </S>
                  </div>
                </div>

                {/* ROW 3: Cash Flow Waterfall */}
                {f!.cashFlowWaterfall.flowItems.length > 0 && (
                  <S title="Cash Flow Waterfall" sub="Every dollar, from revenue to free cash flow">
                    <div className="space-y-1">
                      {f!.cashFlowWaterfall.flowItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-28 text-xs text-surface-300 text-right">{item.label}</span>
                          <div className="flex-1 h-5 rounded bg-surface-800 overflow-hidden">
                            <div className="h-full rounded transition-all" style={{ width: Math.abs(item.pct) + "%", backgroundColor: item.color }} />
                          </div>
                          <span className={`w-20 text-xs font-semibold text-right ${item.amount >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                            {item.amount >= 0 ? "" : "-"}{fmt(Math.abs(item.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </S>
                )}

                {/* ROW 4: Operational + Risk Summary + Growth */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <S title="Operational Health">
                    <div className="space-y-3">
                      <Bar label="Technician Utilization" value={o!.technicianUtilization} max={100} color="bg-brand-400" ffn={(v) => v + "%"} />
                      <Bar label="Booking Rate" value={o!.bookingRate} max={100} color="bg-emerald-500" ffn={(v) => v + "%"} />
                      <Bar label="Membership Renewal" value={o!.membershipRenewalRate} max={100} color="bg-amber-500" ffn={(v) => v + "%"} />
                      <Bar label="Install Close Rate" value={o!.installCloseRate} max={100} color="bg-purple-500" ffn={(v) => v + "%"} />
                      <div className="border-t border-white/5 pt-3 mt-3 text-center">
                        <span className="text-xs text-surface-400">Maintenance Revenue</span>
                        <p className="text-lg font-bold text-white">{fmt(o!.maintenanceRevenue)}</p>
                      </div>
                    </div>
                  </S>

                  <S title="Risk Posture">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Gauge score={r!.cyberHealth.score} size={80} />
                        <div>
                          <p className="text-sm font-semibold text-white">Cyber Health: {r!.cyberHealth.rating}</p>
                          <p className="text-xs text-surface-400">{r!.fraudAlerts} fraud alerts • {r!.darkWebAlerts} dark web leaks</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Covenant Status</span>
                        <StatusBadge status={r!.covenantStatus} good="compliant" warn="watch" bad="at risk" />
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Covenants at Risk</span>
                        <span className={`text-sm font-bold ${r!.covenantAtRisk > 0 ? "text-red-300" : "text-emerald-300"}`}>{r!.covenantAtRisk}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Cash Runway</span>
                        <span className={`text-sm font-bold ${r!.cashRunway < 3 ? "text-red-300" : "text-emerald-300"}`}>{r!.cashRunway.toFixed(1)} months</span>
                      </div>
                    </div>
                  </S>

                  <S title="Growth Capacity">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Acquisition Readiness</span>
                        <span className="text-xs font-semibold text-amber-300">{g!.acquisitionReadiness}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Locations</span>
                        <span className="text-sm font-bold text-white">{g!.multiLocationCount}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Customer LTV</span>
                        <span className="text-sm font-bold text-white">{fmt(g!.customerLifetimeValue)}</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 flex items-center justify-between">
                        <span className="text-xs text-surface-300">Marketing ROI</span>
                        <span className="text-sm font-bold text-white">{g!.marketingROI.toFixed(1)}x</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3">
                        <p className="text-xs text-surface-400">Expansion capacity</p>
                        <p className="text-sm text-surface-200 mt-1">{g!.expansionCapacity}</p>
                      </div>
                    </div>
                  </S>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  PHASE 2 — INSTITUTIONAL CYBERSECURITY & FRAUD PROTECTION
                 ═══════════════════════════════════════════════════════════ */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Phase 2 — Institutional Cybersecurity & Fraud Protection
                </h2>

                {/* Cyber Health Overview */}
                <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
                  <S title="Cyber Health">
                    <div className="flex flex-col items-center">
                      <Gauge score={65} size={110} />
                      <p className="text-sm text-surface-400 mt-2">65/100 — Good</p>
                    </div>
                  </S>
                  <S title="Ransomware Readiness">
                    <div className="flex flex-col items-center">
                      <Gauge score={RANSOMWARE_READINESS.score} size={110} />
                      <p className="text-sm text-amber-300 mt-2">{RANSOMWARE_READINESS.status}</p>
                      <p className="text-xs text-surface-400 mt-1">24h backups · 48h recovery</p>
                    </div>
                  </S>
                  <S title="Email Security">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-surface-200">{EMAIL_SECURITY.score}/100</p>
                      <p className="text-xs text-surface-400 mt-1">DMARC ✓ SPF ✓ DKIM ✓</p>
                      <p className="text-xs text-surface-400 mt-1">{EMAIL_SECURITY.blockedThreatsLast30d} threats blocked (30d)</p>
                    </div>
                  </S>
                  <S title="Cyber Insurance Readiness">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-300">{CYBER_INSURANCE_READINESS.overallScore}/100</p>
                      <p className="text-xs text-surface-400 mt-1">Est. premium: {CYBER_INSURANCE_READINESS.estimatedPremiumRange}</p>
                    </div>
                  </S>
                </div>

                {/* Dark Web Monitoring */}
                <CollapsibleSection title="Dark Web Monitoring" sub={`${CYBER_DARK_WEB.length} active alerts`} defaultOpen={true}>
                  <div className="space-y-3">
                    {CYBER_DARK_WEB.map((a) => (
                      <div key={a.id} className={`rounded-xl border p-3 ${sevColor(a.severity)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium capitalize">{a.type.replace(/_/g, ' ')}</span>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sevColor(a.severity)}`}>{a.severity}</span>
                        </div>
                        <p className="text-xs text-surface-200">{a.email} — {a.source}</p>
                        <p className="text-xs text-surface-400 mt-1">Found: {a.foundAt}</p>
                        <p className="text-xs text-surface-300 mt-1.5">Action: {a.action}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Login Anomalies */}
                <CollapsibleSection title="Login Monitoring & Impossible Travel" sub={`${CYBER_LOGIN_ANOMALIES.length} anomalies detected`}>
                  <div className="space-y-2">
                    {CYBER_LOGIN_ANOMALIES.map((a) => (
                      <div key={a.id} className={`rounded-xl border p-3 ${sevColor(a.severity)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{a.user}</span>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sevColor(a.severity)}`}>{a.severity}</span>
                          </div>
                        </div>
                        <p className="text-xs text-surface-300 mt-1">{a.location} · {new Date(a.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-surface-400 capitalize">{a.type.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Fraud Signals */}
                <CollapsibleSection title="AI Fraud Detection" sub={`${CYBER_FRAUD_SIGNALS.length} active fraud signals`} defaultOpen={true}>
                  <div className="space-y-3">
                    {CYBER_FRAUD_SIGNALS.map((s) => (
                      <div key={s.id} className={`rounded-xl border p-3 ${sevColor(s.severity)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium capitalize">{s.type.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{fmt(s.amount)}</span>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${sevColor(s.severity)}`}>{s.severity}</span>
                          </div>
                        </div>
                        <p className="text-xs text-surface-200">{s.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.status === "open" ? "text-red-300 bg-red-400/10" : "text-amber-300 bg-amber-400/10"}`}>{s.status}</span>
                          <span className="text-xs text-surface-400">{s.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Bank Fraud Detection */}
                <CollapsibleSection title="Bank Fraud Detection" sub={`${BANK_FRAUD_ALERTS.length} alerts requiring attention`}>
                  <div className="space-y-3">
                    {BANK_FRAUD_ALERTS.map((a, i) => (
                      <div key={i} className={`rounded-xl border p-3 ${sevColor(a.risk)}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-white">{a.type}</span>
                          <span className="text-xs font-semibold">{fmt(a.amount)}</span>
                        </div>
                        <p className="text-xs text-surface-300">{a.detail}</p>
                        <p className="text-xs text-surface-500 mt-1">{a.date}</p>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Vendor Risk */}
                <CollapsibleSection title="Vendor Risk Assessment" sub={`${CYBER_VENDORS.length} monitored vendors`}>
                  <div className="space-y-2">
                    {CYBER_VENDORS.map((v, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white min-w-[140px]">{v.vendorName}</span>
                          <span className="text-[10px] text-surface-400">{v.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${v.riskLevel === "low" ? "text-emerald-300 bg-emerald-400/10" : "text-amber-300 bg-amber-400/10"}`}>{v.riskScore} — {v.riskLevel}</span>
                          <span className={`text-[10px] ${v.hasMfa ? "text-emerald-300" : "text-red-300"}`}>MFA {v.hasMfa ? "✓" : "✗"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Covenant Monitoring */}
                <CollapsibleSection title="Covenant Monitoring" sub="5 active covenants tracked">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-surface-400">
                          <th className="text-left py-2 pr-4">Covenant</th>
                          <th className="text-left py-2 px-4">Metric</th>
                          <th className="text-left py-2 px-4">Threshold</th>
                          <th className="text-left py-2 px-4">Current</th>
                          <th className="text-right py-2 pl-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COVENANTS.map((c, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="py-2 pr-4 text-white">{c.name}</td>
                            <td className="py-2 px-4 text-surface-300">{c.metric}</td>
                            <td className="py-2 px-4 text-surface-400">{c.threshold}</td>
                            <td className="py-2 px-4 text-surface-300">{c.currentValue}</td>
                            <td className="py-2 pl-4 text-right">
                              <StatusBadge status={c.status} good="compliant" warn="watch" bad="at risk" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>

                {/* Credit Score */}
                <CollapsibleSection title="Credit Score Monitoring" sub="Business & personal credit tracking">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-surface-300 mb-2">Business Credit</p>
                      <div className="space-y-2">
                        {CREDIT_SCORES.business.map((s, i) => (
                          <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                            <span className="text-xs font-medium text-white">{s.bureau}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-surface-200">{s.score}</span>
                              <span className="text-[10px] text-surface-400">{s.range}</span>
                              <span className={`text-[10px] ${s.trend === "up" ? "text-emerald-300" : s.trend === "down" ? "text-red-300" : "text-amber-300"}`}>
                                {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-300 mb-2">Personal Credit (owner)</p>
                      {CREDIT_SCORES.personal.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                          <span className="text-xs font-medium text-white">{s.bureau}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-surface-200">{s.score}</span>
                            <span className="text-[10px] text-surface-400">{s.range}</span>
                            <span className="text-[10px] text-amber-300">→</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Permission Management */}
                <CollapsibleSection title="Permission Management" sub="Review who has access to sensitive systems">
                  <div className="space-y-2">
                    {PERMISSION_AUDIT.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-white">{p.name}</span>
                          {p.sensitive && <span className="text-[10px] text-red-300">🔒 Sensitive</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-surface-300">{p.count} users</span>
                          <span className={`text-[10px] ${p.lastReview ? "text-surface-400" : "text-red-300"}`}>
                            {p.lastReview ? `Reviewed ${p.lastReview}` : "Never reviewed"}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                      <p className="text-xs text-amber-300 font-medium">⚠ 3 unused admin accounts found — review and deactivate</p>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Ransomware Readiness Details */}
                <CollapsibleSection title="Ransomware Readiness — Detailed" sub={`${RANSOMWARE_READINESS.gaps.length} gaps identified`}>
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 text-center">
                        <p className="text-xs text-surface-400">Backup Frequency</p>
                        <p className="text-lg font-bold text-white">Every {RANSOMWARE_READINESS.backupFrequencyHours}h</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 text-center">
                        <p className="text-xs text-surface-400">Offline Backups</p>
                        <p className={`text-lg font-bold ${RANSOMWARE_READINESS.hasOfflineBackups ? "text-emerald-300" : "text-red-300"}`}>{RANSOMWARE_READINESS.hasOfflineBackups ? "Yes" : "No"}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3 text-center">
                        <p className="text-xs text-surface-400">Recovery Time</p>
                        <p className="text-lg font-bold text-white">{RANSOMWARE_READINESS.recoveryTimeHours}h</p>
                      </div>
                    </div>
                    {RANSOMWARE_READINESS.gaps.length > 0 && (
                      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3">
                        <p className="text-xs font-semibold text-red-300 mb-1">Gaps to address:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {RANSOMWARE_READINESS.gaps.map((g, i) => (
                            <li key={i} className="text-xs text-surface-300">{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Cyber Insurance Readiness */}
                <CollapsibleSection title="Cyber Insurance Readiness" sub={`Score: ${CYBER_INSURANCE_READINESS.overallScore}/100`}>
                  <div className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { label: "MFA Enabled", ok: CYBER_INSURANCE_READINESS.mfaImplemented },
                        { label: "Backups Configured", ok: CYBER_INSURANCE_READINESS.backupsConfigured },
                        { label: "Endpoint Protection", ok: CYBER_INSURANCE_READINESS.endpointProtection },
                        { label: "Employee Training", ok: CYBER_INSURANCE_READINESS.employeeTraining },
                        { label: "Patch Management", ok: CYBER_INSURANCE_READINESS.patchManagement },
                        { label: "Incident Response Plan", ok: CYBER_INSURANCE_READINESS.incidentResponsePlan },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                          <span className="text-xs text-surface-300">{item.label}</span>
                          <span className={`text-xs font-semibold ${item.ok ? "text-emerald-300" : "text-red-300"}`}>{item.ok ? "✓" : "✗"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                      <p className="text-xs font-semibold text-amber-300 mb-1">Recommendations for better coverage:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {CYBER_INSURANCE_READINESS.recommendations.map((r, i) => (
                          <li key={i} className="text-xs text-surface-300">{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
          <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">Landing</Link>
        </div>
      </footer>
    </div>
  );
}
