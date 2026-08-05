"use client";
import { RiskBadge } from "@/components/analytics/RiskBadge";
import type { DiligenceReport } from "@/lib/types/acquisition";
import { formatReportDate } from "@/lib/utils/format";

interface DiligenceReportSectionProps {
  dil: DiligenceReport;
}

export function DiligenceReportSection({ dil }: DiligenceReportSectionProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Due Diligence Report</h2>
        <span className="text-xs text-surface-400">Generated {formatReportDate(dil.generatedAt)}</span>
      </div>
      <div className="mb-6 rounded-xl border border-white/10 bg-surface-900/40 p-4">
        <p className="text-sm text-surface-300 leading-6">{dil.summary}</p>
      </div>
      <div className="space-y-4">
        {dil.sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-white/10 bg-surface-900/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              <RiskBadge level={section.riskLevel} />
            </div>
            <ul className="space-y-2">
              {section.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                  <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-surface-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
