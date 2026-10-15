import Link from "next/link";
import { formatUsd } from "@/lib/portfolioOsDisplay";
import type { PortfolioPriority } from "@/lib/types/portfolioOs";

/**
 * The ranked answer to "which company do I fix first, and why".
 *
 * Ordered by absolute dollar gap, not by margin percentage, because a holding
 * company deploys dollars and the largest gap in dollars is where a dollar of
 * attention earns most. Each row states its own reason in the backend's words
 * rather than a shortened label, so the ranking can be argued with.
 */
export default function PortfolioPriorityList({
  priorities,
  portfolioId,
}: {
  priorities: PortfolioPriority[];
  portfolioId: string;
}) {
  if (priorities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Where to act first</h2>
        <p className="text-sm text-surface-500 mt-2">
          No company in this portfolio is currently below the portfolio median
          margin by a measurable amount, so there is no ranked action to show.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Where to act first
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Ranked by annualized EBITDA gap to the portfolio median, largest
            dollar gap first. A big company two points below median outranks a
            small one ten points below.
          </p>
        </div>
        <Link
          href={`/analytics/portfolio-os/${encodeURIComponent(portfolioId)}/comparison`}
          className="rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1.5 text-sm font-medium text-brand-100 transition-colors hover:border-brand-400/50 hover:bg-brand-500/20"
        >
          Cross-company comparison
        </Link>
      </div>

      <ol className="mt-5 space-y-3">
        {priorities.map((priority, index) => (
          <li
            key={priority.companyId}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-medium text-white">
                <span className="mr-2 text-surface-500">{index + 1}.</span>
                {priority.companyName}
              </p>
              <p className="font-semibold text-amber-300 whitespace-nowrap">
                {formatUsd(priority.estimatedAnnualEbitdaLift)}
                <span className="ml-1 text-xs font-normal text-surface-500">
                  a year
                </span>
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-surface-400">
              {priority.reason}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
