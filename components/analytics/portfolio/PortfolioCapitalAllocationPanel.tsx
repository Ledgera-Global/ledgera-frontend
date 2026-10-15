import PortfolioHealthPill from "./PortfolioHealthPill";
import type { CapitalAllocation } from "@/lib/types/portfolioOs";

import {
  formatPct,
  formatShare,
  formatUsd,
  formatUsdCompact,
} from "@/lib/portfolioOsDisplay";

/**
 * Where the next dollar of capital should go.
 *
 * The panel leads with the assumption rather than the answer. Opportunity here
 * is the size of each company's margin gap, not a forecast that it can be
 * closed: no timeline, probability, or cost of the operational work appears in
 * these numbers, and the backend says so in `note`. That caveat is rendered
 * immediately under the totals, before any target row, because a reader who
 * sees the dollar figures first will read them as a return.
 */
export default function PortfolioCapitalAllocationPanel({
  allocation,
}: {
  allocation: CapitalAllocation;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h2 className="text-lg font-semibold text-white">Capital allocation</h2>
      <p className="text-sm text-surface-500 mt-1">
        Ranked by the absolute dollar opportunity in each company, valued at{" "}
        {allocation.evMultiple}x EBITDA against a portfolio median margin of{" "}
        {formatPct(allocation.portfolioMedianMarginPct)}.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wider text-surface-500">
            Annual EBITDA opportunity
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {formatUsdCompact(allocation.totalAnnualEbitdaOpportunity)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wider text-surface-500">
            Enterprise value at mid case
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {formatUsdCompact(allocation.totalEvOpportunityMid)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wider text-surface-500">
            Already-identified cost optimization
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {formatUsdCompact(allocation.identifiedCostOptimization)}
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-6 text-amber-200/90">
        {allocation.note}
      </p>
      <p className="mt-2 text-xs leading-5 text-surface-500">
        {allocation.bandNote}
      </p>

      {allocation.targets.length === 0 ? (
        <p className="mt-5 text-sm text-surface-400">
          No company in this portfolio has measured operating data, so there is
          no capital allocation to rank.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
                <th className="px-3 py-3 font-medium text-right">Rank</th>
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Health</th>
                <th className="px-3 py-3 font-medium text-right">EBITDA Margin</th>
                <th className="px-3 py-3 font-medium text-right">Gap</th>
                <th className="px-3 py-3 font-medium text-right">Annual EBITDA</th>
                <th className="px-3 py-3 font-medium text-right">EV (low–high)</th>
                <th className="px-3 py-3 font-medium text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {allocation.targets.map((target) => (
                <tr
                  key={target.companyId}
                  className="border-b border-white/5 last:border-0 align-top hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-4 text-right text-surface-400 whitespace-nowrap">
                    {target.rank}
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-white">{target.companyName}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-surface-500">
                      {target.rationale}
                    </p>
                  </td>
                  <td className="px-3 py-4">
                    <PortfolioHealthPill health={target.health} />
                  </td>
                  <td className="px-3 py-4 text-right text-surface-200 whitespace-nowrap">
                    {formatPct(target.currentEbitdaMarginPct)}
                  </td>
                  <td className="px-3 py-4 text-right whitespace-nowrap">
                    {target.marginGapPct > 0 ? (
                      <span className="text-amber-300">
                        {formatPct(target.marginGapPct)}
                      </span>
                    ) : (
                      <span className="text-surface-500">
                        {formatPct(target.marginGapPct)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-right font-semibold text-white whitespace-nowrap">
                    {formatUsd(target.annualEbitdaOpportunity)}
                  </td>
                  <td className="px-3 py-4 text-right text-surface-300 whitespace-nowrap">
                    {formatUsdCompact(target.evOpportunityLow)} to{" "}
                    {formatUsdCompact(target.evOpportunityHigh)}
                  </td>
                  <td className="px-3 py-4 text-right text-surface-300 whitespace-nowrap">
                    {formatShare(target.shareOfOpportunity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {allocation.unmeasured.length > 0 && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <p className="text-xs uppercase tracking-wider text-surface-500">
            Not measured
          </p>
          <ul className="mt-2 space-y-2">
            {allocation.unmeasured.map((company) => (
              <li key={company.companyId} className="text-sm leading-6">
                <span className="text-surface-300">{company.companyName}</span>
                <span className="text-surface-500"> - {company.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
