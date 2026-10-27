/**
 * Where a page's figures came from.
 *
 * The proxy in front of the backend labels every response it serves -
 * `X-Ledgera-Data-Source: live` for the customer's own data, `demo` for the
 * bundled preview fixture - precisely so that no screen can present one as the
 * other. This module is the consumer of that label for the attribution and
 * coverage screens.
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

export type DataSource = "live" | "demo" | "unavailable";

export interface SourcedRead<T> {
  /** Null whenever `source` is "unavailable". */
  data: T | null;
  source: DataSource;
  /** HTTP status, or null when the request never reached the server. */
  status: number | null;
}

/** Must match DATA_SOURCE_HEADER in lib/backendProxy.ts. */
const DATA_SOURCE_HEADER = "x-ledgera-data-source";

/** How long a read may take before the page stops waiting on it. */
const READ_TIMEOUT_MS = 10_000;

export async function readSourced<T>(url: string): Promise<SourcedRead<T>> {
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
  const source: DataSource = marked === "live" ? "live" : "demo";

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
 * One unreadable source makes the whole screen unusable: showing the other
 * read would produce a view whose coverage silently omitted a set of questions.
 * So any failure wins, and only a screen where every read was marked `live` is
 * presented as live.
 */
export function combineDataSources(
  reads: readonly SourcedRead<unknown>[]
): DataSource {
  if (reads.some((read) => read.source === "unavailable")) return "unavailable";
  if (reads.some((read) => read.source === "demo")) return "demo";
  return "live";
}
