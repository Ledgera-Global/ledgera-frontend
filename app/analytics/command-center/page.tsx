"use client";
import AppHeader from "@/components/layouts/AppHeader";
import BranchRankingsCard from "@/components/BranchRankingsCard";
import BusinessAdvisorCard from "@/components/BusinessAdvisorCard";
import CashRunwayCard from "@/components/CashRunwayCard";
import DailyBriefCard from "@/components/DailyBriefCard";
import EvTrackerCard from "@/components/EvTrackerCard";
import ExecutiveRecommendationsCard from "@/components/ExecutiveRecommendationsCard";
import FounderStressIndexCard from "@/components/FounderStressIndexCard";
import { useAuth } from "@/lib/auth-context";

export default function CommandCenterPage() {
  const { user } = useAuth();
  const COMPANY_ID = user?.companyId || "companyA";

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/command-center" />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white">Command Center</h1>
          <p className="mt-2 max-w-3xl text-base text-surface-300">
            The first screen an owner sees each morning. Cash, payroll, stress,
            branches, recommendations, enterprise value, the AI daily brief, and
            the advisor - one place for confident decisions without digging through
            reports.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FounderStressIndexCard companyId={COMPANY_ID} />
          <CashRunwayCard companyId={COMPANY_ID} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DailyBriefCard companyId={COMPANY_ID} />
          <EvTrackerCard companyId={COMPANY_ID} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <BranchRankingsCard companyId={COMPANY_ID} />
          <ExecutiveRecommendationsCard companyId={COMPANY_ID} />
        </div>

        <div className="mt-6">
          <BusinessAdvisorCard companyId={COMPANY_ID} />
        </div>
      </main>
    </div>
  );
}
