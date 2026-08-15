"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";
import type { EnterpriseValueGrowthPlan } from "@/lib/types/acquisition";

const COMPANY_ID = "companyA";

const effortColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  high: "bg-red-500/20 text-red-300",
};

const categoryLabels: Record<string, string> = {
  calls: "Call Center",
  dispatch: "Dispatch",
  install_margin: "Install Margin",
  maintenance: "Maintenance",
  technician: "Technician",
  pricing: "Pricing",
  ar: "AR",
  integration: "Integration",
};

export default function ValueGrowthPage() {
  const [plan, setPlan] = useState<EnterpriseValueGrowthPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchJson(`/api/growth-plan/${COMPANY_ID}`, null);
      setPlan(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/value-growth" />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-3">Enterprise Value Growth Plan</h1>
          <p className="text-surface-400 max-w-2xl">
            Ranked operational improvements ordered by enterprise value impact. Each priority includes diagnosis and prescription.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : plan ? (
          <>
            {/* Summary card */}
            <div className="mb-8 rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-6">
              <p className="text-surface-200 text-lg leading-relaxed">{plan.summary}</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold text-white">${(plan.currentEnterpriseValue / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-surface-400 mt-1">Current Enterprise Value</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold text-brand-300">${(plan.potentialEnterpriseValue / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-surface-400 mt-1">Potential Enterprise Value</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">+${(plan.valueCreationGap / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-surface-400 mt-1">Value Creation Opportunity</p>
                </div>
              </div>
            </div>

            {/* Priority cards */}
            <div className="space-y-6">
              {plan.priorities.map((p) => (
                <div key={p.rank} className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 text-sm font-bold">
                        {p.rank}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                        <span className="inline-flex items-center gap-2 mt-1">
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-surface-400">
                            {categoryLabels[p.category] || p.category}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${effortColors[p.effort]}`}>
                            {p.effort} effort
                          </span>
                          <span className="text-xs text-surface-500">{p.timeframe}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xs text-surface-500 mb-1">Current</p>
                      <p className="text-sm font-medium text-surface-200">{p.currentMetric}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xs text-surface-500 mb-1">Target</p>
                      <p className="text-sm font-medium text-brand-300">{p.targetMetric}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <p className="text-xs text-surface-500 mb-1">EV Impact</p>
                      <p className="text-sm font-medium text-green-400">+${(p.expectedEnterpriseValueImpact / 1e6).toFixed(1)}M</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-1">Diagnosis</p>
                      <p className="text-sm text-surface-300">{p.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-400 mb-1">Prescription</p>
                      <p className="text-sm text-surface-300">{p.prescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EBITDA detail */}
            <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <p className="text-xs text-surface-500">
                Current EBITDA: ${(plan.currentEbitda / 1e3).toFixed(0)}K &middot; Multiple: {plan.currentMultiple}x
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-surface-400">Failed to load growth plan data.</p>
          </div>
        )}
      </main>
    </div>
  );
}
