"use client";
import type { ModelAssumption } from "@/lib/types/acquisition";

interface ModelAssumptionsCardProps {
  assumptions: ModelAssumption[];
}

export function ModelAssumptionsCard({ assumptions }: ModelAssumptionsCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/30 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
        Model Assumptions
      </h3>
      <div className="space-y-2">
        {assumptions.map((a, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400/50" />
            <div>
              <span className="text-surface-200 font-medium">{a.label}:</span>{" "}
              <span className="text-surface-400">{a.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
