"use client";
import type { LiveDataSource } from "@/lib/live/provenance";
import { formatTimestamp } from "@/lib/liveDisplay";
import type { LiveStreamStatus } from "@/lib/types/live";

/**
 * The strip that says how this page's data reached the reader, whose data it
 * is, and whether any of it may be called current.
 *
 * Three independent statements share this strip because separating them onto
 * different screens is how the confusion starts:
 *
 *  1. The transport - is the stream up? This is about the browser's connection
 *     to Ledgera.
 *  2. The provenance - is this the reader's own data, or the sample company's?
 *     This is about which set of books is on screen at all.
 *  3. The trust - may these figures be presented as current? This is about
 *     Ledgera's connection to the customer's systems.
 *
 * A stream can be perfectly healthy while the underlying data is days old, and
 * a fixture can be perfectly self-consistent while being nobody's real figures.
 * The strip must never let one of these imply another.
 *
 * The transport row is only shown as a transport row when there is a stream to
 * transport. A preview has none by design, and a red "stream unavailable" over
 * a page that is working exactly as intended reads as a fault the reader should
 * act on. So the preview states the absence plainly instead.
 */
export default function LiveStatusBar({
  streamStatus,
  lastFrameAt,
  note,
  dataSource,
  mayPresentAsCurrent,
  staleSourceCount,
  onReconnect,
}: {
  streamStatus: LiveStreamStatus;
  lastFrameAt: string | null;
  note: string;
  dataSource: LiveDataSource;
  mayPresentAsCurrent: boolean;
  staleSourceCount: number;
  onReconnect: () => void;
}) {
  const isPreview = dataSource === "demo";
  const streamFailing =
    !isPreview && (streamStatus === "offline" || streamStatus === "reconnecting");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-900/40 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex h-2 w-2 shrink-0 rounded-full ${
              isPreview ? "bg-surface-500" : streamDot(streamStatus)
            }`}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-white">
            {isPreview
              ? "No live stream while previewing"
              : STREAM_LABEL[streamStatus]}
          </span>
          {!isPreview && lastFrameAt && (
            <span className="text-xs text-surface-400">
              Last update {formatTimestamp(lastFrameAt)}
            </span>
          )}
        </div>

        {streamFailing && (
          <button
            type="button"
            onClick={onReconnect}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-surface-200 transition hover:border-white/30 hover:text-white"
          >
            Reconnect
          </button>
        )}
      </div>

      {isPreview && (
        <div className="rounded-2xl border border-sky-400/25 bg-sky-400/5 px-5 py-4">
          <p className="text-sm font-semibold text-sky-200">
            Preview data - this is a sample company, not yours.
          </p>
          <p className="mt-1 text-sm text-surface-300">
            Nobody is signed in, so these figures come from a worked example
            rather than from any system of your own. A stream would carry nothing
            for a reader with no session, so none is opened. The figures are
            shaped exactly like real ones, which is the point of the preview -
            but they are not your business.
          </p>
        </div>
      )}

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
          {isPreview
            ? "Within the sample, every figure is current."
            : mayPresentAsCurrent
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
