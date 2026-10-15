"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import PortfolioCapitalAllocationPanel from "@/components/analytics/portfolio/PortfolioCapitalAllocationPanel";
import PortfolioCompanyTable from "@/components/analytics/portfolio/PortfolioCompanyTable";
import PortfolioPriorityList from "@/components/analytics/portfolio/PortfolioPriorityList";
import PortfolioStatTile from "@/components/analytics/portfolio/PortfolioStatTile";
import { useEffect, useState } from "react";
import { usePortfolioDashboard, usePortfolioList } from "@/lib/portfolio/usePortfolioOs";
import { ROLE_LABELS } from "@/lib/portfolioOsDisplay";

import {
  formatCount,
  formatPct,
  formatUsd,
  formatUsdCompact,
} from "@/lib/portfolioOsDisplay";

/**
 * Portfolio OS.
 *
 * The screen a GP opens to answer "which company in this portfolio needs the
 * next dollar, and why". Every figure is loaded from the scoped backend routes;
 * nothing here is computed in the browser, so this page cannot disagree with a
 * company's own dashboard.
 *
 * The two failure modes are deliberately rendered differently. An empty
 * portfolio says so and invites the user to add a company. A failed load says
 * the data is unavailable and offers no figures at all, because a portfolio
 * screen that silently showed zeros would read as a portfolio that lost
 * everything.
 */
export default function PortfolioOsPage() {
  const { portfolios, loading: listLoading, failed: listFailed } =
    usePortfolioList();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default to the first portfolio the caller belongs to once the list lands.
  useEffect(() => {
    if (selectedId === null && portfolios.length > 0) {
      setSelectedId(portfolios[0].portfolioId);
    }
  }, [portfolios, selectedId]);

  const { overview, companies, allocation, loading, failed } =
    usePortfolioDashboard(selectedId);

  const selected = portfolios.find((p) => p.portfolioId === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/portfolio-os" />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-3">
            Portfolio OS
          </h1>
          <p className="text-surface-400 max-w-2xl">
            Every company you hold, compared on the same measurements, ranked by
            where the next dollar earns most. Figures are computed from each
            company's own connected data; companies that have not synced are
            named rather than counted as zero.
          </p>
          <Link
            href="/analytics/portfolio-os/methodology"
            className="mt-3 inline-block text-sm text-brand-300 transition-colors hover:text-brand-200"
          >
            How these numbers are calculated
          </Link>
        </div>

        {listLoading && (
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
        )}

        {!listLoading && listFailed && (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-300 font-medium">
              Portfolio data is temporarily unavailable.
            </p>
            <p className="text-sm text-surface-500 mt-2">
              This is a loading failure, not an empty portfolio. No figures are
              shown rather than showing zeroes.
            </p>
          </div>
        )}

        {!listLoading && !listFailed && portfolios.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-300 font-medium">
              You are not a member of any portfolio yet.
            </p>
            <p className="text-sm text-surface-500 mt-2">
              A portfolio groups several companies under one comparison. Once
              you are added to one, it appears here.
            </p>
          </div>
        )}

        {!listLoading && !listFailed && portfolios.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {portfolios.length > 1 ? (
                  <label className="block">
                    <span className="mb-1 block text-xs uppercase tracking-wider text-surface-500">
                      Portfolio
                    </span>
                    <select
                      value={selectedId ?? ""}
                      onChange={(event) => setSelectedId(event.target.value)}
                      className="rounded-lg border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white"
                    >
                      {portfolios.map((portfolio) => (
                        <option
                          key={portfolio.portfolioId}
                          value={portfolio.portfolioId}
                        >
                          {portfolio.portfolioName} (
                          {formatCount(portfolio.companyCount)})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="text-lg font-semibold text-white">
                    {portfolios[0].portfolioName}
                  </p>
                )}
                {selected && (
                  <p className="mt-2 text-sm text-surface-500">
                    {ROLE_LABELS[selected.role]}
                  </p>
                )}
              </div>
            </div>

            {loading && (
              <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
            )}

            {!loading && failed && (
              <div className="rounded-2xl border border-white/10 p-8 text-center">
                <p className="text-surface-300 font-medium">
                  This portfolio's reports could not be loaded.
                </p>
                <p className="text-sm text-surface-500 mt-2">
                  No figures are shown rather than showing zeroes, because a
                  zeroed portfolio reads as a portfolio that lost everything.
                </p>
              </div>
            )}

            {!loading && !failed && overview && companies && allocation && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <PortfolioStatTile
                    label="Invoiced"
                    value={formatUsdCompact(overview.totals.invoiced)}
                    subtitle="Across every company in scope, including those without a report."
                  />
                  <PortfolioStatTile
                    label="Collected"
                    value={formatUsdCompact(overview.totals.collected)}
                    subtitle="Cash actually received against those invoices."
                    tone="positive"
                  />
                  <PortfolioStatTile
                    label="Uncollected"
                    value={formatUsdCompact(overview.totals.uncollected)}
                    subtitle="Invoiced less collected. The gap that decides whether payroll clears."
                    tone={
                      overview.totals.uncollected > 0 ? "warning" : "default"
                    }
                  />
                  <PortfolioStatTile
                    label="Blended EBITDA margin"
                    value={formatPct(overview.totals.blendedMarginPct)}
                    subtitle="EBITDA over revenue, measured across companies with data."
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-surface-500">Coverage</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatCount(overview.coverage.companiesWithData)} of{" "}
                        {formatCount(overview.coverage.totalCompanies)} companies
                        reporting
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-surface-500">
                        Revenue in report
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatUsd(overview.totals.revenue)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-6 text-surface-300">
                    {overview.note}
                  </p>
                </div>

                <PortfolioPriorityList
                  priorities={overview.priorities}
                  portfolioId={overview.portfolioId}
                />

                <PortfolioCompanyTable companies={companies.companies} />

                <PortfolioCapitalAllocationPanel allocation={allocation} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
