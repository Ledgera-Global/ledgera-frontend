"use client";
import AppHeader from "@/components/layouts/AppHeader";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";

type Risk = {
  id: string;
  title: string;
  category: string;
  impact: "High" | "Medium" | "Low";
  likelihood: "High" | "Medium" | "Low";
  owner: string;
  status: string;
  reviewDate: string;
};
type ProductArea = {
  id: string;
  area: string;
  adoptionPct: number;
  churnPct: number;
  renewalPct: number;
  timeSavedHrs: number;
  outcomeScore: number;
  trend: "up" | "down" | "flat";
};
type Deal = {
  id: string;
  targetName: string;
  stage: string;
  revenue: number;
  ebitda: number;
  predictedUplift: number;
  actualUplift: number;
  accuracy: number;
  closedDate: string;
};
type ConsoleData = {
  generatedAt: string;
  riskRegister: Risk[];
  productHealth: {
    summary: { outcomeScore: number; adoptionPct: number; churnPct: number; renewalPct: number };
    areas: ProductArea[];
  };
  acquisition: {
    pipeline: { stage: string; count: number }[];
    valueOpportunity: {
      targets: number;
      aggregateRevenue: number;
      aggregateEbitda: number;
      improvementOpportunity: number;
      evOpportunity: number;
    };
    calibration: Deal[];
    predictionAccuracyPct: number;
    learnedSignals: string[];
  };
};

const DEFAULT_CONSOLE: ConsoleData = {
  generatedAt: new Date().toISOString(),
  riskRegister: [
    { id: "risk-1", title: "Major cloud outage", category: "Operational", impact: "High", likelihood: "Low", owner: "CTO", status: "Mitigation in place", reviewDate: "2026-08-15" },
    { id: "risk-2", title: "Data breach (client financial data)", category: "Cybersecurity", impact: "High", likelihood: "Low", owner: "Head of Security", status: "Ongoing monitoring", reviewDate: "2026-08-10" },
    { id: "risk-3", title: "Customer churn spike", category: "Revenue", impact: "High", likelihood: "Medium", owner: "Chief Revenue Officer", status: "Action plan active", reviewDate: "2026-08-01" },
    { id: "risk-4", title: "Regulatory change (data privacy)", category: "Compliance", impact: "Medium", likelihood: "Medium", owner: "General Counsel", status: "Under review", reviewDate: "2026-08-20" },
    { id: "risk-5", title: "AI model drift degrading advice", category: "AI Risk", impact: "Medium", likelihood: "Medium", owner: "CTO / AI Lead", status: "Monitor drift metrics", reviewDate: "2026-08-18" },
    { id: "risk-6", title: "Single integration vendor dependency", category: "Vendor", impact: "Medium", likelihood: "Medium", owner: "CTO", status: "Diversify integrations", reviewDate: "2026-08-22" },
  ],
  productHealth: {
    summary: { outcomeScore: 75.4, adoptionPct: 66.2, churnPct: 5.16, renewalPct: 84.8 },
    areas: [
      { id: "pa-1", area: "Financial Intelligence", adoptionPct: 84, churnPct: 3.2, renewalPct: 91, timeSavedHrs: 41, outcomeScore: 88, trend: "up" },
      { id: "pa-2", area: "Executive Dashboard", adoptionPct: 76, churnPct: 4.1, renewalPct: 89, timeSavedHrs: 28, outcomeScore: 82, trend: "up" },
      { id: "pa-3", area: "AI Copilot", adoptionPct: 61, churnPct: 6.0, renewalPct: 84, timeSavedHrs: 18, outcomeScore: 71, trend: "flat" },
      { id: "pa-4", area: "Integrations", adoptionPct: 72, churnPct: 4.5, renewalPct: 87, timeSavedHrs: 22, outcomeScore: 78, trend: "up" },
      { id: "pa-5", area: "Acquisition Intelligence", adoptionPct: 38, churnPct: 8.0, renewalPct: 73, timeSavedHrs: 12, outcomeScore: 58, trend: "up" },
    ],
  },
  acquisition: {
    pipeline: [
      { stage: "Targets identified", count: 1842 },
      { stage: "Qualified", count: 214 },
      { stage: "Priority", count: 37 },
      { stage: "Management conversations", count: 12 },
      { stage: "Due diligence", count: 4 },
      { stage: "LOIs", count: 2 },
      { stage: "Closed", count: 3 },
    ],
    valueOpportunity: {
      targets: 37,
      aggregateRevenue: 412000000,
      aggregateEbitda: 41300000,
      improvementOpportunity: 12400000,
      evOpportunity: 173000000,
    },
    calibration: [
      { id: "deal-1", targetName: "Southeast HVAC Platform — Branch 3", stage: "Closed", revenue: 18400000, ebitda: 1650000, predictedUplift: 1200000, actualUplift: 900000, accuracy: 75, closedDate: "2026-03-12" },
      { id: "deal-2", targetName: "Gulf Coast Plumbing Roll-up", stage: "Closed", revenue: 9200000, ebitda: 980000, predictedUplift: 620000, actualUplift: 700000, accuracy: 113, closedDate: "2026-01-28" },
      { id: "deal-3", targetName: "Midwest Commercial Refrigeration", stage: "Integrated", revenue: 12400000, ebitda: 1420000, predictedUplift: 880000, actualUplift: 0, accuracy: 0, closedDate: "2026-06-05" },
    ],
    predictionAccuracyPct: 94,
    learnedSignals: [
      "Service-agreement penetration is the strongest predictor of realized EBITDA uplift.",
      "Pricing improvements consistently over-perform vs. labor-efficiency estimates.",
      "Owner-dependent companies with weak financial reporting take 2.3x longer to integrate.",
      "Geographic density (jobs per mile) correlates with faster post-close margin expansion.",
    ],
  },
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}
function pct(v: number) {
  return v.toFixed(1) + "%";
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
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

function LevelBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const color =
    level === "High" ? "text-red-300 border-red-400/20 bg-red-400/10" :
    level === "Medium" ? "text-amber-300 border-amber-400/20 bg-amber-400/10" :
    "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>{level}</span>;
}

function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  const map = {
    up: { t: "↑ Up", c: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" },
    down: { t: "↓ Down", c: "text-red-300 border-red-400/20 bg-red-400/10" },
    flat: { t: "→ Flat", c: "text-surface-300 border-surface-700 bg-surface-800" },
  } as const;
  const m = map[trend];
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.c}`}>{m.t}</span>;
}

export default function LedgeraConsolePage() {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const d = await fetchJson<ConsoleData>("/api/internal/ledgera-console", DEFAULT_CONSOLE);
      setData(d);
      setLoading(false);
    })();
  }, []);

  const d = data;
  const ph = d?.productHealth;
  const acq = d?.acquisition;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface-950 text-surface-100">
        <AppHeader currentHref="/internal/ledgera-console" transparent />
        <div className="pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-white mb-3">Ledgera Operating Console</h1>
              <p className="max-w-3xl text-base text-surface-300">
                The internal institutional view for Ledgera Global — not customer-facing. Risk register, product health by customer outcome, and acquisition intelligence with prediction-vs-actual calibration.
              </p>
            </div>

            {loading ? <LoadingSkeleton count={6} /> : d && (
              <div className="space-y-8">
                {/* RISK REGISTER */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Enterprise Risk Register
                  </h2>
                  <Card title="Owned risks" sub={`${d.riskRegister.length} risks · exec-owned · reviewed on a cadence`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-surface-400">
                            <th className="text-left py-2 pr-4">Risk</th>
                            <th className="text-left py-2 px-4">Category</th>
                            <th className="text-left py-2 px-4">Impact</th>
                            <th className="text-left py-2 px-4">Likelihood</th>
                            <th className="text-left py-2 px-4">Owner</th>
                            <th className="text-left py-2 px-4">Status</th>
                            <th className="text-right py-2 pl-4">Review</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.riskRegister.map((r) => (
                            <tr key={r.id} className="border-b border-white/5">
                              <td className="py-2 pr-4 text-white">{r.title}</td>
                              <td className="py-2 px-4 text-surface-300">{r.category}</td>
                              <td className="py-2 px-4"><LevelBadge level={r.impact} /></td>
                              <td className="py-2 px-4"><LevelBadge level={r.likelihood} /></td>
                              <td className="py-2 px-4 text-surface-300">{r.owner}</td>
                              <td className="py-2 px-4 text-surface-300">{r.status}</td>
                              <td className="py-2 pl-4 text-right text-surface-400">{r.reviewDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* PRODUCT HEALTH */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-400" />
                    Product Health <span className="text-xs font-normal text-surface-400">(measured by customer outcomes, not features)</span>
                  </h2>
                  <div className="grid gap-6 mb-6 md:grid-cols-4">
                    <Card title="Outcome Score">
                      <p className="text-3xl font-bold text-emerald-300">{ph!.summary.outcomeScore}</p>
                      <p className="text-xs text-surface-400 mt-1">/ 100 composite</p>
                    </Card>
                    <Card title="Adoption">
                      <p className="text-3xl font-bold text-white">{pct(ph!.summary.adoptionPct)}</p>
                      <p className="text-xs text-surface-400 mt-1">Across product areas</p>
                    </Card>
                    <Card title="Churn">
                      <p className="text-3xl font-bold text-red-300">{pct(ph!.summary.churnPct)}</p>
                      <p className="text-xs text-surface-400 mt-1">Weighted avg</p>
                    </Card>
                    <Card title="Renewal">
                      <p className="text-3xl font-bold text-white">{pct(ph!.summary.renewalPct)}</p>
                      <p className="text-xs text-surface-400 mt-1">Weighted avg</p>
                    </Card>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {ph!.areas.map((a) => (
                      <Card key={a.id} title={a.area}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-surface-400">Outcome score</span>
                            <span className="text-lg font-bold text-white">{a.outcomeScore}</span>
                          </div>
                          <Bar label="Adoption" value={a.adoptionPct} max={100} color="bg-brand-400" ffn={(v) => v + "%"} />
                          <Bar label="Churn" value={a.churnPct} max={20} color="bg-red-500" ffn={(v) => v.toFixed(1) + "%"} />
                          <Bar label="Renewal" value={a.renewalPct} max={100} color="bg-emerald-500" ffn={(v) => v + "%"} />
                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-xs text-surface-400">Time saved / customer</span>
                            <span className="text-sm font-semibold text-white">{a.timeSavedHrs} hrs</span>
                          </div>
                          <div className="flex justify-end"><TrendBadge trend={a.trend} /></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* ACQUISITION INTELLIGENCE */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Acquisition Intelligence
                  </h2>

                  <div className="grid gap-6 mb-6 lg:grid-cols-2">
                    <Card title="Pipeline" sub="Internal M&A funnel">
                      <div className="space-y-2">
                        {acq!.pipeline.map((p) => (
                          <div key={p.stage} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/50 px-3 py-2">
                            <span className="text-xs text-surface-300">{p.stage}</span>
                            <span className="text-sm font-bold text-white">{p.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <div className="space-y-4">
                      <Card title="Value Opportunity" sub="Identified priority targets">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3">
                            <p className="text-xs text-surface-400">Targets</p>
                            <p className="text-lg font-bold text-white">{acq!.valueOpportunity.targets}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3">
                            <p className="text-xs text-surface-400">EBITDA</p>
                            <p className="text-lg font-bold text-white">{fmt(acq!.valueOpportunity.aggregateEbitda)}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3">
                            <p className="text-xs text-surface-400">Improvement opp</p>
                            <p className="text-lg font-bold text-emerald-300">{fmt(acq!.valueOpportunity.improvementOpportunity)}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-surface-900/50 p-3">
                            <p className="text-xs text-surface-400">EV opportunity</p>
                            <p className="text-lg font-bold text-cyan-300">{fmt(acq!.valueOpportunity.evOpportunity)}</p>
                          </div>
                        </div>
                      </Card>
                      <Card title="Prediction Accuracy" sub="Predicted vs actual EBITDA uplift">
                        <p className="text-3xl font-bold text-emerald-300">{acq!.predictionAccuracyPct}%</p>
                        <p className="text-xs text-surface-400 mt-1">Calibrated over measured deals</p>
                      </Card>
                    </div>
                  </div>

                  <Card title="Calibration Loop" sub="After each deal, compare predicted uplift to realized — this is the institutional memory">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-surface-400">
                            <th className="text-left py-2 pr-4">Target</th>
                            <th className="text-left py-2 px-4">Stage</th>
                            <th className="text-left py-2 px-4">EBITDA</th>
                            <th className="text-left py-2 px-4">Predicted</th>
                            <th className="text-left py-2 px-4">Actual</th>
                            <th className="text-right py-2 pl-4">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acq!.calibration.map((deal) => (
                            <tr key={deal.id} className="border-b border-white/5">
                              <td className="py-2 pr-4 text-white">{deal.targetName}</td>
                              <td className="py-2 px-4 text-surface-400">{deal.stage}</td>
                              <td className="py-2 px-4 text-surface-300">{fmt(deal.ebitda)}</td>
                              <td className="py-2 px-4 text-surface-300">{fmt(deal.predictedUplift)}</td>
                              <td className="py-2 px-4 text-surface-300">{deal.actualUplift > 0 ? fmt(deal.actualUplift) : "—"}</td>
                              <td className="py-2 pl-4 text-right">
                                {deal.accuracy > 0 ? (
                                  <span className={`font-semibold ${Math.abs(deal.accuracy - 100) <= 15 ? "text-emerald-300" : "text-amber-300"}`}>{deal.accuracy}%</span>
                                ) : (
                                  <span className="text-surface-500">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card title="Learned Signals" sub="Institutional memory from own deals">
                    <ul className="list-disc list-inside space-y-1.5">
                      {acq!.learnedSignals.map((s, i) => (
                        <li key={i} className="text-sm text-surface-300">{s}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-white/5 bg-surface-950/70">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
            <span className="text-sm text-surface-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
            <Link href="/internal/ledgera-console" className="text-sm text-surface-400 hover:text-white transition-colors">Internal Console</Link>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
