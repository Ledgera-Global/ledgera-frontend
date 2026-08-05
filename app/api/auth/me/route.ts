import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    // Forward the auth cookie/token from the request to the backend
    const cookie = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
        ...(authHeader ? { authorization: authHeader } : {}),
      },
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("[auth/me proxy]", err);
    return NextResponse.json(
      { error: "Backend unreachable. Please try again later." },
      { status: 502 }
    );
  }
}
