import { NextResponse } from "next/server";
import { METRIC_POLICY_DEMO } from "@/lib/data/metricStandardDemo";
import { applySecurityHeaders } from "@/lib/security";
import type { MetricPolicyResponse } from "@/lib/types/metricStandard";

/**
 * GET /api/metric-standard/policy — the published definitions.
 *
 * This is the one metric-standard endpoint the backend serves without a
 * session, so there is no token to forward and no tenant to check. It still
 * goes through this app rather than straight at the backend for two reasons:
 * the browser never needs to learn the backend's hostname, and the response
 * carries the same `X-Ledgera-Data-Source` label as every other proxied read,
 * so the page can say whether it is describing the live standard or the
 * bundled copy.
 *
 * Serving the bundled copy on failure is safe here in a way it would not be for
 * a figure: this is a published policy, identical in both places, and the label
 * says which one was served.
 */

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const POLICY_TIMEOUT_MS = 4000;
const DATA_SOURCE_HEADER = "X-Ledgera-Data-Source";

export async function GET() {
  const headers = new Headers();
  applySecurityHeaders(headers);

  try {
    const response = await fetch(`${BACKEND_URL}/metric-standard/policy`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(POLICY_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`policy read returned ${response.status}`);
    }

    const policy = (await response.json()) as MetricPolicyResponse;
    // A body without definitions is not a policy. Serving it would render an
    // empty standard, which reads as "nothing is quotable" rather than "the
    // read failed".
    if (!Array.isArray(policy.policy) || policy.policy.length === 0) {
      throw new Error("policy read returned no definitions");
    }

    headers.set(DATA_SOURCE_HEADER, "live");
    return NextResponse.json(policy, { headers });
  } catch (err) {
    console.error(
      `[metric-standard/policy] serving the bundled copy: ${(err as Error).message}`
    );
    headers.set(DATA_SOURCE_HEADER, "demo");
    return NextResponse.json(METRIC_POLICY_DEMO, { headers });
  }
}
