import type { ConnectionHealth } from "@/lib/types/live";

import {
  CADENCE_LABEL,
  FRESHNESS_CLASSES,
  FRESHNESS_LABEL,
  formatAge,
  freshnessDotClass,
} from "@/lib/liveDisplay";

/**
 * Every connected source, with what its data is worth right now.
 *
 * The row shows two different things that are easy to confuse and important to
 * keep apart: `status` (we hold working credentials) and `freshness` (how old
 * the data is). A source can be perfectly connected and four days stale, and
 * this is the table where that becomes visible.
 *
 * A row that may not be presented as current says so in words, not only in
 * colour, so the distinction survives a monochrome screen or a colour-blind
 * reader.
 */
export default function ConnectionHealthList({
  connections,
}: {
  connections: ConnectionHealth[];
}) {
  if (connections.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
          Connected Sources
        </h3>
        <p className="text-sm text-surface-300">
          No sources are connected. Every dimension that depends on an outside
          system will report itself as unmeasured rather than as zero.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-5">
        Connected Sources ({connections.length})
      </h3>

      <ul className="space-y-3">
        {connections.map((connection) => (
          <li
            key={connection.provider}
            className="rounded-xl border border-white/10 bg-surface-950/40 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex h-2 w-2 shrink-0 rounded-full ${freshnessDotClass(
                    connection.freshness
                  )}`}
                  aria-hidden="true"
                />
                <span className="text-base font-semibold text-white">
                  {connection.providerName}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    FRESHNESS_CLASSES[connection.freshness]
                  }`}
                >
                  {FRESHNESS_LABEL[connection.freshness]}
                </span>
              </div>
              <span className="font-mono text-xs text-surface-400">
                {formatAge(connection.ageSeconds)}
              </span>
            </div>

            <p className="mt-3 text-sm text-surface-300">{connection.note}</p>

            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
              <Field label="Category" value={connection.category} />
              <Field label="Cadence" value={CADENCE_LABEL[connection.cadence]} />
              <Field
                label="Records last sync"
                value={connection.recordsIngested.toLocaleString("en-US")}
              />
              <Field
                label="Total syncs"
                value={connection.totalSyncs.toLocaleString("en-US")}
              />
            </div>

            {connection.lastError && (
              <p className="mt-3 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">
                Last error: {connection.lastError}
                {connection.consecutiveFailures > 1
                  ? ` (${connection.consecutiveFailures} consecutive failures)`
                  : ""}
              </p>
            )}

            {!connection.mayPresentAsCurrent && (
              <p className="mt-3 text-xs font-medium text-amber-300">
                Figures from this source are not shown as current.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </div>
      <div className="mt-0.5 text-surface-300">{value}</div>
    </div>
  );
}
