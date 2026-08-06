"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import { DEFAULT_LIVE_EV } from "@/lib/data/defaults";
import type { ActivityEvent, LiveEvData, ValueCreationBreakdown } from "@/lib/types/acquisition";
import { fmt } from "@/lib/utils/format";

interface LiveEvCardProps {
  companyId: string;
}

export function LiveEvCard({ companyId }: LiveEvCardProps) {
  const [data, setData] = useState<LiveEvData | null>(null);
  const [seconds, setSeconds] = useState(13);

  const url = useMemo(() => `/api/live-ev/${encodeURIComponent(companyId)}`, [companyId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchJson<LiveEvData>(url, DEFAULT_LIVE_EV);
      if (!cancelled) {
        setData(result);
        setSeconds(result.secondsSinceUpdate);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  // Tick the seconds counter
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const d = data ?? DEFAULT_LIVE_EV;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/[0.06] to-white/[0.02] p-6">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-white">LIVE Enterprise Value</h2>
        </div>
        <span className="text-xs text-surface-500 font-mono">
          Updated {seconds}s ago
        </span>
      </div>

      {/* Primary EV display */}
      <div className="mb-2">
        <span className="text-xs uppercase tracking-wider text-surface-400">Estimated Enterprise Value</span>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-white tracking-tight">
            {fmt(d.enterpriseValue)}
          </span>
          <span className={`text-sm font-semibold ${d.todayChange >= 0 ? "text-brand-400" : "text-red-400"}`}>
            {d.todayChange >= 0 ? "↑" : "↓"} {fmt(Math.abs(d.todayChange))} today
          </span>
        </div>
      </div>

      {/* Week / Quarter changes */}
      <div className="flex gap-4 text-sm mb-6">
        <span className="text-brand-400">↑ {fmt(d.weekChange)} this week</span>
        <span className="text-brand-400">↑ {fmt(d.quarterChange)} this quarter</span>
      </div>

      {/* Value Creation Breakdown — Today's Drivers */}
      <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
          Today's Value Creation
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Revenue</span>
            <span className="text-sm font-semibold text-brand-400">+{fmt(d.valueCreation.revenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Gross Margin</span>
            <span className="text-sm font-semibold text-brand-400">+{fmt(d.valueCreation.grossMargin)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">AR Collections</span>
            <span className="text-sm font-semibold text-brand-400">+{fmt(d.valueCreation.arCollections)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-300">Dispatch Efficiency</span>
            <span className="text-sm font-semibold text-brand-400">+{fmt(d.valueCreation.dispatchEfficiency)}</span>
          </div>
          <div className="border-t border-white/5 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Total Change</span>
            <span className="text-sm font-bold text-brand-400">+{fmt(d.valueCreation.todayChange)}</span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
          Activity Feed
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {d.activity.map((event, i) => (
            <ActivityRow key={i} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const time = new Date(event.time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const colorMap: Record<string, string> = {
    invoice_paid: "bg-emerald-500",
    ebitda_updated: "bg-brand-500",
    metric_improved: "bg-blue-500",
    job_completed: "bg-purple-500",
    risk_decreased: "bg-green-500",
  };

  const dotColor = colorMap[event.type] ?? "bg-surface-500";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <span className={`mt-1 inline-flex h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-200 truncate">{event.message}</p>
      </div>
      <span className="shrink-0 text-xs text-surface-500 font-mono">{time}</span>
    </div>
  );
}
