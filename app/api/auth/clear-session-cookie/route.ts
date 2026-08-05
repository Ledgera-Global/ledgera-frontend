import { NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function POST() {
  try {
    await fetch(`${BACKEND_URL}/auth/clear-session-cookie`, {
      method: "POST",
    });
  } catch {
    // Non-critical
  }
  return NextResponse.json({ ok: true });
}
