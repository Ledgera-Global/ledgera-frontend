"use client";
import ActionPanel from "../../components/ActionPanel";
import AuthGuard from "../../components/AuthGuard";
import BranchRankingsCard from "../../components/BranchRankingsCard";
import CashRunwayCard from "../../components/CashRunwayCard";
import DailyBriefCard from "../../components/DailyBriefCard";
import DashboardKpis from "../../components/DashboardKpis";
import EvTrackerCard from "../../components/EvTrackerCard";
import ExecutiveAlertsBanner from "../../components/analytics/ExecutiveAlertsBanner";
import ExecutiveRecommendationsCard from "../../components/ExecutiveRecommendationsCard";
import InsightPanel from "../../components/InsightPanel";
import JobsTable from "../../components/JobsTable";
import LeadList from "../../components/LeadList";
import Link from "next/link";
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
          <header className="border-b border-white/5 bg-surface-950/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-xs font-bold text-surface-950">L</span>
                <span className="text-sm font-semibold text-white">Ledgera Global</span>
              </Link>
              <div className="flex items-center gap-4">
                <LocationSwitcher companyId={companyId} />
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">{user ? companyName : "Demo mode"}</span>
                <Link href="/integrations" className="text-xs text-surface-400 hover:text-white transition-colors">Integrations</Link>
                <Link href="/analytics" className="text-xs text-surface-400 hover:text-white transition-colors">Analytics</Link>
                <Link href="/analytics/executive" className="text-xs text-surface-400 hover:text-white transition-colors">Executive</Link>
                <Link href="/analytics/acquisition" className="text-xs text-surface-400 hover:text-white transition-colors">Acquisition</Link>
                <Link href="/analytics/engines" className="text-xs text-surface-400 hover:text-white transition-colors">Engines</Link>
                <Link href="/analytics/institutional-risk" className="text-xs text-surface-400 hover:text-white transition-colors">Risk</Link>
                <Link href="/analytics/lender-readiness" className="text-xs text-surface-400 hover:text-white transition-colors">Lender Readiness</Link>
                <Link href="/analytics/value-growth" className="text-xs text-surface-400 hover:text-white transition-colors">Value Growth</Link>
                <Link href="/analytics/missed-calls" className="text-xs text-surface-400 hover:text-white transition-colors">Missed Calls</Link>
                <Link href="/" className="text-xs text-surface-400 hover:text-white transition-colors">Landing</Link>
              </div>
            </div>
          </header>

          <div className="flex-1">
            <div className="mx-auto max-w-7xl px-6 py-6">
              <div className="mb-6">
                <ExecutiveAlertsBanner companyId={companyId} />
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
                <CashRunwayCard companyId={companyId} />
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
