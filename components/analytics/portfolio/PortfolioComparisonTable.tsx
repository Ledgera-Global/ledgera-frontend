import PortfolioHealthPill from "./PortfolioHealthPill";
import type { PortfolioComparison } from "@/lib/types/portfolioOs";

import {
  formatByUnit,
  formatCount,
  NOT_MEASURED,
} from "@/lib/portfolioOsDisplay";

/**
 * The cross-company comparison matrix.
 *
 * Columns come from the backend, not from this component, so the matrix shows
 * exactly the columns the ranking is computed on and cannot silently drop one.
 * Each column header carries its basis: a figure like "Gross Margin" means
 * something specific here (gross profit over revenue, where gross profit is
 * revenue less labor and material), and offhand it could mean two other things.
 *
 * The median row is the reason this table exists. A company's own number says
 * little until it sits next to the portfolio's, and the medians are computed by
 * the backend over companies that actually measured the column, never counting
 * a blank as zero.
 */
export default function PortfolioComparisonTable({
  comparison,
}: {
  comparison: PortfolioComparison;
}) {
  const { columns, rows, medians, rankBy, withData, totalCompanies, note } =
    comparison;

  const rankIndex = columns.findIndex((column) => column.key === rankBy);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-white">
          Cross-company comparison
        </h2>
        <p className="text-sm text-surface-500 mt-1">{note}</p>
        <p className="text-xs text-surface-500 mt-2">
          {withData} of {totalCompanies}{" "}
          {totalCompanies === 1 ? "company" : "companies"} measured. Ranked by{" "}
          {columns[rankIndex]?.label.toLowerCase() ?? rankBy}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-white/5 text-left align-bottom text-xs uppercase tracking-wider text-surface-500">
              <th className="px-4 py-3 font-medium text-right">Rank</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Health</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 font-medium text-right"
                >
                  <span className="block">{column.label}</span>
                  <span className="mt-1 block max-w-[16rem] whitespace-normal text-[10px] font-normal normal-case tracking-normal text-surface-600">
                    {column.basis}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.companyId}
                className="border-b border-white/5 last:border-0 align-top hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4 text-right text-surface-400 whitespace-nowrap">
                  {row.rank ?? NOT_MEASURED}
                </td>
                <td className="px-4 py-4 font-medium text-white whitespace-nowrap">
                  {row.companyName}
                </td>
                <td className="px-4 py-4">
                  <PortfolioHealthPill health={row.health} />
                </td>
                {columns.map((column, columnIndex) => {
                  const value = row.values[columnIndex];
                  return (
                    <td
                      key={column.key}
                      className="px-4 py-4 text-right text-surface-200 whitespace-nowrap"
                    >
                      {value === null || value === undefined
                        ? NOT_MEASURED
                        : formatByUnit(value, column.unit)}
                    </td>
                  );
                })}
              </tr>
            ))}

            {rows.length > 0 && (
              <tr className="border-t border-white/10 bg-white/[0.03]">
                <td className="px-4 py-4" />
                <td className="px-4 py-4 font-medium text-surface-300 whitespace-nowrap">
                  Portfolio median
                </td>
                <td className="px-4 py-4 text-xs text-surface-500">
                  {withData} measured
                </td>
                {columns.map((column, columnIndex) => {
                  const value = medians[columnIndex];
                  return (
                    <td
                      key={column.key}
                      className="px-4 py-4 text-right font-semibold text-white whitespace-nowrap"
                    >
                      {value === null || value === undefined
                        ? NOT_MEASURED
                        : formatByUnit(value, column.unit)}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="px-6 pb-6 text-sm text-surface-400">
          This portfolio has no companies in it yet, so there is nothing to
          compare.
        </p>
      )}

      <p className="px-6 pb-6 pt-2 text-xs leading-5 text-surface-500">
        {formatCount(totalCompanies)} companies compared. A blank cell means the
        company measured nothing for that column; it is excluded from the median
        rather than counted as zero, because a zero would pull the median toward
        a company that never reported.
      </p>
    </div>
  );
}
