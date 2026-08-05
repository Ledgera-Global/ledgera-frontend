import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await fetch(`${BACKEND_URL}/auth/set-session-cookie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — cookie is best-effort
    return NextResponse.json({ ok: true });
  }
}
