"use client";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import { NAV_LINKS } from "@/lib/constants/styling";
import type { MarketingProfitReport } from "@/lib/types/acquisition";

const COMPANY_ID = "companyA";

function formatMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "M";
  }
  return "$" + (value / 1000).toFixed(0) + "K";
}

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-400/10 text-red-200 border-red-400/20",
  medium: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  low: "bg-brand-400/10 text-brand-200 border-brand-400/20",
};

const SEVERITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const STATUS_BADGE: Record<string, string> = {
  scaling: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  holding: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  trimming: "bg-orange-400/10 text-orange-200 border-orange-400/20",
  candidate_off: "bg-red-400/10 text-red-200 border-red-400/20",
};

const STATUS_LABEL: Record<string, string> = {
  scaling: "Scaling",
  holding: "Holding",
  trimming: "Trimming",
  candidate_off: "Candidate Off",
};

export default function MarketingProfitPage() {
  const [data, setData] = useState<MarketingProfitReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await fetchJson(`/api/marketing-profit/${COMPANY_ID}`, null);
      setData(result);
      setLoading(false);
    })();
  }, []);

  const campaigns =
    data && data.campaigns
      ? [...data.campaigns].sort(
          (a, b) =>
            (b.profitAfterMarketing ?? 0) - (a.profitAfterMarketing ?? 0)
        )
      : [];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/analytics/marketing-profit" ? "text-white" : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <InstitutionalNav currentHref="/analytics/marketing-profit" />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Marketing Profit Intelligence</h1>
          <p className="text-surface-400 max-w-2xl">
            What every marketing dollar actually returns in profit after ad spend, ranked source by source.
          </p>
        </div>

        {loading ? (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Total Spend</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalSpend)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Gross Profit</p>
                <p className="text-2xl font-bold text-white">{formatMoney(data.totalGrossProfit)}</p>
              </div>
              <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.08] to-white/[0.02] p-6">
                <p className="text-sm text-surface-500 mb-1">Profit After Marketing</p>
                <p className="text-2xl font-bold text-brand-300">{formatMoney(data.profitAfterMarketing)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">ROAS</p>
                <p className="text-2xl font-bold text-white">{data.marketingROAS.toFixed(1)}x</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Profit Ratio</p>
                <p className="text-2xl font-bold text-white">{data.marketingProfitRatio.toFixed(1)}x</p>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-6">
                <p className="text-sm text-surface-500 mb-1">Total Profit Leaking</p>
                <p className="text-2xl font-bold text-red-400">{formatMoney(data.totalProfitLeaking)}</p>
              </div>
              <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.08] to-white/[0.02] p-6">
                <p className="text-sm text-surface-500 mb-1">EV Impact</p>
                <p className="text-2xl font-bold text-brand-300">{formatMoney(data.enterpriseValueImpact)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                <p className="text-sm text-surface-500 mb-1">Applied Multiple</p>
                <p className="text-2xl font-bold text-white">{data.appliedMultiple}x</p>
              </div>
            </div>

            {/* Narrative summary */}
            {data.narrative && (
              <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-6 mb-8">
                <p className="text-sm text-surface-500 mb-2">{data.periodLabel}</p>
                <p className="text-surface-300 leading-relaxed">{data.narrative}</p>
              </div>
            )}

            {/* Per-campaign table sorted by profit after marketing */}
            <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden mb-8">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Campaign Profit Ranking</h2>
                <span className="text-xs text-surface-500">Sorted by profit after marketing</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                      <th className="px-6 py-3 font-medium">Campaign</th>
                      <th className="px-4 py-3 font-medium">Channel</th>
                      <th className="px-4 py-3 font-medium text-right">Spend</th>
                      <th className="px-4 py-3 font-medium text-right">Revenue</th>
                      <th className="px-4 py-3 font-medium text-right">Gross Profit</th>
                      <th className="px-4 py-3 font-medium text-right">Profit After Marketing</th>
                      <th className="px-4 py-3 font-medium text-right">ROAS</th>
                      <th className="px-4 py-3 font-medium text-right">Payback</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => {
                      const roas = campaign.spend > 0 ? campaign.revenue / campaign.spend : 0;
                      return (
                        <tr key={campaign.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-6 py-4 font-medium text-white">{campaign.name}</td>
                          <td className="px-4 py-4 capitalize text-surface-300">{campaign.channel}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatMoney(campaign.spend)}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatMoney(campaign.revenue)}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{formatMoney(campaign.grossProfit)}</td>
                          <td className="px-4 py-4 text-right font-semibold text-brand-300">{formatMoney(campaign.profitAfterMarketing ?? 0)}</td>
                          <td className="px-4 py-4 text-right text-surface-300">{roas.toFixed(1)}x</td>
                          <td className="px-4 py-4 text-right text-surface-300">{campaign.paybackMonths.toFixed(1)} months</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[campaign.status]}`}>
                              {STATUS_LABEL[campaign.status]}
                            </span>
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
                  Executing these actions could recover approximately {formatMoney(data.totalProfitLeaking)} per period.
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {data.diagnostics.map((diagnostic, index) => (
                  <div key={`${diagnostic.campaignId}-${index}`} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_BADGE[diagnostic.severity]}`}>
                          {SEVERITY_LABEL[diagnostic.severity]} Impact
                        </span>
                        <span className="ml-2 text-xs text-surface-500">{diagnostic.campaignName}</span>
                      </div>
                      <span className="text-sm font-semibold text-red-400 whitespace-nowrap">
                        {formatMoney(diagnostic.profitImpactEstimate)}
                      </span>
                    </div>
                    <p className="font-medium text-white">{diagnostic.finding}</p>
                    <p className="text-sm text-surface-400 mt-1">{diagnostic.evidence}</p>
                    <p className="text-sm text-brand-200 mt-2">
                      <span className="text-surface-500">Recommended action:</span> {diagnostic.recommendedAction}
                    </p>
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
