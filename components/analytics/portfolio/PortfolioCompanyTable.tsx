import PortfolioHealthPill from "./PortfolioHealthPill";
import type { PortfolioCompany } from "@/lib/types/portfolioOs";

import {
  formatCount,
  formatPct,
  formatUsd,
  NOT_MEASURED,
} from "@/lib/portfolioOsDisplay";

/**
 * The portfolio's operating companies, ranked by EBITDA margin.
 *
 * Rows with no data are shown last and at full width rather than hidden or
 * collapsed, because the point of this table in a holding-company context is
 * partly to reveal which companies have not synced. Hiding them would make a
 * portfolio of seven look like a portfolio of five that is doing fine.
 */
export default function PortfolioCompanyTable({
  companies,
}: {
  companies: PortfolioCompany[];
}) {
  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center">
        <p className="text-surface-400">
          This portfolio has no companies in it yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-white">
          Operating companies
        </h2>
        <p className="text-sm text-surface-500 mt-1">
          Ranked by EBITDA margin, the one ratio comparable across companies of
          different size. Companies with no completed jobs in the window are
          listed last and are excluded from every ranking.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-white/5 text-left text-xs uppercase tracking-wider text-surface-500">
              <th className="px-4 py-3 font-medium text-right">Rank</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Health</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
              <th className="px-4 py-3 font-medium text-right">Gross Margin</th>
              <th className="px-4 py-3 font-medium text-right">EBITDA</th>
              <th className="px-4 py-3 font-medium text-right">EBITDA Margin</th>
              <th className="px-4 py-3 font-medium text-right">Gap to Median</th>
              <th className="px-4 py-3 font-medium text-right">Jobs</th>
              <th className="px-6 py-3 font-medium">Top Issue</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const noData = company.health === "no_data";
              return (
                <tr
                  key={company.companyId}
                  className="border-b border-white/5 last:border-0 align-top hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4 text-right text-surface-400 whitespace-nowrap">
                    {company.marginRank ?? NOT_MEASURED}
                  </td>
                  <td className="px-4 py-4 font-medium text-white">
                    {company.name}
                  </td>
                  <td className="px-4 py-4">
                    <PortfolioHealthPill health={company.health} />
                  </td>
                  <td className="px-4 py-4 text-right text-surface-200 whitespace-nowrap">
                    {noData ? NOT_MEASURED : formatUsd(company.revenue)}
                  </td>
                  <td className="px-4 py-4 text-right text-surface-300 whitespace-nowrap">
                    {noData ? NOT_MEASURED : formatPct(company.grossMarginPct)}
                  </td>
                  <td className="px-4 py-4 text-right text-surface-200 whitespace-nowrap">
                    {noData ? NOT_MEASURED : formatUsd(company.ebitda)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-white whitespace-nowrap">
                    {noData ? NOT_MEASURED : formatPct(company.ebitdaMarginPct)}
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    {company.ebitdaGapToMedian === null ? (
                      <span className="text-surface-400">{NOT_MEASURED}</span>
                    ) : company.ebitdaGapToMedian > 0 ? (
                      <span className="text-red-300">
                        {formatUsd(company.ebitdaGapToMedian)}
                      </span>
                    ) : (
                      <span className="text-emerald-300">
                        {formatUsd(company.ebitdaGapToMedian)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-surface-300 whitespace-nowrap">
                    {noData ? NOT_MEASURED : formatCount(company.jobsAnalyzed)}
                  </td>
                  <td className="px-6 py-4 text-surface-400 leading-6 max-w-md">
                    {company.topIssue ?? (
                      <span className="text-surface-600">
                        No issue diagnosed.
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
