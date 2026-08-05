"use client";
import { useEffect, useMemo, useState } from "react";

type ProfitAlertSeverity = "CLEAN" | "HIGH" | "CRITICAL";
type ProfitAlert = { type: string; severity: ProfitAlertSeverity; title: string; detail: string; estimatedLostDollars?: number };
type ProfitAlertsResponse = { windowDays: number; generatedAt: string; alerts: ProfitAlert[] };
type Props = { companyId: string };

type ActionGuide = {
  rootCause: string;
  whatToDo: string;
  actionLabel: string;
  actionHref: string;
};

const ACTION_GUIDES: Record<string, ActionGuide> = {
  LOW_SERVICE_MARGIN: {
    rootCause: "Your pricing hasn't kept up with rising material and labor costs — some jobs are priced below what they cost to deliver.",
    whatToDo: "Review your service price book and update it to reflect current costs. Target a minimum 35% margin on every job.",
    actionLabel: "Review price book in QuickBooks",
    actionHref: "https://quickbooks.intuit.com",
  },
  LOW_TECHNICIAN_EFFICIENCY: {
    rootCause: "One or more technicians consistently take longer than peers on similar jobs, reducing your hourly revenue throughput.",
    whatToDo: "Have a coaching conversation with the technician. Use job time data to identify specific skill gaps (diagnosis, part retrieval, etc.).",
    actionLabel: "View technician performance breakdown",
    actionHref: "/dashboard",
  },
  IDLE_TECHNICIAN: {
    rootCause: "Missed or dropped calls indicate dispatch gaps — jobs are going to competitors because no one answered or followed up.",
    whatToDo: "Set up after-hours call forwarding and a same-day callback policy. Every missed call is a lost job.",
    actionLabel: "Configure call tracking in Twilio",
    actionHref: "/integrations",
  },
};

function formatMoney(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }

function severityStyles(severity: ProfitAlertSeverity) {
  switch (severity) {
    case "CRITICAL": return "border-red-500/40 bg-red-500/10 text-red-100";
    case "HIGH": return "border-amber-500/40 bg-amber-500/10 text-amber-100";
    default: return "border-surface-800 bg-surface-950/50 text-surface-200";
  }
}

export default function ProfitLeakageFeed({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ProfitAlert[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const url = useMemo(() => `/api/profit-alerts/${encodeURIComponent(companyId)}`, [companyId]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(null); setAlerts([]);
      if (!companyId) { setError("No company selected"); setLoading(false); return; }
      try {
        const res = await fetch(url, { method: "GET", signal: controller.signal, headers: { "content-type": "application/json" }, cache: "no-store" });
        if (!res.ok) throw new Error(`Leakage feed fetch failed (${res.status})`);
        const json = (await res.json()) as ProfitAlertsResponse;
        if (!cancelled) setAlerts(json.alerts ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profit alerts");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [url, companyId]);

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Profit Leakage Feed</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Where money&rsquo;s leaking</h3>
      </div>
      <div className="space-y-3">
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4 shadow-xl shadow-black/10">
              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-700" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-surface-800" />
            </div>
          ))
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4 text-sm text-surface-400">No leakage detected in the current window.</div>
        ) : (
          alerts.map((a, idx) => {
            const lost = typeof a.estimatedLostDollars === "number" ? a.estimatedLostDollars : null;
            const guide = ACTION_GUIDES[a.type];
            const expanded = expandedIndex === idx;

            return (
              <div key={`${a.type}-${idx}`} className={`rounded-2xl border shadow-xl shadow-black/10 ${severityStyles(a.severity)}`}>
                <button
                  onClick={() => setExpandedIndex(expanded ? null : idx)}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                      {a.severity === "CRITICAL" ? "🔥 CRITICAL" : a.severity === "HIGH" ? "⚡ HIGH" : "CLEAN"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{a.title}</p>
                    <p className="mt-1 text-sm opacity-90 line-clamp-2">{a.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {lost !== null ? (
                      <div className="rounded-xl border border-surface-800 bg-surface-950/30 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-surface-300">Est. lost</p>
                        <p className="mt-1 text-base font-semibold text-white">{formatMoney(lost)}</p>
                      </div>
                    ) : null}
                    <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </button>

                {expanded && guide && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-surface-400 mb-1">Why this happened</p>
                      <p className="text-sm text-surface-200 leading-relaxed">{guide.rootCause}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-surface-400 mb-1">What to do next</p>
                      <p className="text-sm text-surface-200 leading-relaxed">{guide.whatToDo}</p>
                    </div>
                    <a
                      href={guide.actionHref}
                      target={guide.actionHref.startsWith("http") ? "_blank" : undefined}
                      rel={guide.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-block rounded-full bg-brand-500/90 px-5 py-2 text-xs font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02]"
                    >
                      {guide.actionLabel} &rarr;
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
