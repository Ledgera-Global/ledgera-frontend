"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import LiveBoard from "@/components/live/LiveBoard";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { fetchJson } from "@/lib/api/client";

import {
  LIVE_CONNECTIONS_DEMO,
  LIVE_EVENTS_DEMO,
  LIVE_IDENTITY_RESPONSE_DEMO,
} from "@/lib/data/liveDemo";
import type {
  ConnectionHealth,
  ConnectionsResponse,
  EconomicEvent,
  EventsResponse,
  IdentityResponse,
} from "@/lib/types/live";

const COMPANY_ID = "companyA";

/**
 * Live Visibility: the state of the business right now, and the state of the
 * data behind it.
 *
 * This page exists because a number and a number you can rely on are not the
 * same thing. Every other screen in this app answers "what is true". This one
 * also answers "how do you know, and how long ago did you last check" - which
 * is the question a lender or an acquirer asks second, and the one a dashboard
 * built only from snapshots cannot answer at all.
 *
 * The data arrives in three reads, then stays open on a stream. The stream is a
 * transport, not a source of truth: if it drops, the page keeps the last figures
 * it received and says so, rather than blanking or pretending.
 */
export default function LiveVisibilityPage() {
  const [identity, setIdentity] = useState<IdentityResponse>(
    LIVE_IDENTITY_RESPONSE_DEMO
  );
  const [events, setEvents] = useState<EconomicEvent[]>(LIVE_EVENTS_DEMO);
  const [connections, setConnections] = useState<ConnectionHealth[]>(
    LIVE_CONNECTIONS_DEMO
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [identityData, eventsData, connectionsData] = await Promise.all([
        fetchJson<IdentityResponse>(
          `/api/live/${COMPANY_ID}/identity`,
          LIVE_IDENTITY_RESPONSE_DEMO
        ),
        fetchJson<EventsResponse>(
          `/api/live/${COMPANY_ID}/events?limit=50`,
          { companyId: COMPANY_ID, events: LIVE_EVENTS_DEMO }
        ),
        fetchJson<ConnectionsResponse>(
          `/api/live/${COMPANY_ID}/connections`,
          { companyId: COMPANY_ID, connections: LIVE_CONNECTIONS_DEMO }
        ),
      ]);

      if (cancelled) return;
      setIdentity(identityData);
      setEvents(eventsData.events);
      setConnections(connectionsData.connections);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/live" transparent />

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-3">
              Live Visibility
            </h1>
            <p className="max-w-3xl text-base text-surface-300">
              What the connected systems report right now, how fresh each source
              is, and which figures may therefore be presented as current. Where
              a dimension cannot be measured from the sources connected, it says
              so instead of showing a zero.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <LiveBoard
              companyId={COMPANY_ID}
              identity={identity}
              events={events}
              connections={connections}
            />
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-surface-900/40 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400 mb-4">
              How To Read This Page
            </h3>
            <ul className="space-y-3 text-sm text-surface-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  A source is <span className="text-white">connected</span> when
                  Ledgera holds working credentials for it, and{" "}
                  <span className="text-white">current</span> when the last sync
                  landed inside that source's own cadence. Those are
                  different claims and they are shown separately.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  A dimension marked{" "}
                  <span className="text-white">not measured</span> is one the
                  connected sources cannot support. It is left out of the
                  headline score rather than counted as zero, and coverage shows
                  how much of the identity was actually measurable.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  The stream carries changes as they happen. If it is interrupted
                  the figures already on screen stay, marked with when they last
                  arrived, rather than being replaced by placeholders.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">
            &copy; {new Date().getFullYear()} Ledgera Global Inc.
          </span>
          <Link
            href="/analytics"
            className="text-sm text-surface-400 hover:text-white transition-colors"
          >
            Analytics
          </Link>
        </div>
      </footer>
    </div>
  );
}
