"use client";
import AppHeader from "@/components/layouts/AppHeader";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

const COMPANY_ID = "companyA";

/**
 * Marketing Drilldown — Branch → Channel → Campaign
 *
 * Honest contract from the backend marketingDrilldownEngine:
 *  - Spend is company-level, grouped by channel & campaign (real ad spend).
 *  - Attributed outcomes (gross profit, jobs) are branch-scoped via the
 *    call → job → location chain. Spend is NEVER claimed per branch.
 *  - If attribution is pending (hasAttribution=false), the page says so.
 */

type DrilldownCampaign = {
  campaignId: string;
  name: string;
  attributedGrossProfit: number;
  attributedJobs: number;
};

type DrilldownChannel = {
  channel: string;
  channelKey: string;
  attributedGrossProfit: number;
  attributedJobs: number;
  campaigns: DrilldownCampaign[];
};

type DrilldownBranch = {
  locationId: string;
  locationName: string;
  attributedGrossProfit: number;
  attributedJobs: number;
  channels: DrilldownChannel[];
};

type ChannelSpend = { channelKey: string; channel: string; spend: number };
type CampaignSpend = { campaignId: string; name: string; spend: number };

type DrilldownReport = {
  companyId: string;
  generatedAt: string;
  lookbackDays: number;
  totalSpend: number;
  totalAttributedGrossProfit: number;
  totalAttributedJobs: number;
  hasAttribution: boolean;
  channelSpend: ChannelSpend[];
  campaignSpend: CampaignSpend[];
  branches: DrilldownBranch[];
};

function formatMoney(value: number): string {
  if (Number.isNaN(value) || value === undefined || value === null) return "$0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return "$" + (value / 1_000_000).toFixed(1) + "M";
  return "$" + (value / 1000).toFixed(0) + "K";
}

export default function MarketingDrilldownPage() {
  const [data, setData] = useState<DrilldownReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await fetchJson(`/api/intelligence/${COMPANY_ID}/marketing-drilldown`, null);
      setData(result as unknown as DrilldownReport);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/marketing-drilldown" />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Marketing Drilldown</h1>
          <p className="text-surface-400 max-w-2xl">
            Branch → Channel → Campaign. Spend is company-level and real; attributed
            outcomes are branch-scoped from your actual jobs.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data ? (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                  data.hasAttribution
                    ? "bg-brand-400/10 text-brand-200 border-brand-400/20"
                    : "bg-amber-400/10 text-amber-200 border-amber-400/20"
                }`}
              >
                {data.hasAttribution ? "Attributed" : "Attribution pending"}
              </span>
              <span className="text-xs text-surface-500">
                Last {data.lookbackDays} days
              </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Total Ad Spend</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalSpend)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Attributed Gross Profit</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalAttributedGrossProfit)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Attributed Jobs</p>
                <p className="text-2xl font-bold text-white">{data.totalAttributedJobs}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Branches</p>
                <p className="text-2xl font-bold text-white">{data.branches.length}</p>
              </div>
            </div>

            {/* Spend by channel */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden mb-8">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Spend by Channel</h2>
                <p className="text-sm text-surface-500 mt-1">
                  Company-level ad spend — real from your economic graph.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                      <th className="px-6 py-3 font-medium">Channel</th>
                      <th className="px-4 py-3 font-medium text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channelSpend.map((c) => (
                      <tr key={c.channelKey} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-medium text-white">{c.channel}</td>
                        <td className="px-4 py-4 text-right text-surface-300">{formatMoney(c.spend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branch → Channel → Campaign drilldown */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Branch → Channel → Campaign</h2>
                <p className="text-sm text-surface-500 mt-1">
                  Attributed outcomes by branch. Spend is shown at the channel/campaign
                  level; it is never attributed to a branch that didn't run a job.
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {data.branches.map((branch) => (
                  <div key={branch.locationId} className="px-6 py-5">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-white">{branch.locationName}</p>
                        <p className="text-xs text-surface-500">
                          {branch.attributedJobs} attributed jobs
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-brand-300">
                          {formatMoney(branch.attributedGrossProfit)}
                        </p>
                        <p className="text-xs text-surface-500">attributed GP</p>
                      </div>
                    </div>
                    {/* Channels */}
                    <div className="space-y-3">
                      {branch.channels.map((chan) => (
                        <div
                          key={`${branch.locationId}-${chan.channelKey}`}
                          className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-surface-200">{chan.channel}</p>
                            <p className="text-sm text-surface-300">
                              {chan.attributedJobs} jobs ·{" "}
                              <span className="text-brand-300">
                                {formatMoney(chan.attributedGrossProfit)}
                              </span>
                            </p>
                          </div>
                          {chan.campaigns.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {chan.campaigns.map((camp) => (
                                <span
                                  key={camp.campaignId}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-900/40 px-3 py-1 text-xs text-surface-300"
                                >
                                  {camp.name}
                                  <span className="text-surface-500">·</span>
                                  {camp.attributedJobs} jobs
                                  <span className="text-surface-500">·</span>
                                  <span className="text-brand-300">
                                    {formatMoney(camp.attributedGrossProfit)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {data.branches.length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <p className="text-surface-400">
                      No attributed jobs across branches yet — connect CallRail or HubSpot
                      and sync your jobs to populate this drilldown.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-400">Failed to load marketing drilldown data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
