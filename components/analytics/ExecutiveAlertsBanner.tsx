"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type AlertSeverity = "critical" | "high" | "positive";

type ExecutiveAlert = {
  type: string;
  emoji: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  metric: string;
  metricLabel: string;
};

type ExecutiveAlertsResponse = {
  alerts: ExecutiveAlert[];
  generatedAt: string;
};

const FALLBACK: ExecutiveAlertsResponse = { alerts: [], generatedAt: new Date().toISOString() };

function severityBorder(severity: AlertSeverity): string {
  switch (severity) {
    case "critical": return "border-l-red-500/60";
    case "high": return "border-l-amber-500/60";
    case "positive": return "border-l-emerald-500/60";
  }
}

function severityBg(severity: AlertSeverity): string {
  switch (severity) {
    case "critical": return "bg-red-500/5";
    case "high": return "bg-amber-500/5";
    case "positive": return "bg-emerald-500/5";
  }
}

function severityMetricColor(severity: AlertSeverity): string {
  switch (severity) {
    case "critical": return "text-red-300";
    case "high": return "text-amber-300";
    case "positive": return "text-emerald-300";
  }
}

type ExecutiveAlertsBannerProps = { companyId: string };

export default function ExecutiveAlertsBanner({ companyId }: ExecutiveAlertsBannerProps) {
  const [data, setData] = useState<ExecutiveAlertsResponse>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/executive-alerts/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<ExecutiveAlertsResponse>(url, FALLBACK);
      if (!cancelled) { setData(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-950/60 p-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-72 shrink-0 animate-pulse rounded-xl bg-surface-800" />
          ))}
        </div>
      </div>
    );
  }

  if (data.alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-950/60 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Executive Alerts</h3>
          <span className="rounded-full bg-brand-400/10 px-2 py-0.5 text-[10px] font-medium text-brand-200">
            AI-powered
          </span>
        </div>
        <span className="text-[10px] text-surface-500">
          Updated {new Date(data.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-700">
        {data.alerts.map((alert) => (
          <div
            key={alert.type}
            className={`shrink-0 w-80 rounded-xl border border-white/5 ${severityBg(alert.severity)} ${severityBorder(alert.severity)} border-l-4 p-4`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{alert.emoji}</span>
                <span className="text-sm font-semibold text-white truncate">{alert.title}</span>
              </div>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed mb-3 line-clamp-2">{alert.detail}</p>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${severityMetricColor(alert.severity)}`}>
                {alert.metric}
              </span>
              <span className="text-[10px] text-surface-500">{alert.metricLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
