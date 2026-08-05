import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("[auth/register proxy]", err);
    return NextResponse.json(
      { error: "Backend unreachable. Please try again later." },
      { status: 502 }
    );
  }
}
