"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AcquisitionScoreCard } from "@/components/analytics/AcquisitionScoreCard";
import { DiligenceReportSection } from "@/components/analytics/DiligenceReportSection";
import { RollupStrategySection } from "@/components/analytics/RollupStrategySection";
import { ValuationHero } from "@/components/analytics/ValuationHero";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { NAV_LINKS } from "@/lib/constants/styling";

import {
  DEFAULT_ACQUISITION_SCORE,
  DEFAULT_DILIGENCE_REPORT,
  DEFAULT_VALUATION,
  DEFAULT_ROLLUP_STRATEGY,
} from "@/lib/data/defaults";
import type {
  AcquisitionScore,
  DiligenceReport,
  EnterpriseValuation,
  RollupStrategy,
} from "@/lib/types/acquisition";

const COMPANY_ID = "companyA";

export default function AcquisitionPage() {
  const [scrolled, setScrolled] = useState(false);
  const [acq, setAcq] = useState<AcquisitionScore>(DEFAULT_ACQUISITION_SCORE);
  const [dil, setDil] = useState<DiligenceReport>(DEFAULT_DILIGENCE_REPORT);
  const [val, setVal] = useState<EnterpriseValuation>(DEFAULT_VALUATION);
  const [rollup, setRollup] = useState<RollupStrategy>(DEFAULT_ROLLUP_STRATEGY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const [a, d, v, r] = await Promise.all([
        fetchJson(`/api/acquisition/${COMPANY_ID}`, DEFAULT_ACQUISITION_SCORE),
        fetchJson(`/api/diligence/${COMPANY_ID}`, DEFAULT_DILIGENCE_REPORT),
        fetchJson(`/api/enterprise-valuation/${COMPANY_ID}`, DEFAULT_VALUATION),
        fetchJson(`/api/rollup-advisor/${COMPANY_ID}`, DEFAULT_ROLLUP_STRATEGY),
      ]);
      setAcq(a);
      setDil(d);
      setVal(v);
      setRollup(r);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
              L
            </span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/analytics/acquisition"
                    ? "text-white"
                    : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-3">
              Enterprise Valuation & Acquisition Readiness
            </h1>
            <p className="max-w-2xl text-base text-surface-300">
              Real-time enterprise value computed from your connected operational data.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-8">
              <ValuationHero val={val} />
              <RollupStrategySection rollup={rollup} />
              <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2 space-y-6">
                  <AcquisitionScoreCard acq={acq} />
                </div>
                <div className="lg:col-span-3 space-y-6">
                  <DiligenceReportSection dil={dil} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} Ledgera Global Inc.
          </span>
          <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">
            Landing
          </Link>
        </div>
      </footer>
    </div>
  );
}
