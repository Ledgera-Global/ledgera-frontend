import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  // Proxy the callback to the backend
  const backendUrl = new URL(`${BACKEND_URL}/oauth/servicetitan/callback`);
  if (code) backendUrl.searchParams.set("code", code);
  if (state) backendUrl.searchParams.set("state", state);

  return NextResponse.redirect(backendUrl.toString());
}
