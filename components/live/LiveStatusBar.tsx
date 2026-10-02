"use client";
import { formatTimestamp } from "@/lib/liveDisplay";
import type { LiveStreamStatus } from "@/lib/types/live";

/**
 * The strip that says how this page's data reached the reader, and whether any
 * of it may be called current.
 *
 * Two independent statements share this strip because separating them onto two
 * screens is how the confusion starts:
 *
 *  1. The transport - is the stream up? This is about the browser's connection
 *     to Ledgera.
 *  2. The trust - may these figures be presented as current? This is about
 *     Ledgera's connection to the customer's systems.
 *
 * A stream can be perfectly healthy while the underlying data is days old, and
 * the strip must never let the first imply the second.
 */
export default function LiveStatusBar({
  streamStatus,
  lastFrameAt,
  note,
  mayPresentAsCurrent,
  staleSourceCount,
  onReconnect,
}: {
  streamStatus: LiveStreamStatus;
  lastFrameAt: string | null;
  note: string;
  mayPresentAsCurrent: boolean;
  staleSourceCount: number;
  onReconnect: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-900/40 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex h-2 w-2 shrink-0 rounded-full ${streamDot(
              streamStatus
            )}`}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-white">
            {STREAM_LABEL[streamStatus]}
          </span>
          {lastFrameAt && (
            <span className="text-xs text-surface-400">
              Last update {formatTimestamp(lastFrameAt)}
            </span>
          )}
        </div>

        {(streamStatus === "offline" || streamStatus === "reconnecting") && (
          <button
            type="button"
            onClick={onReconnect}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-surface-200 transition hover:border-white/30 hover:text-white"
          >
            Reconnect
          </button>
        )}
      </div>

      <div
        className={`rounded-2xl border px-5 py-4 ${
          mayPresentAsCurrent
            ? "border-emerald-400/20 bg-emerald-400/5"
            : "border-amber-400/25 bg-amber-400/5"
        }`}
      >
        <p
          className={`text-sm font-semibold ${
            mayPresentAsCurrent ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {mayPresentAsCurrent
            ? "Every figure here is current."
            : `${staleSourceCount} source${
                staleSourceCount === 1 ? "" : "s"
              } behind this view ${
                staleSourceCount === 1 ? "is" : "are"
              } not current.`}
        </p>
        <p className="mt-1 text-sm text-surface-300">{note}</p>
      </div>
    </div>
  );
}

const STREAM_LABEL: Record<LiveStreamStatus, string> = {
  connecting: "Connecting to the live stream",
  live: "Live stream connected",
  reconnecting: "Live stream interrupted, retrying",
  offline: "Live stream unavailable - showing the last data received",
};

function streamDot(status: LiveStreamStatus): string {
  if (status === "live") return "bg-emerald-400";
  if (status === "connecting") return "bg-teal-400";
  if (status === "reconnecting") return "bg-amber-400";
  return "bg-red-400";
}
