import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const realmId = request.nextUrl.searchParams.get("realmId");

  // Forward the callback to the backend via server-side fetch,
  // then return the backend's redirect to the user.
  // This eliminates the double-redirect hop that loses the code param.
  const backendUrl = new URL(`${BACKEND_URL}/oauth/quickbooks/callback`);
  if (code) backendUrl.searchParams.set("code", code);
  if (state) backendUrl.searchParams.set("state", state);
  if (realmId) backendUrl.searchParams.set("realmId", realmId);

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      redirect: "manual", // Do not follow redirect — capture it
    });

    // Backend returns a 302 redirect back to the app (e.g., /integrations?connected=quickbooks)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // If backend returns success text, redirect to integrations page
    const text = await response.text();
    if (response.ok) {
      return NextResponse.redirect(new URL("/integrations", request.url).toString());
    }

    // Error case — redirect to integrations with error
    console.error("[quickbooks/callback] Backend error:", response.status, text);
    return NextResponse.redirect(new URL(`/integrations?error=quickbooks_connect_failed`, request.url).toString());
  } catch (err) {
    console.error("[quickbooks/callback] Failed to proxy to backend:", err);
    return NextResponse.redirect(new URL(`/integrations?error=quickbooks_connect_failed`, request.url).toString());
  }
}
