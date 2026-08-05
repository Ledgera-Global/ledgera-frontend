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

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function fmtCompact(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
  return String(v);
}

function pct(v: number) { return v.toFixed(1) + "%"; }

// Mini gauge for score-based engines (0-100)
function MiniGauge({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const s = 6, r = (size - s) / 2, c = 2 * Math.PI * r, f = Math.min(score, 100) / 100 * c;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : score >= 20 ? "#f97316" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={s} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={s} strokeDasharray={`${f} ${c - f}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="18" fontWeight="700">{Math.round(score)}</text>
      </svg>
      {label && <span className="mt-1 text-[10px] text-surface-400">{label}</span>}
    </div>
  );
}

// Mini bar for comparisons
function MiniBar({ label, value, max, color = "bg-brand-400", ffn = fmt }: { label: string; value: number; max: number; color?: string; ffn?: (v: number) => string }) {
  const w = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-surface-400 truncate">{label}</span>
        <span className="text-white font-semibold">{ffn(value)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-800">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: w + "%" }} />
      </div>
    </div>
  );
}

// Status badge for risk / severity
function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
    MODERATE: "bg-amber-400/10 text-amber-200 border-amber-400/20",
    HIGH: "bg-red-400/10 text-red-200 border-red-400/20",
    CRITICAL: "bg-rose-400/10 text-rose-200 border-rose-400/20",
    CLEAN: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[level] || "bg-surface-800/50 text-surface-400 border-surface-700/30"}`}>
      {level}
    </span>
  );
}

// ─── Engine Definitions ───────────────────────────────────────────────────

type EngineStatus = "production" | "demo_ready" | "active";

type Engine = {
  id: string;
  name: string;
  description: string;
  service: string;
  route: string;
  apiPath: string;
  page: string;
  status: EngineStatus;
  category: "financial" | "operations" | "commercial" | "institutional" | "intelligence";
};

const engines: Engine[] = [
  // FINANCIAL
  { id: "leakage-score", name: "Leakage Score Engine", description: "Uncollected revenue, underpriced services, labor inefficiency → single leakage score (0–100).", service: "leakageScoreEngine.ts", route: "routes/leakage.ts", apiPath: "/api/leakage-score/companyA", page: "/analytics", status: "production", category: "financial" },
  { id: "parts-leakage", name: "Parts Leakage Score Engine", description: "Parts-level margin erosion — high-cost parts, write-offs, vendor pricing gaps.", service: "partsLeakageScoreEngine.ts", route: "routes/leakage.ts", apiPath: "/api/parts-leakage-score/companyA", page: "/analytics", status: "demo_ready", category: "financial" },
  { id: "margin-insights", name: "Margin Insights Engine", description: "Per-service-type margin analysis with revenue, profit, and margin percentage.", service: "marginEngine.ts", route: "routes/analytics.ts", apiPath: "/api/margin-insights/companyA", page: "/analytics", status: "production", category: "financial" },
  { id: "cash-flow", name: "Cash Flow Engine", description: "Real cash flow (in - out) over trailing window with net position.", service: "cashFlowEngine.ts", route: "routes/analytics.ts", apiPath: "/api/cash-flow/companyA", page: "/analytics", status: "production", category: "financial" },
  { id: "profit-alerts", name: "Profit Alert Engine", description: "Typed, severity-ranked alerts with estimated dollar impact.", service: "profitAlertEngine.ts", route: "routes/jobs.ts", apiPath: "/api/profit-alerts/companyA", page: "/dashboard", status: "production", category: "financial" },
  { id: "ebitda-forecast", name: "EBITDA Forecast Engine", description: "Forward EBITDA projection from run-rate and recovery initiatives.", service: "ebitdaForecast.ts", route: "routes/ebitda.ts", apiPath: "/api/ebitda-forecast/companyA", page: "/analytics", status: "production", category: "financial" },
  { id: "ar-risk", name: "AR Risk Engine", description: "Aging-bucket analysis with total outstanding and at-risk amounts.", service: "arRiskEngine.ts", route: "routes/analytics.ts", apiPath: "/api/ar-aging/companyA", page: "/analytics", status: "production", category: "financial" },
  // OPERATIONS
  { id: "technician-efficiency", name: "Technician Efficiency Engine", description: "Per-technician score based on jobs, revenue, profit, margin, and duration.", service: "technicianEfficiencyEngine.ts", route: "routes/jobs.ts", apiPath: "/api/technician-efficiency/companyA", page: "/dashboard", status: "production", category: "operations" },
  { id: "technician-profit", name: "Technician Profit Engine", description: "Profitability breakdown by technician — revenue, profit, margin rank.", service: "technicianProfitEngine.ts", route: "routes/jobs.ts", apiPath: "/api/tech-profit/companyA", page: "/analytics", status: "demo_ready", category: "operations" },
  { id: "service-profit", name: "Service Profit Engine", description: "Revenue, profit, margin, job count grouped by service category.", service: "serviceProfitEngine.ts", route: "routes/jobs.ts", apiPath: "/api/service-profit/companyA", page: "/analytics", status: "demo_ready", category: "operations" },
  { id: "dispatch-inefficiency", name: "Dispatch Inefficiency Engine", description: "Travel time, schedule overlaps, idle gaps that erode margin.", service: "dispatchInefficiencyEngine.ts", route: "routes/jobs.ts", apiPath: "", page: "—", status: "active", category: "operations" },
  { id: "pricing-inconsistency", name: "Pricing Inconsistency Engine", description: "Margin band deviations — underpriced and overpriced service lines.", service: "pricingInconsistencyEngine.ts", route: "routes/jobs.ts", apiPath: "", page: "—", status: "active", category: "operations" },
  // COMMERCIAL
  { id: "call-metrics", name: "Call Metrics Engine", description: "Calls, missed rate, response time, call-to-job conversion.", service: "callMetricsEngine.ts", route: "routes/analytics.ts", apiPath: "/api/call-metrics/companyA", page: "/analytics", status: "demo_ready", category: "commercial" },
  { id: "pricing-engine", name: "Pricing Engine", description: "Optimal price points modeled against market benchmarks and costs.", service: "pricingEngine.ts", route: "routes/analytics.ts", apiPath: "", page: "—", status: "active", category: "commercial" },
  { id: "recovery-automation", name: "Recovery Automation Engine", description: "Collectible AR identification, re-pricing suggestions, priority ranking.", service: "recoveryAutomationEngine.ts", route: "routes/analytics.ts", apiPath: "", page: "—", status: "active", category: "commercial" },
  { id: "recovery-metrics", name: "Recovery Metrics Engine", description: "Dollars recovered, recovery rate, aging of recovered vs. written-off.", service: "recoveryMetricsEngine.ts", route: "routes/analytics.ts", apiPath: "", page: "—", status: "active", category: "commercial" },
  // INSTITUTIONAL
  { id: "acquisition-score", name: "Acquisition Score Engine", description: "M&A readiness score (0-100) with buyer-facing recommendation.", service: "acquisitionScoreEngine.ts", route: "routes/acquisition.ts", apiPath: "/api/acquisition/companyA", page: "/analytics/acquisition", status: "demo_ready", category: "institutional" },
  { id: "diligence-report", name: "Diligence Report Engine", description: "Multi-section due diligence — Financial, Ops, AR, Compliance with risk levels.", service: "diligenceReportEngine.ts", route: "routes/diligence.ts", apiPath: "/api/diligence/companyA", page: "/analytics/acquisition", status: "demo_ready", category: "institutional" },
  { id: "valuation", name: "Valuation Engine", description: "EBITDA-based valuation with multiple analysis and exit readiness.", service: "valuationEngine.ts", route: "routes/executiveDashboard.ts", apiPath: "/api/executive/companyA", page: "/analytics/executive", status: "production", category: "institutional" },
  { id: "ebitda-simulator", name: "EBITDA Lift Simulator", description: "What-if simulator for pricing corrections, efficiency, recovery on EBITDA.", service: "ebitdaLiftSimulator.ts", route: "routes/ebitdaSimulator.ts", apiPath: "", page: "—", status: "active", category: "institutional" },
  // INTELLIGENCE
  { id: "ai-executive-report", name: "AI Executive Report", description: "LLM narrative consolidating margin, tech, AR, EBITDA into executive summary.", service: "aiExecutiveReport.ts", route: "routes/aiExecutiveReport.ts", apiPath: "/api/ai-executive-report/companyA", page: "/analytics/executive", status: "production", category: "intelligence" },
];

const categoryLabels: Record<string, string> = {
  financial: "Financial Analysis",
  operations: "Operations & Labor",
  commercial: "Commercial & Recovery",
  institutional: "Institutional & M&A",
  intelligence: "AI Intelligence",
};

const categoryOrder = ["financial", "operations", "commercial", "institutional", "intelligence"];

const statusStyles: Record<EngineStatus, string> = {
  production: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  demo_ready: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  active: "bg-surface-800/50 text-surface-400 border-surface-700/30",
};

const statusLabels: Record<EngineStatus, string> = {
  production: "Production",
  demo_ready: "Demo Ready",
  active: "Active",
};

// ─── Engine data shapes ──────────────────────────────────────────────────

type LeakageScoreData = { score: number; breakdown?: { uncollectedRevenue?: number; underpricedServices?: number; laborInefficiency?: number }; totalLeakage?: number };
type AcquisitionScoreData = { score: number; recommendation?: string; signals?: string[] };
type PartsLeakageData = { score: number; totalPartsLeakage: number; highRiskParts: number };
type CashFlowData = { cashIn: number; cashOut: number; realCashFlow: number };
type MarginInsightsData = Record<string, { revenue: number; margin: number }>;
type ProfitAlertData = { alerts?: Array<{ severity: string; estimatedLostDollars: number; title: string }> };
type EbitdaForecastData = { currentEbitda: number; forecastedEbitda: number; growthPct: number };
type ArRiskData = { totalOutstanding: number; buckets?: Array<{ bucket: string; total: number }>; atRiskAmount: number };
type TechnicianEfficiencyData = { technicians?: Array<{ technicianId: string; technicianName?: string; efficiencyScore: number }> };
type TechnicianProfitData = Array<{ technicianId: string; technicianName?: string; revenue: number; marginPct: number }>;
type ServiceProfitData = Array<{ serviceType: string; revenue: number; marginPct: number }>;
type CallMetricsData = Array<{ metric: string; value: number }>;
type DiligenceReportData = { summary?: string; sections?: Array<{ title: string; riskLevel: string }> };
type ValuationData = { valuation?: { ebitda?: number; valuation?: number }; forecast?: { ebitda?: number } };
type AiExecutiveReportData = { report?: string };

// ─── Preview renderer per engine ─────────────────────────────────────────

function EnginePreview({ engine, data }: { engine: Engine; data: unknown }) {
  if (!data) return <div className="h-24 animate-pulse rounded-xl bg-surface-800" />;

  switch (engine.id) {
    // ── Score gauges ─────────────────────────────────────────
    case "leakage-score": {
      const d = data as LeakageScoreData;
      return (
        <div className="flex items-center gap-4">
          <MiniGauge score={d.score} size={70} />
          <div className="flex-1 space-y-1">
            <MiniBar label="Uncollected" value={d.breakdown?.uncollectedRevenue || 0} max={d.totalLeakage || 1} color="bg-red-500" />
            <MiniBar label="Underpriced" value={d.breakdown?.underpricedServices || 0} max={d.totalLeakage || 1} color="bg-amber-500" />
            <MiniBar label="Labor" value={d.breakdown?.laborInefficiency || 0} max={d.totalLeakage || 1} color="bg-orange-500" />
          </div>
        </div>
      );
    }

    case "acquisition-score": {
      const d = data as AcquisitionScoreData;
      return (
        <div className="flex items-center justify-center gap-4">
          <MiniGauge score={d.score} size={80} label="Readiness" />
          <div className="flex-1 space-y-2">
            <RiskBadge level={d.score >= 70 ? "LOW" : d.score >= 40 ? "MODERATE" : "HIGH"} />
            <p className="text-[10px] text-surface-400 leading-relaxed line-clamp-2">{d.recommendation}</p>
            <div className="flex gap-1 flex-wrap">
              {d.signals?.slice(0, 2).map((s, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-surface-800/60 px-2 py-0.5 text-[9px] text-surface-300 truncate max-w-[120px]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "parts-leakage": {
      const d = data as PartsLeakageData;
      return (
        <div className="flex items-center gap-4">
          <MiniGauge score={d.score} size={70} label="Parts Score" />
          <div className="flex-1 space-y-1.5">
            <span className="block text-xs text-surface-300">{fmt(d.totalPartsLeakage)} total leakage</span>
            <span className="block text-xs text-surface-400">{d.highRiskParts} high-risk parts</span>
          </div>
        </div>
      );
    }

    // ── Cash flow ────────────────────────────────────────────
    case "cash-flow": {
      const d = data as CashFlowData;
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-surface-900/60 p-2 text-center">
              <p className="text-[10px] text-surface-400">In</p>
              <p className="text-xs font-semibold text-emerald-300">{fmtCompact(d.cashIn)}</p>
            </div>
            <div className="rounded-lg bg-surface-900/60 p-2 text-center">
              <p className="text-[10px] text-surface-400">Out</p>
              <p className="text-xs font-semibold text-red-300">{fmtCompact(d.cashOut)}</p>
            </div>
            <div className="rounded-lg bg-surface-900/60 p-2 text-center">
              <p className="text-[10px] text-surface-400">Net</p>
              <p className={`text-xs font-semibold ${d.realCashFlow >= 0 ? "text-emerald-300" : "text-red-300"}`}>{fmtCompact(d.realCashFlow)}</p>
            </div>
          </div>
          <MiniBar label="Cash In" value={d.cashIn} max={Math.max(d.cashIn, d.cashOut)} color="bg-emerald-500" />
          <MiniBar label="Cash Out" value={d.cashOut} max={Math.max(d.cashIn, d.cashOut)} color="bg-red-500" />
        </div>
      );
    }

    // ── Margin bars ──────────────────────────────────────────
    case "margin-insights": {
      const d = data as MarginInsightsData;
      const entries = Object.entries(d);
      const maxRev = Math.max(...entries.map(([, v]) => v.revenue), 1);
      return (
        <div className="space-y-2">
          {entries.slice(0, 3).map(([name, v]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-surface-300">{name}</span>
                <span className="text-white font-semibold">{pct(v.margin * 100)}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-800">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-400" style={{ width: (v.revenue / maxRev * 100) + "%" }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── Profit alerts ────────────────────────────────────────
    case "profit-alerts": {
      const d = data as ProfitAlertData;
      const severityOrder = ["CRITICAL", "HIGH", "CLEAN"];
      const worst = severityOrder.find(s => d.alerts?.some(a => a.severity === s));
      const totalLost = d.alerts?.reduce((s, a) => s + (a.estimatedLostDollars || 0), 0) || 0;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <RiskBadge level={worst || "CLEAN"} />
            <span className="text-xs text-surface-300">{d.alerts?.length || 0} alerts · {fmt(totalLost)} lost</span>
          </div>
          <div className="space-y-1">
            {d.alerts?.slice(0, 2).map((a, i) => (
              <p key={i} className="text-[10px] text-surface-400 truncate">{a.title}</p>
            ))}
          </div>
        </div>
      );
    }

    // ── EBITDA ───────────────────────────────────────────────
    case "ebitda-forecast": {
      const d = data as EbitdaForecastData;
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-900/60 p-2 text-center">
              <p className="text-[10px] text-surface-400">Current</p>
              <p className="text-sm font-bold text-emerald-300">{fmtCompact(d.currentEbitda)}</p>
            </div>
            <div className="rounded-lg bg-surface-900/60 p-2 text-center">
              <p className="text-[10px] text-surface-400">Forecasted</p>
              <p className="text-sm font-bold text-white">{fmtCompact(d.forecastedEbitda)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-400">Growth</span>
            <span className="font-semibold text-emerald-300">+{d.growthPct}%</span>
          </div>
        </div>
      );
    }

    // ── AR Aging ─────────────────────────────────────────────
    case "ar-risk": {
      const d = data as ArRiskData;
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-300">Outstanding</span>
            <span className="text-sm font-bold text-white">{fmtCompact(d.totalOutstanding)}</span>
          </div>
          <div className="space-y-1">
            {d.buckets?.map((b, i) => {
              const col = b.bucket.startsWith("61") || b.bucket.includes("+") ? "bg-red-500" : b.bucket.startsWith("31") ? "bg-amber-500" : "bg-emerald-500";
              const maxAr = Math.max(...(d.buckets ?? []).map(x => x.total));
              return <MiniBar key={i} label={b.bucket} value={b.total} max={maxAr} color={col} />;
            })}
          </div>
          {d.atRiskAmount > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <RiskBadge level={d.atRiskAmount > 15000 ? "HIGH" : d.atRiskAmount > 5000 ? "MODERATE" : "LOW"} />
              <span className="text-surface-400">{fmt(d.atRiskAmount)} at risk</span>
            </div>
          )}
        </div>
      );
    }

    // ── Technician Efficiency ────────────────────────────────
    case "technician-efficiency": {
      const d = data as TechnicianEfficiencyData;
      const techs = d.technicians || [];
      const maxEff = Math.max(...techs.map(t => t.efficiencyScore), 1);
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-surface-300">{techs.length} technicians</span>
            <span className="text-white font-semibold">Avg {techs.length ? Math.round(techs.reduce((s, t) => s + t.efficiencyScore, 0) / techs.length) : 0}%</span>
          </div>
          {techs.slice(0, 3).map(t => (
            <div key={t.technicianId}>
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-surface-400 truncate max-w-[80px]">{t.technicianName || t.technicianId}</span>
                <span className={`font-semibold ${t.efficiencyScore >= 70 ? "text-emerald-300" : t.efficiencyScore >= 50 ? "text-amber-300" : "text-red-300"}`}>{t.efficiencyScore}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-surface-800">
                <div className="h-1 rounded-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: (t.efficiencyScore / maxEff * 100) + "%" }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── Technician Profit ────────────────────────────────────
    case "technician-profit": {
      const rows = Array.isArray(data) ? data as TechnicianProfitData : [];
      const maxRev = Math.max(...rows.map(r => r.revenue), 1);
      return (
        <div className="space-y-1.5">
          {rows.slice(0, 3).map(r => (
            <div key={r.technicianId}>
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-surface-400 truncate max-w-[80px]">{r.technicianName || r.technicianId}</span>
                <span className="text-white font-semibold">{pct(r.marginPct)}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-surface-800">
                <div className="h-1 rounded-full bg-brand-500" style={{ width: (r.revenue / maxRev * 100) + "%" }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── Service Profit ───────────────────────────────────────
    case "service-profit": {
      const services = Array.isArray(data) ? data as ServiceProfitData : [];
      const maxRev = Math.max(...services.map(s => s.revenue), 1);
      return (
        <div className="space-y-1.5">
          {services.slice(0, 3).map(s => (
            <MiniBar key={s.serviceType} label={s.serviceType} value={s.revenue} max={maxRev} color="bg-brand-400" ffn={(v) => pct(s.marginPct)} />
          ))}
        </div>
      );
    }

    // ── Call Metrics ─────────────────────────────────────────
    case "call-metrics": {
      const metrics = Array.isArray(data) ? data as CallMetricsData : [];
      const conv = metrics.find(m => m.metric === "Call-to-job conversion");
      const missed = metrics.find(m => m.metric === "Missed call rate");
      const total = metrics.find(m => m.metric === "Total calls");
      return (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface-900/60 p-2 text-center">
            <p className="text-[10px] text-surface-400">Calls</p>
            <p className="text-xs font-semibold text-white">{total?.value || "—"}</p>
          </div>
          <div className="rounded-lg bg-surface-900/60 p-2 text-center">
            <p className="text-[10px] text-surface-400">Missed</p>
            <p className="text-xs font-semibold text-red-300">{missed?.value?.toFixed(1) || "—"}%</p>
          </div>
          <div className="rounded-lg bg-surface-900/60 p-2 text-center">
            <p className="text-[10px] text-surface-400">Conv.</p>
            <p className="text-xs font-semibold text-emerald-300">{conv?.value?.toFixed(1) || "—"}%</p>
          </div>
        </div>
      );
    }

    // ── Diligence Report ─────────────────────────────────────
    case "diligence-report": {
      const d = data as DiligenceReportData;
      return (
        <div className="space-y-1.5">
          <p className="text-[10px] text-surface-400 leading-relaxed line-clamp-2">{d.summary}</p>
          <div className="flex flex-wrap gap-1">
            {d.sections?.map(s => (
              <RiskBadge key={s.title} level={s.riskLevel} />
            ))}
          </div>
        </div>
      );
    }

    // ── Valuation ────────────────────────────────────────────
    case "valuation": {
      const d = data as ValuationData;
      const v = d.valuation;
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-900/60 p-2 text-center">
            <p className="text-[10px] text-surface-400">EBITDA</p>
            <p className="text-xs font-bold text-emerald-300">{fmtCompact(v?.ebitda || d.forecast?.ebitda || 185000)}</p>
          </div>
          <div className="rounded-lg bg-surface-900/60 p-2 text-center">
            <p className="text-[10px] text-surface-400">Valuation</p>
            <p className="text-xs font-bold text-white">{fmtCompact(v?.valuation || 925000)}</p>
          </div>
        </div>
      );
    }

    // ── AI Executive Report ──────────────────────────────────
    case "ai-executive-report": {
      const d = data as AiExecutiveReportData;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-300 font-medium">LLM Ready</span>
          </div>
          <p className="text-[10px] text-surface-400 leading-relaxed line-clamp-3">
            {d.report?.split("\n").slice(0, 3).join(" ").replace(/^##\s*/, "") || "Narrative report available"}
          </p>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function EnginesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [liveData, setLiveData] = useState<Record<string, unknown>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    engines.filter(e => e.apiPath).forEach(e => { init[e.id] = true; });
    return init;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch live data for all engines with API paths
  useEffect(() => {
    const apiEngines = engines.filter(e => e.apiPath);
    let cancelled = false;

    apiEngines.forEach(async (engine) => {
      try {
        const res = await fetch(engine.apiPath, { cache: "no-store" });
        if (!cancelled && res.ok) {
          const json = await res.json();
          setLiveData(prev => ({ ...prev, [engine.id]: json }));
          setLoadingMap(prev => ({ ...prev, [engine.id]: false }));
        }
      } catch {
        if (!cancelled) {
          setLiveData(prev => ({ ...prev, [engine.id]: null }));
          setLoadingMap(prev => ({ ...prev, [engine.id]: false }));
        }
      }
    });
    return () => { cancelled = true; };
  }, []);

  const productionCount = engines.filter(e => e.status === "production").length;
  const demoCount = engines.filter(e => e.status === "demo_ready").length;
  const activeCount = engines.filter(e => e.status === "active").length;

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
              <Link key={link.label} href={link.href} className={`text-sm font-medium transition-colors ${link.href === "/analytics/engines" ? "text-white" : "text-surface-300 hover:text-white"}`}>{link.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-semibold text-white">Analysis Engines</h1>
              <span className="rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">{engines.length} engines</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="max-w-2xl text-base text-surface-300">Every engine is fetching live data from your connected integrations. Each card shows a real-time preview of its output — connect more data sources to unlock the full picture.</p>
          </div>

          {/* Stats bar */}
          <div className="mb-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-300">{productionCount}</p>
              <p className="mt-1 text-xs font-medium text-emerald-200 uppercase tracking-wider">Production</p>
            </div>
            <div className="rounded-2xl border border-brand-400/20 bg-brand-400/5 p-5 text-center">
              <p className="text-3xl font-bold text-brand-300">{demoCount}</p>
              <p className="mt-1 text-xs font-medium text-brand-200 uppercase tracking-wider">Demo Ready</p>
            </div>
            <div className="rounded-2xl border border-surface-700/30 bg-surface-900/50 p-5 text-center">
              <p className="text-3xl font-bold text-surface-300">{activeCount}</p>
              <p className="mt-1 text-xs font-medium text-surface-400 uppercase tracking-wider">Active (backend)</p>
            </div>
          </div>

          {/* Engine cards by category */}
          <div className="space-y-12">
            {categoryOrder.map((cat) => {
              const catEngines = engines.filter(e => e.category === cat);
              if (catEngines.length === 0) return null;
              return (
                <section key={cat}>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-surface-400">{categoryLabels[cat]}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-surface-500">{catEngines.length}</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {catEngines.map((engine) => (
                      <div key={engine.id} className="rounded-2xl border border-white/10 bg-surface-950/60 p-5 hover:border-white/20 transition-all flex flex-col">
                        {/* Top: status badge + name */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-sm font-semibold text-white">{engine.name}</h3>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyles[engine.status]}`}>{statusLabels[engine.status]}</span>
                        </div>

                        {/* Live data preview */}
                        {engine.apiPath ? (
                          <div className="mb-3 min-h-[80px]">
                            {loadingMap[engine.id] ? (
                              <div className="h-20 animate-pulse rounded-xl bg-surface-800" />
                            ) : liveData[engine.id] ? (
                              <EnginePreview engine={engine} data={liveData[engine.id]} />
                            ) : (
                              <div className="h-20 rounded-xl bg-surface-900/40 flex items-center justify-center border border-dashed border-white/5">
                                <span className="text-[10px] text-surface-500">Awaiting data connection</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mb-3 h-20 rounded-xl bg-surface-900/30 flex items-center justify-center border border-dashed border-white/5">
                            <div className="text-center">
                              <svg className="mx-auto h-5 w-5 text-surface-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <span className="text-[10px] text-surface-500">Backend service</span>
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        <p className="text-xs leading-5 text-surface-300 flex-1">{engine.description}</p>

                        {/* Metadata footer */}
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                          {engine.route && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-surface-500">Route</span>
                              <code className="text-[10px] text-brand-300 truncate">{engine.route}</code>
                            </div>
                          )}
                          {engine.apiPath && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-surface-500">API</span>
                              <code className="text-[10px] text-surface-400 truncate">GET {engine.apiPath}</code>
                            </div>
                          )}
                          {engine.page !== "—" && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-surface-500">Page</span>
                              <Link href={engine.page} className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors">{engine.page}</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Architecture note */}
          <div className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
            <h3 className="text-xl font-semibold text-white mb-3">Live data architecture</h3>
            <p className="max-w-3xl text-sm leading-7 text-surface-300">
              Every engine preview above fetches real-time data from your connected integrations via the Ledgera API proxy layer. 
              When <code className="text-brand-300">JWT_SECRET</code> and <code className="text-brand-300">LEDGERA_BACKEND_URL</code> are configured, 
              data flows from your live ServiceTitan, QuickBooks, Gusto, and other integrations through the backend engine and directly into these visual previews.
              As your business improves — fewer missed calls, higher margins, better AR collection — the gauges and indicators update automatically.
            </p>
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
