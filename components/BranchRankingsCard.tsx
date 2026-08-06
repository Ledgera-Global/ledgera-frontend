"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type Branch = {
  rank: number;
  name: string;
  efficiencyScore: number;
  revenue: number;
  profit: number;
  jobsCount: number;
  trend: "up" | "down" | "flat";
};

type BranchRankingsData = {
  branches: Branch[];
};

const FALLBACK: BranchRankingsData = {
  branches: [
    { rank: 1, name: "Dallas North", efficiencyScore: 94, revenue: 420_000, profit: 147_000, jobsCount: 312, trend: "up" },
    { rank: 2, name: "Fort Worth", efficiencyScore: 87, revenue: 385_000, profit: 123_000, jobsCount: 289, trend: "up" },
    { rank: 3, name: "Plano", efficiencyScore: 79, revenue: 310_000, profit: 89_000, jobsCount: 245, trend: "flat" },
    { rank: 4, name: "Arlington", efficiencyScore: 71, revenue: 278_000, profit: 72_000, jobsCount: 210, trend: "down" },
    { rank: 5, name: "Irving", efficiencyScore: 62, revenue: 215_000, profit: 49_000, jobsCount: 178, trend: "down" },
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function TrendArrow({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") {
    return (
      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
}

type Props = { companyId: string };

export default function BranchRankingsCard({ companyId }: Props) {
  const [data, setData] = useState<BranchRankingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/branch-rankings/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<BranchRankingsData>(url, FALLBACK);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          Branch Rankings
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Branch Rankings
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-32 w-full rounded bg-surface-800" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-surface-400">
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Branch</th>
                  <th className="pb-3 pr-4">Efficiency</th>
                  <th className="pb-3 pr-4">Revenue</th>
                  <th className="pb-3 pr-4">Profit</th>
                  <th className="pb-3 pr-4">Jobs</th>
                  <th className="pb-3 pr-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {d.branches
                  .slice()
                  .sort((a, b) => a.rank - b.rank)
                  .map((branch) => (
                    <tr
                      key={branch.rank}
                      className="border-b border-white/5 last:border-0 hover:bg-surface-900/20"
                    >
                      <td className="py-3 pr-4">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-800 text-xs font-semibold text-surface-300">
                          {branch.rank}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-white">
                        {branch.name}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-surface-800">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
                              style={{ width: `${branch.efficiencyScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-surface-300">
                            {branch.efficiencyScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-surface-200">
                        {fmt(branch.revenue)}
                      </td>
                      <td className="py-3 pr-4 text-emerald-400">
                        {fmt(branch.profit)}
                      </td>
                      <td className="py-3 pr-4 text-surface-300">
                        {branch.jobsCount}
                      </td>
                      <td className="py-3 pr-4">
                        <TrendArrow trend={branch.trend} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}