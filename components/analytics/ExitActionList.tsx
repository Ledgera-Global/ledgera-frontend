import { formatMultiple, formatUsd } from "@/lib/exitReadinessDisplay";
import type { ExitAction } from "@/lib/types/exitReadiness";

/**
 * The priced action list: what each measured gap is worth in multiple points
 * and in dollars. Ranked most valuable first by the engine, so the order is
 * never re-sorted here.
 */
export default function ExitActionList({ actions }: { actions: ExitAction[] }) {
  if (actions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-3">
          What Is On The Table
        </h3>
        <p className="text-sm text-surface-300">
          Every driver that can be measured already sits in its best band, so
          there is no priced gap left to close. Any remaining movement would come
          from drivers that cannot be measured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          What Is On The Table ({actions.length} gaps)
        </h3>
        <span className="text-xs text-surface-500">
          Ranked by dollars at today's earnings
        </span>
      </div>

      <ol className="space-y-4">
        {actions.map((action) => (
          <li
            key={action.driver}
            className="rounded-xl border border-white/10 bg-surface-950/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-white">
                  {action.label}
                </div>
                <div className="mt-1 text-xs text-surface-500">
                  Today: {action.currentDisplay}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-emerald-400">
                  {formatUsd(action.valueUplift)}
                </div>
                <div className="text-xs text-surface-500">
                  +{formatMultiple(action.multipleUplift)} multiple
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-surface-300">{action.whatToDo}</p>
            <p className="mt-2 text-xs text-surface-500">{action.rationale}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
