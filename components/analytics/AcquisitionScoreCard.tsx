"use client";
import { Gauge } from "@/components/analytics/Gauge";
import { acquisitionScoreColor, acquisitionScoreLabel } from "@/lib/constants/styling";
import type { AcquisitionScore } from "@/lib/types/acquisition";

interface AcquisitionScoreCardProps {
  acq: AcquisitionScore;
}

export function AcquisitionScoreCard({ acq }: AcquisitionScoreCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Acquisition Score</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-sm font-semibold ${acq.scoreTrend >= 0 ? "text-brand-400" : "text-red-400"}`}>
              {acq.scoreTrend >= 0 ? "↑" : "↓"} +{Math.abs(acq.scoreTrend)} this month
            </span>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${acquisitionScoreColor(acq.score)}`}>
          {acquisitionScoreLabel(acq.score)}
        </span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <Gauge score={acq.score} />
        <p className="text-center text-sm text-surface-300 leading-6">{acq.recommendation}</p>
        <div className="w-full space-y-3 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">Supporting Signals</h3>
          {acq.signals.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-surface-900/40 p-3">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/10 text-[11px] font-bold text-brand-300">{i + 1}</span>
              <span className="text-sm text-surface-300">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
