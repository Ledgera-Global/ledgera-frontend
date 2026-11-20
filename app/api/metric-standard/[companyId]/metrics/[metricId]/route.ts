import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { LatestMetricRead } from "@/lib/types/metricStandard";

/**
 * GET /api/metric-standard/:companyId/metrics/:metricId
 *
 * Two upstream answers mean different things here and must not be merged:
 *
 *   200 — a sealed snapshot exists, with the verification the backend ran.
 *   404 — nothing has been quoted as this metric for this company. That is a
 *         real state a screen has to be able to show ("no figure on record"),
 *         so it is passed through as `found: false` rather than collapsed into
 *         a 502. A screen that cannot tell "we never quoted this" apart from
 *         "we could not read it" will eventually report the first as the second.
 *
 * Anything else is a genuine failure and stays one.
 *
 * The unauthenticated preview is deliberately NOT a snapshot. A figure belongs
 * to a company; serving a seeded company's value to a visitor would present
 * fabricated financials as a worked example of their own books, which is the
 * exact confusion the provenance layer exists to prevent. So the preview says
 * there is nothing to show, and why.
 */

const SIGNED_OUT_PREVIEW: LatestMetricRead = {
  found: false,
  detail:
    "Sign in to read the quoted figure for your company. The definitions below are published; the figures are per-company.",
  data: null,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; metricId: string }> }
) {
  const { companyId, metricId } = await params;

  return handleApiGet<LatestMetricRead>(
    req,
    { companyId },
    `/metric-standard/${companyId}/metrics/${encodeURIComponent(metricId)}`,
    SIGNED_OUT_PREVIEW,
    { treatNotFoundAsAbsent: true }
  );
}
