import { NextRequest } from "next/server";
import { handleApiStream } from "@/lib/backendProxy";

/**
 * GET /api/live/:companyId/stream
 *
 * Server-sent events, passed straight through from the backend.
 *
 * Notes that matter for correctness:
 *
 *  - `runtime = "nodejs"` because the stream is a long-lived proxied response;
 *    the edge runtime would need a different idiom and this app does not split
 *    its API surface across runtimes.
 *  - `dynamic = "force-dynamic"` so the route is never treated as cacheable.
 *  - No demo fixture is served here even to unauthenticated callers. A fixture
 *    stream would sit silent forever, which is indistinguishable from a real
 *    connection where nothing has happened - exactly the confusion this feature
 *    exists to prevent. The page falls back to the poll endpoints instead.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiStream(req, p, `/live/${p.companyId}/stream`);
}
