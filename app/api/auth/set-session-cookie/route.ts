import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/sessionCookie";

/**
 * Stores the caller's session token in a first-party cookie.
 *
 * This route previously forwarded the token to the backend and discarded the
 * reply. That could never have worked: a Set-Cookie from the API's host is not
 * stored for this origin, and the backend has no such endpoint anyway. The
 * result was that no `ledgera_token` cookie was ever written while three
 * proxies read it, so every authenticated call after a reload came back 401.
 *
 * The token is not re-validated here. It came from `/auth/login` moments
 * earlier, and every route that consumes the cookie passes it to the backend,
 * which verifies the signature, the account's `disabled` flag and its
 * `tokenVersion` on each request. This route is storage, not a trust decision.
 */

export async function POST(request: NextRequest) {
  let token: string | undefined;

  try {
    const body = (await request.json()) as { token?: unknown };
    if (typeof body.token === "string" && body.token.trim()) {
      token = body.token.trim();
    }
  } catch {
    // Malformed body: handled below as a caller error.
  }

  if (!token) {
    return NextResponse.json({ error: "A session token is required." }, { status: 400 });
  }

  return setSessionCookie(NextResponse.json({ ok: true }), token);
}
