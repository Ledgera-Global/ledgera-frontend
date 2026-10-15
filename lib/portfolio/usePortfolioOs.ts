"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

import type {
  CapitalAllocation,
  PortfolioCompaniesResponse,
  PortfolioComparison,
  PortfolioListResponse,
  PortfolioMembershipSummary,
  PortfolioOverview,
} from "@/lib/types/portfolioOs";

/**
 * Data loading for the Portfolio OS screens.
 *
 * Kept out of the page components so the loading rules are stated once: every
 * fetch passes a `null` fallback, and `null` is rendered as an explicit failure
 * rather than as an empty portfolio. An empty portfolio and an unreachable
 * backend look identical if you treat a failed load as zero companies, and on a
 * screen that decides where capital goes, that is the one confusion worth
 * designing against.
 */

export interface PortfolioListState {
  portfolios: PortfolioMembershipSummary[];
  loading: boolean;
  failed: boolean;
}

/** The portfolios the caller belongs to. Drives the picker. */
export function usePortfolioList(): PortfolioListState {
  const [portfolios, setPortfolios] = useState<PortfolioMembershipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchJson<PortfolioListResponse | null>(
        "/api/portfolio",
        null
      );
      if (cancelled) return;
      if (result === null) {
        setFailed(true);
      } else {
        setPortfolios(result.portfolios);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { portfolios, loading, failed };
}

export interface PortfolioDashboardState {
  overview: PortfolioOverview | null;
  companies: PortfolioCompaniesResponse | null;
  allocation: CapitalAllocation | null;
  loading: boolean;
  failed: boolean;
}

/**
 * The three panels of the dashboard for one portfolio, loaded in parallel.
 *
 * All three come from the same scoped company set, so they are fetched together
 * and reported together: a page showing an overview from one portfolio beside a
 * capital allocation from another would be worse than a page showing neither.
 */
export function usePortfolioDashboard(
  portfolioId: string | null
): PortfolioDashboardState {
  const [overview, setOverview] = useState<PortfolioOverview | null>(null);
  const [companies, setCompanies] = useState<PortfolioCompaniesResponse | null>(
    null
  );
  const [allocation, setAllocation] = useState<CapitalAllocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (id: string, cancelled: () => boolean) => {
    setLoading(true);
    setFailed(false);
    const base = `/api/portfolio/${encodeURIComponent(id)}`;
    const [overviewResult, companiesResult, allocationResult] =
      await Promise.all([
        fetchJson<PortfolioOverview | null>(`${base}/overview`, null),
        fetchJson<PortfolioCompaniesResponse | null>(`${base}/companies`, null),
        fetchJson<CapitalAllocation | null>(`${base}/capital-allocation`, null),
      ]);
    if (cancelled()) return;
    if (
      overviewResult === null ||
      companiesResult === null ||
      allocationResult === null
    ) {
      setFailed(true);
    } else {
      setOverview(overviewResult);
      setCompanies(companiesResult);
      setAllocation(allocationResult);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!portfolioId) {
      setOverview(null);
      setCompanies(null);
      setAllocation(null);
      setLoading(false);
      setFailed(false);
      return;
    }
    let isCancelled = false;
    void load(portfolioId, () => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [portfolioId, load]);

  return { overview, companies, allocation, loading, failed };
}

/** One comparison matrix for one portfolio. */
export function usePortfolioComparison(portfolioId: string) {
  const [comparison, setComparison] = useState<PortfolioComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFailed(false);
      const result = await fetchJson<PortfolioComparison | null>(
        `/api/portfolio/${encodeURIComponent(portfolioId)}/comparison`,
        null
      );
      if (cancelled) return;
      if (result === null) {
        setFailed(true);
      } else {
        setComparison(result);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  return { comparison, loading, failed };
}
