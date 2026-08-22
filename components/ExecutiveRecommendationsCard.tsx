"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

// ─── AI CFO Agents ──────────────────────────────────────────────────────
// Renders real agent signals from the backend (finance/labor/margin agents)
// with approve / decline / implement actions. No hardcoded recommendations —
// empty state renders the "AI watching your business" message.


type AgentName = "finance" | "margin" | "labor" | "growth";
type AgentCategory = "revenue" | "cost" | "efficiency" | "risk";
type AgentStatus = "suggested" | "approved" | "declined" | "implemented";

type AgentSignal = {
  id: string;
  signalKey: string;
  agent: AgentName;
  category: AgentCategory;
  title: string;
  detail: string;
  action: string;
  estimatedImpact: number;
  status: AgentStatus;
  realizedImpact: number;
  createdAt: string;
  updatedAt: string;
};

type AgentSignalsData = {
  companyId: string;
  generatedAt: string;
  signals: AgentSignal[];
  summary: {
    totalOpen: number;
    totalApproved: number;
    totalImplemented: number;
    totalEstimatedImpact: number;
    totalRealizedImpact: number;
  };
};

const EMPTY: AgentSignalsData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  signals: [],
  summary: {
    totalOpen: 0,
    totalApproved: 0,
    totalImplemented: 0,
    totalEstimatedImpact: 0,
    totalRealizedImpact: 0,
  },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

const AGENT_LABEL: Record<AgentName, string> = {
  finance: "Finance Agent",
  margin: "Margin Agent",
  labor: "Labor Agent",
  growth: "Growth Agent",
};

const AGENT_COLOR: Record<AgentName, string> = {
  finance: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  margin: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  labor: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  growth: "bg-violet-400/10 text-violet-300 border-violet-400/20",
};

const STATUS_STYLE: Record<AgentStatus, string> = {
  suggested: "bg-surface-800/60 text-surface-300 border-white/10",
  approved: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  declined: "bg-surface-800/40 text-surface-500 border-white/5",
  implemented: "bg-brand-400/10 text-brand-200 border-brand-400/20",
};

function agentIcon(agent: AgentName) {
  switch (agent) {
    case "finance":
      return (
        <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "margin":
      return (
        <svg className="h-5 w-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "labor":
      return (
        <svg className="h-5 w-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "growth":
      return (
        <svg className="h-5 w-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
  }
}

type Props = { companyId: string };

export default function ExecutiveRecommendationsCard({ companyId }: Props) {
  const [data, setData] = useState<AgentSignalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const url = useMemo(
    () => `/api/agents/${encodeURIComponent(companyId)}/signals`,
    [companyId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchJson<AgentSignalsData>(url, EMPTY);
    setData(result);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<AgentSignalsData>(url, EMPTY);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function setStatus(signalId: string, status: AgentStatus) {
    setActingOn(signalId);
    try {
      await fetch(
        `/api/agents/${encodeURIComponent(companyId)}/signals/${signalId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      await load();
    } catch {
      // Non-fatal: refresh will show backend truth.
    } finally {
      setActingOn(null);
    }
  }

  async function implementWithImpact(signalId: string, estimatedImpact: number) {
    setActingOn(signalId);
    try {
      await fetch(
        `/api/agents/${encodeURIComponent(companyId)}/signals/${signalId}/implement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ realizedImpact: estimatedImpact }),
        }
      );
      await load();
    } catch {
      // Non-fatal
    } finally {
      setActingOn(null);
    }
  }

  const d = data ?? EMPTY;
  const openSignals = d.signals.filter(
    (s) => s.status === "suggested" || s.status === "approved"
  );

  return (
    <section>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-surface-400">AI CFO Agents</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Agent Recommendations</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-900/40 px-4 py-2 text-right">
          <p className="text-xs text-surface-500">Estimated recoverable</p>
          <p className="text-lg font-bold text-emerald-300">{fmt(d.summary.totalEstimatedImpact)}</p>
          <p className="text-[10px] text-surface-500">
            {d.summary.totalImplemented} implemented · {fmt(d.summary.totalRealizedImpact)} realized
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-24 w-full rounded bg-surface-800" />
            <div className="h-24 w-full rounded bg-surface-800" />
          </div>
        ) : openSignals.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-8 text-center">
            <p className="text-sm text-surface-400">
              No active signals right now. The Finance, Margin, and Labor agents are continuously
              watching your data — new recommendations appear here as they surface.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openSignals
              .slice()
              .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
              .map((signal) => (
                <div
                  key={signal.id}
                  className="rounded-2xl border border-white/5 bg-surface-900/40 p-4 transition hover:bg-surface-900/60"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-800/60">
                      {agentIcon(signal.agent)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${AGENT_COLOR[signal.agent]}`}
                        >
                          {AGENT_LABEL[signal.agent]}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[signal.status]}`}
                        >
                          {signal.status}
                        </span>
                        <h3 className="text-sm font-semibold text-white">{signal.title}</h3>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-surface-300">{signal.detail}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-800/50 px-3 py-1 text-xs text-surface-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {signal.action}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                          +{fmt(signal.estimatedImpact)} impact
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {signal.status === "suggested" && (
                          <button
                            type="button"
                            disabled={actingOn === signal.id}
                            onClick={() => setStatus(signal.id, "approved")}
                            className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
                          >
                            {actingOn === signal.id ? "Working…" : "Approve"}
                          </button>
                        )}
                        {signal.status === "approved" && (
                          <button
                            type="button"
                            disabled={actingOn === signal.id}
                            onClick={() => implementWithImpact(signal.id, signal.estimatedImpact)}
                            className="rounded-full bg-brand-400/10 px-3 py-1 text-xs font-semibold text-brand-300 transition hover:bg-brand-400/20 disabled:opacity-50"
                          >
                            {actingOn === signal.id ? "Working…" : "Mark Implemented"}
                          </button>
                        )}
                        {(signal.status === "suggested" || signal.status === "approved") && (
                          <button
                            type="button"
                            disabled={actingOn === signal.id}
                            onClick={() => setStatus(signal.id, "declined")}
                            className="rounded-full bg-surface-800/40 px-3 py-1 text-xs font-medium text-surface-400 transition hover:bg-surface-800/60 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
