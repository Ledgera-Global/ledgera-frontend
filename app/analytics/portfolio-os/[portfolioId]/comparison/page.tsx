"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import PortfolioComparisonTable from "@/components/analytics/portfolio/PortfolioComparisonTable";
import { useParams } from "next/navigation";
import { usePortfolioComparison } from "@/lib/portfolio/usePortfolioOs";

/**
 * Cross-company comparison for one portfolio.
 *
 * A page of its own rather than a section of the dashboard, because it is the
 * screen read side by side with the underlying company reports: the matrix
 * should be able to occupy the full width when someone is checking a figure
 * against the company's own page.
 */
export default function PortfolioComparisonPage() {
  const params = useParams<{ portfolioId: string }>();
  const portfolioId = params?.portfolioId ?? "";
  const { comparison, loading, failed } = usePortfolioComparison(portfolioId);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/portfolio-os" />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="mb-8">
          <Link
            href="/analytics/portfolio-os"
            className="text-sm text-brand-300 transition-colors hover:text-brand-200"
          >
            Back to Portfolio OS
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-white mb-3">
            Cross-company comparison
          </h1>
          <p className="text-surface-400 max-w-2xl">
            Every company in this portfolio on the same columns, with the
            portfolio median beside them. Columns the backend ranked on are the
            columns shown, and each one states its own basis.
          </p>
        </div>

        {loading && (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        )}

        {!loading && failed && (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-300 font-medium">
              This comparison could not be loaded.
            </p>
            <p className="text-sm text-surface-500 mt-2">
              Either the portfolio is not available to you, or the data service
              is unreachable. No table is shown rather than an empty one, since
              an empty table reads as a portfolio with nothing in it.
            </p>
          </div>
        )}

        {!loading && !failed && comparison && (
          <PortfolioComparisonTable comparison={comparison} />
        )}
      </main>
    </div>
  );
}
