"use client";
import { useEffect, useMemo, useState } from "react";

type JobRow = { jobId: string; revenue: number; cost: number; profit: number; technician: string; durationHours: number | null; durationText: string | null };
type JobsResponse = { jobs: JobRow[] };
type Props = { companyId: string };

function formatMoney(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function formatProfit(v: number) { const s = v < 0 ? "-" : ""; return s + formatMoney(Math.abs(v)); }
function formatDuration(row: JobRow) {
  if (row.durationText) return row.durationText;
  if (typeof row.durationHours === "number" && Number.isFinite(row.durationHours)) return `${row.durationHours.toFixed(1)}h`;
  return "N/A";
}

export default function JobsTable({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);

  const url = useMemo(() => `/api/jobs/${encodeURIComponent(companyId)}`, [companyId]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(null); setJobs([]);
      if (!companyId) { setError("No company selected"); setLoading(false); return; }
      try {
        const res = await fetch(url, { method: "GET", signal: controller.signal, headers: { "content-type": "application/json" }, cache: "no-store" });
        if (!res.ok) throw new Error(`Jobs fetch failed (${res.status})`);
        const json = (await res.json()) as JobsResponse;
        if (!cancelled) setJobs(json.jobs ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load jobs");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [url, companyId]);

  const visibleJobs = jobs.slice(0, 8);

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Jobs</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Recent Profit Drivers</h3>
      </div>
      {error ? <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
      <div className="overflow-hidden rounded-3xl border border-surface-800 bg-surface-900/40">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface-950/70">
              <tr className="text-xs uppercase tracking-[0.18em] text-surface-300">
                <th className="px-4 py-3">Job ID</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-surface-700" /></td>
                    <td className="px-4 py-3 text-right"><div className="ml-auto h-3 w-20 animate-pulse rounded bg-surface-700" /></td>
                    <td className="px-4 py-3 text-right"><div className="ml-auto h-3 w-20 animate-pulse rounded bg-surface-700" /></td>
                    <td className="px-4 py-3 text-right"><div className="ml-auto h-3 w-20 animate-pulse rounded bg-surface-700" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-28 animate-pulse rounded bg-surface-700" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-16 animate-pulse rounded bg-surface-700" /></td>
                  </tr>
                ))
              ) : visibleJobs.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-sm text-surface-400" colSpan={6}>No jobs found for this company.</td></tr>
              ) : (
                visibleJobs.map((row) => (
                  <tr key={row.jobId}>
                    <td className="px-4 py-3"><span className="font-semibold text-surface-100">{row.jobId}</span></td>
                    <td className="px-4 py-3 text-right text-surface-100">{formatMoney(row.revenue)}</td>
                    <td className="px-4 py-3 text-right text-surface-100">{formatMoney(row.cost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${row.profit >= 0 ? "text-emerald-300" : "text-red-300"}`}>{formatProfit(row.profit)}</span>
                    </td>
                    <td className="px-4 py-3 text-surface-200">{row.technician}</td>
                    <td className="px-4 py-3 text-surface-200">{formatDuration(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
