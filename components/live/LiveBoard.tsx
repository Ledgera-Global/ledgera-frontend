"use client";
import ConnectionHealthList from "@/components/live/ConnectionHealthList";
import EventFeed from "@/components/live/EventFeed";
import IdentityDimensionList from "@/components/live/IdentityDimensionList";
import LiveStatusBar from "@/components/live/LiveStatusBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { readLive, type LiveDataSource } from "@/lib/live/provenance";
import { useLiveStream } from "@/lib/live/useLiveStream";
import { formatWindow } from "@/lib/liveDisplay";

import type {
  ConnectionHealth,
  EconomicEvent,
  IdentityResponse,
} from "@/lib/types/live";

/**
 * The live visibility view: what Ledgera can see, how fresh it is, and what it
 * is therefore allowed to claim.
 *
 * The page above this one loads the first payload and handles chrome; this
 * component owns everything that changes while the reader is looking at it.
 *
 * The ages in the feed are measured against the snapshot's own `computedAt`
 * plus however long this page has been open - never against `Date.now()`.
 *
 * That matters twice over. Reading the clock during render would differ between
 * server and client and React would report a hydration mismatch. More
 * importantly, wall-clock time is the wrong yardstick for this page: a payload
 * computed at 09:00 and still on screen at 17:00 has not become eight hours
 * staler, it has become eight hours older *since it was computed*. Anchoring to
 * `computedAt` keeps a snapshot internally coherent - an event eleven minutes
 * before the snapshot reads as eleven minutes old - and advancing it by the
 * page's own open time lets those ages grow honestly as the reader watches.
 * Measuring against the browser clock instead would make a fixture anchored
 * months ago display as months stale the moment it loaded.
 *
 * `dataSource` is threaded through rather than assumed. The stream is only
 * opened when the figures are the reader's own: against a preview there is no
 * session for the stream route to accept, so opening one would produce a
 * permanent, self-inflicted "interrupted" banner over data that is working
 * exactly as intended.
 */
export default function LiveBoard({
  companyId,
  identity: initialIdentity,
  events: initialEvents,
  connections: initialConnections,
  dataSource,
}: {
  companyId: string;
  identity: IdentityResponse;
  events: EconomicEvent[];
  connections: ConnectionHealth[];
  dataSource: LiveDataSource;
}) {
  const live = useLiveStream(
    companyId,
    {
      identity: initialIdentity,
      events: initialEvents,
      connections: initialConnections,
    },
    { enabled: dataSource === "live" }
  );

  const [anchorMs, setAnchorMs] = useState(() =>
    Date.parse(initialIdentity.computedAt)
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Advance the feed's clock by the time this page has actually been open. A
  // minute is fine: these are ages in minutes and hours, and re-rendering the
  // board every second to change "7m" to "7m" would be pure cost.
  useEffect(() => {
    const openedAt = Date.now();
    const timer = setInterval(
      () => setElapsedMs(Date.now() - openedAt),
      60_000
    );
    return () => clearInterval(timer);
  }, []);

  const now = useMemo(
    () => new Date(anchorMs + elapsedMs),
    [anchorMs, elapsedMs]
  );

  const refreshNow = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await readLive<IdentityResponse>(
        `/api/live/${companyId}/identity?refresh=true`
      );

      // A refresh that did not come back as the reader's own data is not
      // applied at all. Re-anchoring the clock to a fixture would silently
      // restate someone else's figures as the current moment.
      if (fresh.source !== "live" || !fresh.data) return;

      // The stream owns long-lived state; a manual refresh is a one-off read, so
      // its result re-anchors the feed's clock and the next heartbeat reconciles
      // if the two ever disagree. Elapsed resets because the new snapshot is the
      // new origin.
      setAnchorMs(Date.parse(fresh.data.computedAt));
      setElapsedMs(0);
      live.reconnect();
    } finally {
      setRefreshing(false);
    }
  }, [companyId, live]);

  const staleSources = live.connections.filter((c) => !c.mayPresentAsCurrent);

  return (
    <div className="space-y-8">
      <LiveStatusBar
        streamStatus={live.streamStatus}
        lastFrameAt={live.lastFrameAt}
        note={live.identity.note}
        dataSource={dataSource}
        mayPresentAsCurrent={live.identity.mayPresentAsCurrent}
        staleSourceCount={staleSources.length}
        onReconnect={live.reconnect}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-surface-400">
            {live.identity.headline.measured} of {live.identity.headline.total}{" "}
            dimensions measured
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-white">
            {live.identity.headline.institutionalScore ?? "—"}
            <span className="ml-2 text-base font-normal text-surface-400">
              {live.identity.headline.band}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-surface-400">
            {live.identity.windowDays}-day window,{" "}
            {formatWindow(live.identity.windowStart, live.identity.windowEnd)}
          </span>
          {dataSource === "live" && (
            <button
              type="button"
              onClick={refreshNow}
              disabled={refreshing}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-surface-200 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              {refreshing ? "Recomputing…" : "Recompute now"}
            </button>
          )}
        </div>
      </div>

      {initialIdentity.receivablesTermsNote && (
        <p className="text-xs text-surface-400">
          {initialIdentity.receivablesTermsNote}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <IdentityDimensionList dimensions={live.identity.dimensions} />
        <EventFeed events={live.events} now={now} />
      </div>

      <ConnectionHealthList connections={live.connections} />
    </div>
  );
}
