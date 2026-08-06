"use client";
import { useState } from "react";

type MethodologySource = "ServiceTitan" | "QuickBooks" | "Gusto" | "Twilio" | "Calendly" | "Multiple sources";

type MethodologyItem = {
  label: string;
  formula: string;
  source: MethodologySource;
  note: string;
};

const METHODOLOGY_ITEMS: MethodologyItem[] = [
  {
    label: "Enterprise Value",
    formula: "EBITDA × Industry Multiple",
    source: "QuickBooks",
    note: "EBITDA computed from P&L. Multiple driven by revenue scale (2-12x range based on HVAC industry benchmarks from GF Data and PitchBook).",
  },
  {
    label: "EBITDA",
    formula: "Revenue − COGS − Operating Expenses",
    source: "QuickBooks",
    note: "Pulled from connected QuickBooks or ServiceTitan P&L. Trailing 12 months.",
  },
  {
    label: "AR Aging",
    formula: "Sum of outstanding invoices by bucket",
    source: "QuickBooks",
    note: "Invoice-level data from QuickBooks accounts receivable ledger.",
  },
  {
    label: "Technician Utilization",
    formula: "Billable Hours / Available Hours",
    source: "ServiceTitan",
    note: "Job-level time tracking from ServiceTitan. Available hours = 40h/wk per technician.",
  },
  {
    label: "Acquisition Readiness Score",
    formula: "Weighted composite of 6 value drivers",
    source: "Multiple sources",
    note: "EBITDA margin (30%), revenue scale (20%), AR health (15%), tech utilization (10%), integration density (10%), profit leakage (15%).",
  },
  {
    label: "Roll-Up Multiple Expansion",
    formula: "Pro-forma EV / Pro-forma EBITDA",
    source: "Multiple sources",
    note: "Projects multiple expansion from current to ceiling based on synergies, scale, and market comparables.",
  },
];

export default function ValueMethodologyPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-950/60 p-5 shadow-xl shadow-black/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-400/10 text-xs text-brand-300">
            i
          </span>
          <h3 className="text-sm font-semibold text-white">How Enterprise Value Is Calculated</h3>
        </div>
        <span className={`text-sm text-surface-400 transition-transform ${expanded ? "rotate-180" : ""}`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-surface-400 leading-relaxed">
            Every metric on this page is computed from your connected operational and financial data. Below is how each metric is calculated and which data source it comes from.
          </p>

          {METHODOLOGY_ITEMS.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/5 bg-surface-900/30 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{item.label}</span>
                <span className="shrink-0 rounded bg-brand-400/10 px-2 py-0.5 text-[10px] font-medium text-brand-300">
                  {item.source}
                </span>
              </div>
              <p className="text-xs text-surface-500 font-mono mb-1">{item.formula}</p>
              <p className="text-xs text-surface-400 leading-relaxed">{item.note}</p>
            </div>
          ))}

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-surface-300 leading-relaxed">
            <span className="font-semibold text-amber-200">Data confidence:</span> Metrics shown use the most recently synced data.
            If a data source has not been connected or is stale, that metric will show &ldquo;Waiting for data&rdquo; and will not contribute to your valuation.
            Connect additional integrations in Settings → Integrations to improve score accuracy.
          </div>
        </div>
      )}
    </div>
  );
}
