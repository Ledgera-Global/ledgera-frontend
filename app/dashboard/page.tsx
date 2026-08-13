"use client";
import ActionPanel from "../../components/ActionPanel";
import AppHeader from "../../components/layouts/AppHeader";
import AuthGuard from "../../components/AuthGuard";
import BranchRankingsCard from "../../components/BranchRankingsCard";
import CashRunwayCard from "../../components/CashRunwayCard";
import DailyBriefCard from "../../components/DailyBriefCard";
import DashboardKpis from "../../components/DashboardKpis";
import EvTrackerCard from "../../components/EvTrackerCard";
import ExecutiveAlertsBanner from "../../components/analytics/ExecutiveAlertsBanner";
import ExecutiveRecommendationsCard from "../../components/ExecutiveRecommendationsCard";
import FounderStressIndexCard from "../../components/FounderStressIndexCard";
import InsightPanel from "../../components/InsightPanel";
import JobsTable from "../../components/JobsTable";
import LeadList from "../../components/LeadList";
import LocationSwitcher from "../../components/LocationSwitcher";
import OnboardingGuard from "../../components/OnboardingGuard";
import PipelineBar from "../../components/PipelineBar";
import ProfitLeakageFeed from "../../components/ProfitLeakageFeed";
import TechnicianPerformance from "../../components/TechnicianPerformance";
import { useAuth } from "../../lib/auth-context";

export default function Dashboard() {
  const { user, company } = useAuth();
  const companyId = user?.companyId ?? "";
  const companyName = company?.name ?? "";

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="flex min-h-screen flex-col bg-surface-950 text-surface-100">
          <AppHeader currentHref="/dashboard" />

          {/* Slim utility bar: location switcher + company badge */}
          <div className="fixed top-16 left-0 right-0 z-40 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-end gap-4 px-6 py-2 lg:px-10">
              <LocationSwitcher companyId={companyId} />
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">{user ? companyName : "Demo mode"}</span>
            </div>
          </div>

          <div className="flex-1 pt-[120px]">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="mb-6">
                <ExecutiveAlertsBanner companyId={companyId} />
              </div>

              {/* Founder-first: can I make payroll? + peace of mind first */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FounderStressIndexCard companyId={companyId} />
                <CashRunwayCard companyId={companyId} />
              </div>

              <div className="grid min-h-screen grid-cols-1 gap-6 lg:grid-cols-4">
                <aside className="border-b border-white/5 bg-surface-900/50 p-4 lg:col-span-1 lg:border-b-0 lg:border-r lg:border-white/5 lg:rounded-3xl">
                  <LeadList />
                </aside>

                <main className="flex min-w-0 flex-col gap-6 lg:col-span-2">
                  <DashboardKpis companyId={companyId} />
                  <InsightPanel lead={{ companyId, company: "Apex HVAC" }} />
                  <ProfitLeakageFeed companyId={companyId} />
                  <JobsTable companyId={companyId} />
                  <TechnicianPerformance companyId={companyId} />
                </main>

                <aside className="border-t border-white/5 bg-surface-900/50 p-4 lg:col-span-1 lg:border-t-0 lg:border-l lg:border-white/5 lg:rounded-3xl">
                  <ActionPanel />
                </aside>
              </div>

              {/* Institutional Cards */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <EvTrackerCard companyId={companyId} />
              </div>
              <div className="mt-6">
                <DailyBriefCard companyId={companyId} />
              </div>
              <div className="mt-6">
                <ExecutiveRecommendationsCard companyId={companyId} />
              </div>
              <div className="mt-6">
                <BranchRankingsCard companyId={companyId} />
              </div>
              <div className="mt-6 rounded-3xl border border-white/5 bg-surface-900/60 px-4 py-3">
                <PipelineBar />
              </div>
            </div>
          </div>
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
