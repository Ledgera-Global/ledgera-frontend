"use client";
import AppHeader from "@/components/layouts/AppHeader";
import CapitalAllocationCard from "@/components/CapitalAllocationCard";
import { useAuth } from "@/lib/auth-context";

export default function CapitalPage() {
  const { user } = useAuth();
  const COMPANY_ID = user?.companyId || "companyA";

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/capital" />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16 lg:px-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white">Capital Intelligence</h1>
          <p className="mt-2 max-w-3xl text-base text-surface-300">
            Every dollar flowing through the company, continuously analyzed:
            where capital is wasted, where it produces returns, and where to
            redeploy it for enterprise value. Recommendations carry evidence,
            expected impact, and confidence — nothing changes without your approval.
          </p>
        </div>

        <CapitalAllocationCard companyId={COMPANY_ID} />

        <div className="mt-8 rounded-2xl border border-white/10 bg-surface-900/40 p-6 text-sm text-surface-400">
          <p className="font-semibold text-surface-200">Methodology</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Waste findings come from recurring-cadence detection, duplicate-subscription overlap, marketing attribution (only when real revenue links exist), and statistical expense anomalies over live accounting/payroll data.</li>
            <li>Protective spend — insurance, regulatory fees, rent — is classified separately and never flagged as waste.</li>
            <li>Opportunity EBITDA impacts are estimates; enterprise-value impact is shown as a range (0.75×–1.25× of ΔEBITDA × your current multiple), never a single fake-precise number.</li>
            <li>Approve or decline actions in the Agents feed; realized dollar impact is tracked on every implemented recommendation.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
