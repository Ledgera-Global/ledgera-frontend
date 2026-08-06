"use client";
import type { InstitutionalReadiness, ReadinessCategory } from "@/lib/types/acquisition";

interface ReadinessBadgeProps {
  data: InstitutionalReadiness;
}

const statusConfig = {
  healthy: { color: "bg-brand-400", label: "Healthy" },
  attention: { color: "bg-amber-400", label: "Needs Attention" },
  critical: { color: "bg-red-400", label: "Critical" },
};

export function ReadinessBadge({ data }: ReadinessBadgeProps) {
  const pct = data.maxScore > 0 ? (data.overallScore / data.maxScore) * 100 : 0;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-500/[0.06] to-white/[0.02] p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
        Institutional Readiness
      </h3>

      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-5xl font-bold text-white">{data.overallScore}</span>
        <span className="text-base text-surface-400">/ {data.maxScore}</span>
      </div>
      <p className="text-sm text-surface-300 mb-4">{data.actionableNextStep}</p>

      {/* Score bar */}
      <div className="relative h-2.5 w-full rounded-full bg-surface-800 mb-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 via-brand-400 to-emerald-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Category scores */}
      <div className="space-y-3">
        {data.categories.map((cat) => (
          <CategoryRow key={cat.label} cat={cat} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ cat }: { cat: ReadinessCategory }) {
  const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
  const cfg = statusConfig[cat.status];

  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm text-surface-200 truncate">{cat.label}</span>
          <span className="text-xs text-surface-400">{cat.score}/{cat.maxScore}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-800">
          <div
            className={`h-full rounded-full transition-all ${cfg.color.replace("bg-", "bg-")}/70`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
