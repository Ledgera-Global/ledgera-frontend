"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Analytics", href: "/analytics" },
  { label: "Executive", href: "/analytics/executive" },
  { label: "Acquisition", href: "/analytics/acquisition" },
  { label: "Engines", href: "/analytics/engines" },
];

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function pct(v: number) { return v.toFixed(1) + "%"; }

// SVG circular gauge
function Gauge({ score, size = 130 }: { score: number; size?: number }) {
  const s = 10, r = (size - s) / 2, c = 2 * Math.PI * r, f = (score / 100) * c;
  const color = score < 25 ? "#22c55e" : score < 50 ? "#eab308" : "#ef4444";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={s}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={s} strokeDasharray={`${f} ${c-f}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="28" fontWeight="700">{score}</text>
      <text x="50%" y="65%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="11">/ 100</text>
    </svg>
  );
}

// Inline horizontal bar
function Bar({ label, value, max, color = "bg-brand-400", ffn = (v: number) => String(v) }: { label: string; value: number; max: number; color?: string; ffn?: (v: number) => string }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-surface-300">{label}</span>
        <span className="text-white font-semibold">{ffn(value)}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-surface-800">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: w + "%" }} />
      </div>
    </div>
  );
}

function S({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {sub && <p className="mt-1 text-sm text-surface-400">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── API data shapes ──────────────────────────────────────────────────────

type LeakageScoreData = { score: number; signal: string; totalLeakage: number; breakdown: { uncollectedRevenue: number; underpricedServices: number; laborInefficiency: number } };
type CashFlowData = { cashIn: number; cashOut: number; realCashFlow: number };
type MarginInsightsData = Record<string, { revenue: number; profit: number; margin: number }>;
type TechEfficiencyData = { windowDays: number; technicians: Array<{ technicianId: string; technicianName: string; jobsCount: number; revenue: number; profit: number; marginPct: number; revenuePerJob: number; profitPerJob: number; avgJobDurationHours: number; efficiencyScore: number }> };
type ArAgingData = { buckets: Array<{ bucket: string; total: number; count: number }>; totalOutstanding: number; atRiskAmount: number };
type EbitdaForecastData = { currentEbitda: number; forecastedEbitda: number; growthPct: number; message: string };

// ─── Demo data matching actual API shapes ───────────────────────────────
const DLEAK: LeakageScoreData = { score: 33, signal: "HIGH", totalLeakage: 25000, breakdown: { uncollectedRevenue: 14000, underpricedServices: 6000, laborInefficiency: 5000 } };
const DCF: CashFlowData = { cashIn: 120000, cashOut: 132000, realCashFlow: -12000 };
const DMARG: MarginInsightsData = { "Install": { revenue: 85000, profit: 29750, margin: 0.35 }, "Repair": { revenue: 42000, profit: 12600, margin: 0.30 }, "Maintenance": { revenue: 18000, profit: 7200, margin: 0.40 } };
const DTECH: TechEfficiencyData = { windowDays: 30, technicians: [
  { technicianId: "tech-4", technicianName: "Tech #4", jobsCount: 9, revenue: 62000, profit: 18500, marginPct: 29.84, revenuePerJob: 6888.89, profitPerJob: 2055.56, avgJobDurationHours: 4.7, efficiencyScore: 72 },
  { technicianId: "tech-2", technicianName: "Tech #2", jobsCount: 10, revenue: 56000, profit: 13200, marginPct: 23.57, revenuePerJob: 5600, profitPerJob: 1320, avgJobDurationHours: 4.1, efficiencyScore: 61.5 },
  { technicianId: "tech-1", technicianName: "Tech #1", jobsCount: 8, revenue: 49000, profit: 12100, marginPct: 24.69, revenuePerJob: 6125, profitPerJob: 1512.5, avgJobDurationHours: 5.3, efficiencyScore: 58.8 },
]};
const DAR: ArAgingData = { buckets: [{ bucket: "0-30 days", total: 45000, count: 28 }, { bucket: "31-60 days", total: 22000, count: 12 }, { bucket: "61-90 days", total: 11000, count: 5 }], totalOutstanding: 78000, atRiskAmount: 19000 };
const DEBITDA: EbitdaForecastData = { currentEbitda: 185000, forecastedEbitda: 242000, growthPct: 30.8, message: "EBITDA projected to grow 30.8% with current recovery initiatives." };

async function fd<T>(url: string, d: T): Promise<T> {
  try { const r = await fetch(url, { cache: "no-store" }); if (r.ok) return await r.json() as T; } catch {}
  return d;
}

export default function AnalyticsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [leak, setLeak] = useState<LeakageScoreData | null>(null);
  const [cf, setCf] = useState<CashFlowData | null>(null);
  const [margin, setMargin] = useState<MarginInsightsData | null>(null);
  const [tech, setTech] = useState<TechEfficiencyData | null>(null);
  const [ar, setAr] = useState<ArAgingData | null>(null);
  const [eb, setEb] = useState<EbitdaForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const cid = "companyA";
      const [l,c,m,t,a,e] = await Promise.all([
        fd<LeakageScoreData>("/api/leakage-score/" + cid, DLEAK),
        fd<CashFlowData>("/api/cash-flow/" + cid, DCF),
        fd<MarginInsightsData>("/api/margin-insights/" + cid, DMARG),
        fd<TechEfficiencyData>("/api/technician-efficiency/" + cid, DTECH),
        fd<ArAgingData>("/api/ar-aging/" + cid, DAR),
        fd<EbitdaForecastData>("/api/ebitda-forecast/" + cid, DEBITDA),
      ]);
      setLeak(l); setCf(c); setMargin(m); setTech(t); setAr(a); setEb(e);
      setLoading(false);
    })();
  }, []);

  // Derived
  const marginServices = margin ? Object.entries(margin).map(([name, v]) => ({ name, ...v })) : [];
  const maxMarginRev = marginServices.reduce((s, x) => Math.max(s, x.revenue), 1);
  const maxAr = ar?.buckets ? Math.max(...ar.buckets.map(b => b.total)) : 1;
  const maxEff = tech?.technicians ? Math.max(...tech.technicians.map(t => t.efficiencyScore)) : 1;
  const techs = tech?.technicians ?? [];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`text-sm font-medium transition-colors ${link.href === "/analytics" ? "text-white" : "text-surface-300 hover:text-white"}`}>{link.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-3">Analytics Dashboard</h1>
            <p className="max-w-2xl text-base text-surface-300">Visual breakdown of all engine outputs — leakage, cash, margins, efficiency, AR, and valuation.</p>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 animate-pulse">
                  <div className="h-4 w-1/2 rounded bg-surface-800 mb-4" />
                  <div className="h-24 rounded bg-surface-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* 1. Leakage Score */}
              {leak && (
                <S title="Leakage Score" sub={`Signal: ${leak.signal} — ${fmt(leak.totalLeakage)} total`}>
                  <div className="flex flex-col items-center gap-4">
                    <Gauge score={leak.score} />
                    <div className="w-full space-y-2">
                      <Bar label="Uncollected" value={leak.breakdown.uncollectedRevenue} max={leak.totalLeakage} color="bg-red-500" ffn={fmt} />
                      <Bar label="Underpriced" value={leak.breakdown.underpricedServices} max={leak.totalLeakage} color="bg-amber-500" ffn={fmt} />
                      <Bar label="Labor Inefficiency" value={leak.breakdown.laborInefficiency} max={leak.totalLeakage} color="bg-orange-500" ffn={fmt} />
                    </div>
                  </div>
                </S>
              )}

              {/* 2. Cash Flow */}
              {cf && (
                <S title="Cash Flow" sub={`Net: ${fmt(cf.realCashFlow)}`}>
                  <div className="space-y-4">
                    <Bar label="Cash In" value={cf.cashIn} max={Math.max(cf.cashIn, cf.cashOut)} color="bg-emerald-500" ffn={fmt} />
                    <Bar label="Cash Out" value={cf.cashOut} max={Math.max(cf.cashIn, cf.cashOut)} color="bg-red-500" ffn={fmt} />
                    <div className="mt-4 rounded-2xl border border-white/10 bg-surface-900/50 p-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-surface-400">Real Cash Flow</p>
                      <p className={`mt-1 text-2xl font-bold ${cf.realCashFlow >= 0 ? "text-emerald-300" : "text-red-300"}`}>{fmt(cf.realCashFlow)}</p>
                    </div>
                  </div>
                </S>
              )}

              {/* 3. Margin Insights — vertical bars */}
              {margin && (
                <S title="Margin Insights">
                  <div className="flex items-end justify-around gap-3 h-48">
                    {marginServices.map(s => (
                      <div key={s.name} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-sm font-semibold text-white">{pct(s.margin * 100)}</span>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: (s.revenue / maxMarginRev * 100) + "%", minHeight: 4 }} />
                        <span className="text-xs text-surface-400">{s.name}</span>
                        <span className="text-xs text-surface-300">{fmt(s.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </S>
              )}

              {/* 4. Technician Efficiency */}
              {tech && (
                <S title="Technician Efficiency" sub="Score / revenue per tech">
                  <div className="space-y-4">
                    {techs.map(t => {
                      const name = t.technicianName || t.technicianId;
                      return (
                        <div key={t.technicianId}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-surface-200">{name}</span>
                            <span className="text-white font-semibold">{t.efficiencyScore}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-surface-800">
                            <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: (t.efficiencyScore / maxEff * 100) + "%" }} />
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-surface-500">
                            <span>{fmt(t.revenue)} rev</span>
                            <span>{fmt(t.profit)} profit</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </S>
              )}

              {/* 5. AR Aging */}
              {ar && (
                <S title="AR Aging" sub={`${ar.buckets.reduce((s, b) => s + b.count, 0)} invoices`}>
                  <div className="space-y-3">
                    {ar.buckets.map((b, i) => {
                      const col = b.bucket.startsWith("61") || b.bucket.includes("+") ? "bg-red-500" : b.bucket.startsWith("31") ? "bg-amber-500" : "bg-emerald-500";
                      return <Bar key={i} label={`${b.bucket} (${b.count} invoices)`} value={b.total} max={maxAr} color={col} ffn={fmt} />;
                    })}
                    <div className="mt-3 rounded-2xl border border-white/10 bg-surface-900/50 p-3 text-center">
                      <p className="text-xs text-surface-400">Total Outstanding</p>
                      <p className="text-xl font-bold text-white">{fmt(ar.totalOutstanding)}</p>
                    </div>
                  </div>
                </S>
              )}

              {/* 6. EBITDA & Valuation */}
              {eb && (
                <S title="EBITDA & Valuation" sub={`${eb.growthPct}% projected growth`}>
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-surface-900/50 p-5 text-center">
                      <p className="text-xs uppercase tracking-wider text-surface-400">Current EBITDA</p>
                      <p className="mt-1 text-3xl font-bold text-emerald-300">{fmt(eb.currentEbitda)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-surface-900/50 p-5 text-center">
                      <p className="text-xs uppercase tracking-wider text-surface-400">Forecasted</p>
                      <p className="mt-1 text-3xl font-bold text-white">{fmt(eb.forecastedEbitda)}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                      <p className="text-xs text-amber-200">{'Target: >$1M EBITDA for institutional exit readiness'}</p>
                    </div>
                  </div>
                </S>
              )}
            </div>
          )}

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
            <h3 className="text-xl font-semibold text-white mb-3">All engines running</h3>
            <p className="max-w-3xl text-sm leading-7 text-surface-300">Every chart above is powered by a dedicated backend analysis engine. Data is fetched from the Next.js API proxy layer, which falls back to demo data when the Express backend is unavailable.</p>
          </div>
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
