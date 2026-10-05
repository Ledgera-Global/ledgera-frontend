/**
 * Where the live page's figures came from.
 *
 * The proxy in front of the backend labels every response it serves -
 * `X-Ledgera-Data-Source: live` for the customer's own data, `demo` for the
 * bundled preview fixture - precisely so that no screen can present one as the
 * other. This module is the consumer of that label.
 *
 * The distinction it exists to enforce: a visitor who is not signed in may be
 * shown the preview, because that is a product demonstration. A visitor whose
 * session has lapsed must not, because that is fabricated financials presented
 * to someone who believes they are reading their own books. No amount of
 * labelling makes the second acceptable, so a refused read is reported as
 * `unavailable` and the page shows an error instead of the fixture.
 *
 * `demo` is therefore only ever returned for a 200 the server itself marked.
 * Anything else that is not a clean 200 becomes `unavailable`.
 */

export type LiveDataSource = "live" | "demo" | "unavailable";

export interface LiveRead<T> {
  /** Null whenever `source` is "unavailable". */
  data: T | null;
  source: LiveDataSource;
  /** HTTP status, or null when the request never reached the server. */
  status: number | null;
}

/** Must match DATA_SOURCE_HEADER in lib/backendProxy.ts. */
const DATA_SOURCE_HEADER = "x-ledgera-data-source";

/** How long a live read may take before the page stops waiting on it. */
const READ_TIMEOUT_MS = 10_000;

export async function readLive<T>(url: string): Promise<LiveRead<T>> {
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
  } catch {
    return { data: null, source: "unavailable", status: null };
  }

  if (!response.ok) {
    // 401 lands here deliberately. A refused session is not a preview.
    return { data: null, source: "unavailable", status: response.status };
  }

  const marked = response.headers.get(DATA_SOURCE_HEADER);
  const source: LiveDataSource = marked === "live" ? "live" : "demo";

  try {
    const data = (await response.json()) as T;
    return { data, source, status: response.status };
  } catch {
    return { data: null, source: "unavailable", status: response.status };
  }
}

/**
 * The single answer for a page built from several reads.
 *
 * One unreadable source makes the whole board unusable: showing the other two
 * would produce a view whose headline score silently omitted a dimension. So
 * any failure wins, and only a board where every read was marked `live` is
 * presented as live.
 */
export function combineSources(
  reads: readonly LiveRead<unknown>[]
): LiveDataSource {
  if (reads.some((read) => read.source === "unavailable")) return "unavailable";
  if (reads.some((read) => read.source === "demo")) return "demo";
  return "live";
}
