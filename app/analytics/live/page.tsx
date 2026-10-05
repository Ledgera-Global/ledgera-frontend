"use client";
import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import LiveBoard from "@/components/live/LiveBoard";
import LiveUnavailable from "@/components/live/LiveUnavailable";
import { useCallback, useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/layouts/LoadingSkeleton";
import { combineSources, readLive, type LiveDataSource } from "@/lib/live/provenance";

import type {
  ConnectionHealth,
  ConnectionsResponse,
  EconomicEvent,
  EventsResponse,
  IdentityResponse,
} from "@/lib/types/live";

const COMPANY_ID = "companyA";

interface LivePayload {
  identity: IdentityResponse;
  events: EconomicEvent[];
  connections: ConnectionHealth[];
}

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
 *
 * The page holds three states and no fourth. It shows the reader's own figures
 * when the server says it served them; it shows the sample company, clearly
 * labelled as a sample, when the server says this is an unauthenticated
 * preview; and it shows an error when the server refused the read. It never
 * fills a refusal with the sample - that is the one combination a reader cannot
 * detect and the one this whole layer exists to prevent.
 *
 * The fixtures are not imported here. They arrive from the API only when the
 * API deliberately marked the response as demo, so this page cannot serve them
 * by accident or by a fallback that quietly did its job.
 */
export default function LiveVisibilityPage() {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [dataSource, setDataSource] = useState<LiveDataSource | null>(null);
  const [failureStatus, setFailureStatus] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [identity, events, connections] = await Promise.all([
        readLive<IdentityResponse>(`/api/live/${COMPANY_ID}/identity`),
        readLive<EventsResponse>(`/api/live/${COMPANY_ID}/events?limit=50`),
        readLive<ConnectionsResponse>(`/api/live/${COMPANY_ID}/connections`),
      ]);

      if (cancelled) return;

      const source = combineSources([identity, events, connections]);

      if (
        source === "unavailable" ||
        !identity.data ||
        !events.data ||
        !connections.data
      ) {
        const refused = [identity, events, connections].find(
          (read) => read.source === "unavailable"
        );
        setPayload(null);
        setDataSource("unavailable");
        setFailureStatus(refused?.status ?? null);
        return;
      }

      setPayload({
        identity: identity.data,
        events: events.data.events,
        connections: connections.data.connections,
      });
      setDataSource(source);
      setFailureStatus(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setDataSource(null);
    setPayload(null);
    setFailureStatus(null);
    setAttempt((n) => n + 1);
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

          {dataSource === null && <LoadingSkeleton count={3} />}

          {dataSource === "unavailable" && (
            <LiveUnavailable status={failureStatus} onRetry={retry} />
          )}

          {payload && dataSource !== null && dataSource !== "unavailable" && (
            <LiveBoard
              companyId={COMPANY_ID}
              identity={payload.identity}
              events={payload.events}
              connections={payload.connections}
              dataSource={dataSource}
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
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <span>
                  Whether these figures are{" "}
                  <span className="text-white">yours</span> is stated above the
                  board and is never inferred. An unauthenticated visit is shown
                  a sample company and told so; a refused read shows an error
                  rather than the sample.
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
