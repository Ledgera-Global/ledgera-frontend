"use client";
import { useEffect, useMemo, useState } from "react";

type DashboardMetrics = {
  windowDays: number;
  totalRevenue: number;
  totalProfit: number;
  avgMarginPct: number;
  moneyLeakedThisWeek: number;
};

type DashboardKpisProps = { companyId: string };

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatPct(value: number) { return `${value.toFixed(2)}%`; }

export default function DashboardKpis({ companyId }: DashboardKpisProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardMetrics | null>(null);

  const url = useMemo(() => `/api/dashboard-metrics/${encodeURIComponent(companyId)}`, [companyId]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(null); setData(null);
      if (!companyId) { setError("No company selected"); setLoading(false); return; }
      try {
        const res = await fetch(url, { method: "GET", signal: controller.signal, headers: { "content-type": "application/json" }, cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load dashboard metrics (${res.status})`);
        const json = (await res.json()) as DashboardMetrics;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard metrics");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [url, companyId]);

  const marginIsGood = (data?.avgMarginPct ?? 0) >= 25;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Your Money-Maker</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-white">{loading || !data ? "N/A" : formatMoney(data.totalRevenue)}</p>
        </div>
        <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Total Profit</p>
          <p className={`mt-2 text-2xl font-semibold ${!data ? "text-surface-100" : data.totalProfit < 0 ? "text-red-300" : "text-emerald-300"}`}>
            {loading || !data ? "N/A" : formatMoney(data.totalProfit)}
          </p>
        </div>
        <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Avg Margin</p>
          <p className={`mt-2 text-2xl font-semibold ${!data ? "text-surface-100" : marginIsGood ? "text-emerald-300" : "text-amber-200"}`}>
            {loading || !data ? "N/A" : formatPct(data.avgMarginPct)}
          </p>
        </div>
        <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Money Leaked This Week</p>
          <p className="mt-2 text-2xl font-semibold text-red-200">{loading || !data ? "N/A" : formatMoney(data.moneyLeakedThisWeek)}</p>
          <p className="mt-1 text-sm text-surface-400">Estimated from low-profit job patterns.</p>
        </div>
      </div>
      {error ? <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
    </section>
  );
}
