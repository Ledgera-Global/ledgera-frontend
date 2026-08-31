"use client";
import AppHeader from "@/components/layouts/AppHeader";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

const COMPANY_ID = "companyA";

/**
 * Marketing Profit Intelligence
 *
 * Renders the REAL contract from the backend marketingProfitEngine:
 *  - dataSource: "demo" (illustrative sample, clearly labeled) vs
 *    "transaction-graph" (real ad spend from the unified economic graph)
 *  - totalSpend / totalAttributedGrossProfit / profitAfterMarketing
 *  - roas / profitRatio / profitLeaking / hasAttribution
 *  - diagnostics: string[] (honest framing, never invents ROI)
 *  - campaigns: { campaignId, channel, name, spend, attributedGrossProfit }
 *
 * Honesty rule: no field is invented. If attribution is pending
 * (hasAttribution=false), the page says so instead of implying returns.
 */

type EngineCampaign = {
  campaignId: string;
  channel: string;
  name: string;
  spend: number;
  attributedGrossProfit: number;
};

type EngineReport = {
  companyId: string;
  generatedAt: string;
  dataSource: "demo" | "transaction-graph";
  demoNotice?: string;
  totalSpend: number;
  totalAttributedGrossProfit: number;
  profitAfterMarketing: number;
  roas: number;
  profitRatio: number;
  profitLeaking: boolean;
  hasAttribution: boolean;
  diagnostics: string[];
  campaigns: EngineCampaign[];
};

function formatMoney(value: number): string {
  if (Number.isNaN(value) || value === undefined || value === null) return "$0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1) + "M";
  return "$" + (value / 1000).toFixed(0) + "K";
}

const CHANNEL_BADGE: Record<string, string> = {
  google: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  meta: "bg-sky-400/10 text-sky-200 border-sky-400/20",
  hubspot: "bg-orange-400/10 text-orange-200 border-orange-400/20",
  other: "bg-surface-400/10 text-surface-300 border-surface-400/20",
};

export default function MarketingProfitPage() {
  const [data, setData] = useState<EngineReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await fetchJson(`/api/marketing-profit/${COMPANY_ID}`, null);
      setData(result as unknown as EngineReport);
      setLoading(false);
    })();
  }, []);

  const campaigns = data?.campaigns ?? [];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/marketing-profit" />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Marketing Profit Intelligence</h1>
          <p className="text-surface-400 max-w-2xl">
            What every marketing dollar actually returns in profit — measured from real spend joined to booked jobs, not guesswork.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data ? (
          <>
            {/* Data source honesty badge */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                  data.dataSource === "transaction-graph"
                    ? "bg-brand-400/10 text-brand-200 border-brand-400/20"
                    : "bg-amber-400/10 text-amber-200 border-amber-400/20"
                }`}
              >
                {data.dataSource === "transaction-graph" ? "Live data" : "Sample data"}
              </span>
              {data.dataSource === "demo" && (
                <span className="text-xs text-amber-200/80">
                  {data.demoNotice ?? "Illustrative sample — not your company's performance."}
                </span>
              )}
              {data.dataSource === "transaction-graph" && !data.hasAttribution && (
                <span className="text-xs text-surface-400">
                  Attribution pending — connect CallRail or HubSpot to attribute returns. Ledgera will not guess them.
                </span>
              )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Total Spend</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalSpend)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Attributed Gross Profit</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalAttributedGrossProfit)}</p>
              </div>
              <div
                className={`rounded-2xl border p-6 ${
                  data.profitAfterMarketing >= 0
                    ? "border-brand-400/20 bg-gradient-to-br from-brand-400/[0.08] to-white/[0.02]"
                    : "border-red-400/20 bg-red-400/[0.06]"
                }`}
              >
                <p className="text-sm text-surface-500 mb-1">Profit After Marketing</p>
                <p className={`text-2xl font-bold ${data.profitAfterMarketing >= 0 ? "text-brand-300" : "text-red-400"}`}>
                  {formatMoney(data.profitAfterMarketing)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">ROAS</p>
                <p className="text-2xl font-bold text-white">
                  {data.hasAttribution ? `${data.roas.toFixed(1)}x` : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Profit Ratio</p>
                <p className="text-2xl font-bold text-white">
                  {data.hasAttribution ? `${data.profitRatio.toFixed(1)}x` : "—"}
                </p>
              </div>
              <div
                className={`rounded-2xl border p-6 ${
                  data.profitLeaking ? "border-red-400/20 bg-red-400/[0.06]" : "border-brand-400/20 bg-brand-400/[0.06]"
                }`}
              >
                <p className="text-sm text-surface-500 mb-1">Channel Mix</p>
                <p className={`text-2xl font-bold ${data.profitLeaking ? "text-red-400" : "text-brand-300"}`}>
                  {data.profitLeaking ? "Leaking" : "Healthy"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Attribution</p>
                <p className="text-2xl font-bold text-white">{data.hasAttribution ? "Connected" : "Pending"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Channels</p>
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
              </div>
            </div>

            {/* Per-campaign table */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden mb-8">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Campaign Profit Ranking</h2>
                <span className="text-xs text-surface-500">Sorted by spend</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                      <th className="px-6 py-3 font-medium">Campaign</th>
                      <th className="px-4 py-3 font-medium">Channel</th>
                      <th className="px-4 py-3 font-medium text-right">Spend</th>
                      <th className="px-4 py-3 font-medium text-right">Attributed Gross Profit</th>
                      <th className="px-4 py-3 font-medium text-right">Contribution</th>
                      <th className="px-6 py-3 font-medium text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => {
                      const contribution = c.attributedGrossProfit - c.spend;
                      const roas = c.spend > 0 ? c.attributedGrossProfit / c.spend : 0;
                      return (
                        <tr key={c.campaignId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${CHANNEL_BADGE[c.channel] ?? CHANNEL_BADGE.other}`}>
                              {c.channel}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatMoney(c.spend)}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatMoney(c.attributedGrossProfit)}</td>
                          <td className={`px-4 py-4 text-right font-semibold ${contribution >= 0 ? "text-brand-300" : "text-red-400"}`}>
                            {formatMoney(contribution)}
                          </td>
                          <td className="px-6 py-4 text-right text-surface-300">
                            {data.hasAttribution && roas > 0 ? `${roas.toFixed(1)}x` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Diagnostics and Recommended Actions</h2>
                <p className="text-sm text-surface-500 mt-1">
                  Framing comes from real attribution where it exists; otherwise Ledgera states what is missing rather than guessing.
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {(data.diagnostics ?? []).map((d, i) => (
                  <div key={i} className="px-6 py-5">
                    <p className="text-sm text-surface-300 leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-400">Failed to load marketing profit data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
