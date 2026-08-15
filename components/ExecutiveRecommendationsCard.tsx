"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type Recommendation = {
  type: "revenue" | "cost" | "efficiency" | "risk";
  priority: number;
  title: string;
  detail: string;
  action: string;
  estimatedImpact: number;
};

type ExecutiveRecommendationsData = {
  recommendations: Recommendation[];
};

const FALLBACK: ExecutiveRecommendationsData = {
  recommendations: [
    {
      type: "revenue",
      priority: 1,
      title: "Increase membership pricing 15%",
      detail: "Current membership fees are 22% below market average for comparable HVAC service areas, leaving $340K/yr on the table.",
      action: "Adjust pricing tiers for new members, grandfather existing for 6 months.",
      estimatedImpact: 340_000,
    },
    {
      type: "cost",
      priority: 2,
      title: "Consolidate fleet routes in Dallas metro",
      detail: "Dispatch overlap between North and East branches causes $18K/mo in excess fuel and overtime.",
      action: "Merge dispatch zones and reduce fleet by 2 trucks.",
      estimatedImpact: 216_000,
    },
    {
      type: "efficiency",
      priority: 3,
      title: "Automate callback follow-up sequence",
      detail: "Manual callback scheduling absorbs 9 hrs/week per dispatcher, with 31% of callbacks never scheduled.",
      action: "Implement automated SMS/email callback booking system.",
      estimatedImpact: 95_000,
    },
    {
      type: "risk",
      priority: 4,
      title: "Key technician retention program",
      detail: "Two senior techs flagged for competing offers - replacement cost estimated at $45K per hire.",
      action: "Offer retention bonus and expedited promotion path.",
      estimatedImpact: 90_000,
    },
  ],
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function typeIcon(type: string) {
  switch (type) {
    case "revenue":
      return (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "cost":
      return (
        <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "efficiency":
      return (
        <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "risk":
      return (
        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    default:
      return null;
  }
}

type Props = { companyId: string };

export default function ExecutiveRecommendationsCard({ companyId }: Props) {
  const [data, setData] = useState<ExecutiveRecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/executive-recommendations/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<ExecutiveRecommendationsData>(url, FALLBACK);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          Executive Recommendations
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Executive Recommendations
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-24 w-full rounded bg-surface-800" />
            <div className="h-24 w-full rounded bg-surface-800" />
          </div>
        ) : (
          <div className="space-y-4">
            {d.recommendations
              .slice()
              .sort((a, b) => a.priority - b.priority)
              .map((rec) => (
                <div
                  key={rec.priority}
                  className="rounded-2xl border border-white/5 bg-surface-900/40 p-4 transition hover:bg-surface-900/60"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-800/60">
                      {typeIcon(rec.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-semibold text-brand-400">
                          #{rec.priority}
                        </span>
                        <h3 className="text-sm font-semibold text-white">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-surface-300">
                        {rec.detail}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-800/50 px-3 py-1 text-xs text-surface-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          {rec.action}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                          +{fmt(rec.estimatedImpact)} impact
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}