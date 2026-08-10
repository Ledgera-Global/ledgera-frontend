import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/integrations/catalog
 *
 * Proxies the public integration catalog from the Express backend.
 * The backend renders this from its provider registry, so adding a
 * provider in the backend automatically surfaces it here — no redeploy
 * of the frontend page code is required.
 */
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/integrations/catalog`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`Backend catalog failed (${res.status})`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn(
      "[integrations/catalog] Backend unavailable, returning empty catalog:",
      (err as Error).message
    );
    return NextResponse.json([]);
  }
}
