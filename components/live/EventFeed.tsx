import type { EconomicEvent } from "@/lib/types/live";

import {
  IMPACT_CLASSES,
  IMPACT_LABEL,
  formatSignedCents,
  formatTimestamp,
} from "@/lib/liveDisplay";

/**
 * The normalized economic event feed.
 *
 * One list holds a cleared payment, a completed job, a renewed policy and a
 * failed sync, because the point of normalizing them was so that the reader
 * could see the business moving in one place rather than in four dashboards.
 *
 * `now` is passed in rather than read here so that every row in a render agrees
 * about what "now" is; a list whose first row says "2m ago" and whose last says
 * "1m ago" because a second ticked over reads as a bug.
 */
export default function EventFeed({
  events,
  now,
}: {
  events: EconomicEvent[];
  now: Date;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-5">
        What Has Happened ({events.length})
      </h3>

      {events.length === 0 ? (
        <p className="text-sm text-surface-300">
          Nothing has been recorded in this window yet. That is a statement about
          what has arrived from the connected sources, not about the business.
        </p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-surface-950/40 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      IMPACT_CLASSES[event.impactClass]
                    }`}
                  >
                    {IMPACT_LABEL[event.impactClass]}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {event.title}
                  </span>
                </div>
                {event.detail && (
                  <p className="mt-1 text-xs text-surface-400">{event.detail}</p>
                )}
                <p className="mt-1 text-[11px] uppercase tracking-wider text-surface-500">
                  {event.source}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {event.amountCents !== null && (
                  <div
                    className={`font-mono text-sm font-semibold ${
                      event.amountCents < 0 ? "text-amber-300" : "text-emerald-300"
                    }`}
                  >
                    {formatSignedCents(event.amountCents)}
                  </div>
                )}
                <div className="mt-0.5 text-xs text-surface-500">
                  {formatTimestamp(event.occurredAt, now)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
