import { formatLayers } from "@/lib/networkCoverageDisplay";
import type { QuestionAnswerability } from "@/lib/types/networkCoverage";

/**
 * The questions an owner actually asks, split into what the data can answer
 * today and what it cannot.
 *
 * A blocked question shows the blocker, never a best-effort answer. An owner
 * acts on whatever the screen tells them, so a number produced from two thirds
 * of the inputs is worse than an honest refusal.
 */
export default function QuestionCoverageList({
  answerable,
  blocked,
}: {
  answerable: QuestionAnswerability[];
  blocked: QuestionAnswerability[];
}) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          Answerable now ({answerable.length})
        </h3>
        {answerable.length === 0 ? (
          <p className="mt-2 text-sm text-surface-400">
            No question has every layer it needs yet. The blocked list below says what
            each one is waiting for.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {answerable.map((item) => (
              <li
                key={item.question.id}
                className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{item.question.question}</p>
                  <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    Maturity {item.question.maturity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-surface-400">
                  Decides: {item.question.decision}
                </p>
                <p className="mt-2 text-xs text-surface-500">
                  Built from {formatLayers(item.satisfiedLayers)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          Blocked ({blocked.length})
        </h3>
        {blocked.length === 0 ? (
          <p className="mt-2 text-sm text-surface-400">
            Every question in the catalogue is answerable with the layers connected today.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {blocked.map((item) => (
              <li
                key={item.question.id}
                className="rounded-2xl border border-white/10 bg-surface-900/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{item.question.question}</p>
                  <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                    Missing {formatLayers(item.missingLayers)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-surface-400">
                  Decides: {item.question.decision}
                </p>
                {item.blocker && (
                  <p className="mt-2 border-t border-white/5 pt-2 text-xs text-surface-400">
                    {item.blocker}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
