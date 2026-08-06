"use client";
import type { ConfidenceInterval as CI } from "@/lib/types/acquisition";
import { fmt } from "@/lib/utils/format";

interface ConfidenceIntervalProps {
  confidence: CI;
  enterpriseValue: number;
}

export function ConfidenceInterval({ confidence, enterpriseValue }: ConfidenceIntervalProps) {
  const rangeWidth = confidence.high - confidence.low;
  const position = rangeWidth > 0 ? ((enterpriseValue - confidence.low) / rangeWidth) * 100 : 50;

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
        Estimated Enterprise Value
      </h4>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl font-bold text-white">{fmt(enterpriseValue)}</span>
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-400" />
            <span className="text-xs text-surface-300">Confidence</span>
            <span className="text-sm font-bold text-brand-300">{confidence.confidencePct}%</span>
          </div>
        </div>
      </div>

      {/* Range bar */}
      <div className="relative h-6 mt-2">
        <div className="absolute inset-0 top-2 h-2 rounded-full bg-surface-800" />
        <div
          className="absolute top-2 h-2 rounded-full bg-gradient-to-r from-brand-500/50 via-brand-400 to-brand-500/50"
          style={{
            left: `${((confidence.low - (confidence.low - rangeWidth * 0.1)) / (confidence.high - confidence.low + rangeWidth * 0.2)) * 100}%`,
            right: `${100 - ((confidence.high + rangeWidth * 0.1 - (confidence.low - rangeWidth * 0.1)) / (confidence.high - confidence.low + rangeWidth * 0.2)) * 100}%`,
          }}
        />
        <div
          className="absolute top-0 h-6 w-1 bg-white rounded-full transition-all"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        />
      </div>

      <div className="flex items-center justify-between mt-1 text-xs text-surface-500">
        <span>{fmt(confidence.low)}</span>
        <span>Range</span>
        <span>{fmt(confidence.high)}</span>
      </div>
    </div>
  );
}
