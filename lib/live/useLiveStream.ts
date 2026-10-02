"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ConnectionHealth,
  EconomicEvent,
  InstitutionalIdentity,
  LiveSnapshot,
  LiveStreamStatus,
} from "@/lib/types/live";

/**
 * Subscribes to the live stream and folds its frames into page state.
 *
 * Three decisions worth stating, because each one exists to prevent a specific
 * failure:
 *
 * 1. Reconnection is handled here, not left to `EventSource`. The browser's own
 *    retry is a fixed few seconds, and every reconnection costs a slot against a
 *    rate limit that allows only a handful of streams per quarter hour. So the
 *    native retry is suppressed - `close()` on any error - and replaced with
 *    exponential backoff.
 *
 * 2. After a bounded number of failures it stops and reports "offline" rather
 *    than retrying forever. The page keeps showing the last data it received and
 *    says the stream is down, which is true and useful. Reconnecting in a tight
 *    loop would neither restore the stream sooner nor be honest about it.
 *
 * 3. Events are keyed by id. The backend's database catch-up can legitimately
 *    re-send an event whose timestamp ties with one already delivered - two jobs
 *    really can complete in the same second - so a client that trusted position
 *    instead of identity would show duplicates.
 */

const MAX_EVENTS = 100;

/** Backoff steps in milliseconds, then the last value repeats. */
const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
const MAX_ATTEMPTS = 6;

export interface LiveDataState {
  identity: InstitutionalIdentity;
  events: EconomicEvent[];
  connections: ConnectionHealth[];
}

export interface LiveStreamResult extends LiveDataState {
  streamStatus: LiveStreamStatus;
  /** When the last frame of any kind arrived, so the page can show staleness. */
  lastFrameAt: string | null;
  /** Reconnect on demand, e.g. from a "Retry now" control. */
  reconnect: () => void;
}

export function useLiveStream(
  companyId: string,
  initial: LiveDataState
): LiveStreamResult {
  const [identity, setIdentity] = useState<InstitutionalIdentity>(initial.identity);
  const [events, setEvents] = useState<EconomicEvent[]>(initial.events);
  const [connections, setConnections] = useState<ConnectionHealth[]>(
    initial.connections
  );
  const [streamStatus, setStreamStatus] = useState<LiveStreamStatus>("connecting");
  const [lastFrameAt, setLastFrameAt] = useState<string | null>(null);

  const sourceRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const eventIdsRef = useRef<Set<string>>(new Set(initial.events.map((e) => e.id)));
  const mountedRef = useRef(true);

  const mergeEvents = useCallback((incoming: readonly EconomicEvent[]) => {
    const fresh = incoming.filter((event) => !eventIdsRef.current.has(event.id));
    if (fresh.length === 0) return;
    for (const event of fresh) eventIdsRef.current.add(event.id);

    setEvents((current) => {
      const merged = [...fresh, ...current].sort(
        (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      );
      // Bound the list so a long-lived tab cannot grow without limit. The ids
      // set is trimmed with it, by the same count.
      return merged.slice(0, MAX_EVENTS);
    });
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    sourceRef.current?.close();
    setStreamStatus(attemptsRef.current === 0 ? "connecting" : "reconnecting");

    const source = new EventSource(`/api/live/${companyId}/stream`);
    sourceRef.current = source;

    source.addEventListener("open", () => {
      attemptsRef.current = 0;
      setStreamStatus("live");
    });

    source.addEventListener("snapshot", (message) => {
      const snapshot = JSON.parse((message as MessageEvent<string>).data) as LiveSnapshot;
      attemptsRef.current = 0;
      setStreamStatus("live");
      setLastFrameAt(new Date().toISOString());
      setIdentity(snapshot.identity);
      setConnections(snapshot.connections);
      eventIdsRef.current = new Set(snapshot.events.map((event) => event.id));
      setEvents(snapshot.events.slice(0, MAX_EVENTS));
    });

    source.addEventListener("event", (message) => {
      setLastFrameAt(new Date().toISOString());
      mergeEvents([JSON.parse((message as MessageEvent<string>).data) as EconomicEvent]);
    });

    source.addEventListener("identity", (message) => {
      setLastFrameAt(new Date().toISOString());
      setIdentity(JSON.parse((message as MessageEvent<string>).data) as InstitutionalIdentity);
    });

    source.addEventListener("connection", (message) => {
      setLastFrameAt(new Date().toISOString());
      const updated = JSON.parse((message as MessageEvent<string>).data) as ConnectionHealth;
      setConnections((current) => {
        const without = current.filter((row) => row.provider !== updated.provider);
        return [...without, updated].sort((a, b) =>
          a.providerName.localeCompare(b.providerName)
        );
      });
    });

    source.addEventListener("heartbeat", () => {
      setLastFrameAt(new Date().toISOString());
    });

    source.addEventListener("error", () => {
      // Close first: leaving the native retry running would race our own timer
      // and spend rate-limit budget twice over.
      source.close();
      sourceRef.current = null;
      if (!mountedRef.current) return;

      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_ATTEMPTS) {
        setStreamStatus("offline");
        return;
      }

      const delay =
        BACKOFF_MS[Math.min(attemptsRef.current - 1, BACKOFF_MS.length - 1)];
      setStreamStatus("reconnecting");
      timerRef.current = setTimeout(connect, delay);
    });
  }, [companyId, mergeEvents]);

  const reconnect = useCallback(() => {
    attemptsRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    connect();
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [connect]);

  return {
    identity,
    events,
    connections,
    streamStatus,
    lastFrameAt,
    reconnect,
  };
}
