"use client";
import ArCollectionRecommendations from "@/components/analytics/ArCollectionRecommendations";
import EvTrackerCard from "@/components/EvTrackerCard";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
import Link from "next/link";
import ValueMethodologyPanel from "@/components/analytics/ValueMethodologyPanel";
import { useEffect, useState } from "react";
import { AcquisitionScoreCard } from "@/components/analytics/AcquisitionScoreCard";
import { ConfidenceInterval } from "@/components/analytics/ConfidenceInterval";
import { DiligenceReportSection } from "@/components/analytics/DiligenceReportSection";
import { LiveEvCard } from "@/components/analytics/LiveEvCard";
import { MultiplePotentialChart } from "@/components/analytics/MultiplePotentialChart";
import { ReadinessBadge } from "@/components/analytics/ReadinessBadge";
import { RollupStrategySection } from "@/components/analytics/RollupStrategySection";
import { ValuationHero } from "@/components/analytics/ValuationHero";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { NAV_LINKS } from "@/lib/constants/styling";

import {
  DEFAULT_ACQUISITION_SCORE,
  DEFAULT_DILIGENCE_REPORT,
  DEFAULT_VALUATION,
  DEFAULT_ROLLUP_STRATEGY,
  DEFAULT_MULTIPLE_POTENTIAL,
  DEFAULT_READINESS,
} from "@/lib/data/defaults";
import type {
  AcquisitionScore,
  DiligenceReport,
  EnterpriseValuation,
  RollupStrategy,
  LiveEvData,
  MultiplePotential,
  InstitutionalReadiness,
} from "@/lib/types/acquisition";

export default function AcquisitionPage() {
  const { user } = useAuth();
  const COMPANY_ID = user?.companyId || "companyA";
  const [scrolled, setScrolled] = useState(false);
  const [acq, setAcq] = useState<AcquisitionScore>(DEFAULT_ACQUISITION_SCORE);
  const [dil, setDil] = useState<DiligenceReport>(DEFAULT_DILIGENCE_REPORT);
  const [val, setVal] = useState<EnterpriseValuation>(DEFAULT_VALUATION);
  const [rollup, setRollup] = useState<RollupStrategy>(DEFAULT_ROLLUP_STRATEGY);
  const [multiplePot, setMultiplePot] = useState<MultiplePotential>(DEFAULT_MULTIPLE_POTENTIAL);
  const [readiness, setReadiness] = useState<InstitutionalReadiness>(DEFAULT_READINESS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"investment" | "operational">("investment");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const [a, d, v, r, m] = await Promise.all([
        fetchJson(`/api/acquisition/${COMPANY_ID}`, DEFAULT_ACQUISITION_SCORE),
        fetchJson(`/api/diligence/${COMPANY_ID}`, DEFAULT_DILIGENCE_REPORT),
        fetchJson(`/api/enterprise-valuation/${COMPANY_ID}`, DEFAULT_VALUATION),
        fetchJson(`/api/rollup-advisor/${COMPANY_ID}`, DEFAULT_ROLLUP_STRATEGY),
        fetchJson(`/api/multiple-potential/${COMPANY_ID}`, DEFAULT_MULTIPLE_POTENTIAL),
      ]);
      setAcq(a);
      setDil(d);
      setVal(v);
      setRollup(r);
      setMultiplePot(m);
      setReadiness(DEFAULT_READINESS);
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
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
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
            <InstitutionalNav currentHref="/analytics/acquisition" />
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Page header */}
          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-white mb-3">
              Institutional Investment Platform
            </h1>
            <p className="max-w-2xl text-base text-surface-300">
              Enterprise valuation, acquisition readiness, and roll-up strategy powered by live operational data.
              Built for private equity, lenders, and acquisition teams.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <>
              {/* ── TOP PRIORITY: The "Hero" section — EV, EBITDA, Multiple dominate ── */}
              <div className="grid gap-8 lg:grid-cols-3 mb-12">
                <div className="lg:col-span-2">
                  <ValuationHero val={val} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <LiveEvCard companyId={COMPANY_ID} />
                  <ConfidenceInterval
                    confidence={val.valuation.confidence}
                    enterpriseValue={val.valuation.enterpriseValue}
                  />
                </div>
              </div>

              {/* ── Tabbed view: Investment Intelligence vs Operational Intelligence ── */}
              <div className="flex items-center gap-4 border-b border-white/10 mb-10 pb-2">
                <button
                  onClick={() => setActiveTab("investment")}
                  className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === "investment"
                      ? "text-brand-300 border-brand-400"
                      : "text-surface-400 border-transparent hover:text-surface-200"
                  }`}
                >
                  Investment Intelligence
                </button>
                <button
                  onClick={() => setActiveTab("operational")}
                  className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === "operational"
                      ? "text-brand-300 border-brand-400"
                      : "text-surface-400 border-transparent hover:text-surface-200"
                  }`}
                >
                  Operational Intelligence
                </button>
              </div>

              {activeTab === "investment" ? (
                /* ── INVESTMENT INTELLIGENCE TAB ── */
                <div className="space-y-12">
                  {/* Multiple Potential & Readiness */}
                  <div className="grid gap-8 lg:grid-cols-2">
                    <MultiplePotentialChart data={multiplePot} />
                    <ReadinessBadge data={readiness} />
                  </div>

                  {/* Roll-Up Strategy with synergy breakdown and model assumptions */}
                  <RollupStrategySection rollup={rollup} />

                  {/* Value Methodology Panel */}
                  <ValueMethodologyPanel />

                  {/* EvTrackerCard */}
                  <EvTrackerCard companyId={COMPANY_ID} />
                </div>
              ) : (
                /* ── OPERATIONAL INTELLIGENCE TAB ── */
                <div className="space-y-8">
                  {/* Acquisition Score + Diligence */}
                  <div className="grid gap-8 lg:grid-cols-5">
                    <div className="lg:col-span-2 space-y-6">
                      <AcquisitionScoreCard acq={acq} />
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                      <DiligenceReportSection dil={dil} />
                    </div>
                  </div>

                  <ArCollectionRecommendations companyId={COMPANY_ID} />
                </div>
              )}
            </>
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
