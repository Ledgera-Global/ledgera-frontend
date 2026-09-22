import { NextRequest, NextResponse } from "next/server";

/**
 * The browser session cookie.
 *
 * One module owns the cookie's name, lifetime and attributes because the value
 * is written in one place and read in three (`/auth/me`, the workforce proxy,
 * the customer proxy). When the writer and the readers each carried their own
 * copy of the name, the readers silently looked for a cookie nothing ever set
 * and every authenticated call came back 401. Keeping all of it here means a
 * change cannot land on one side only.
 *
 * The cookie carries the same JWT the client already holds in memory. The
 * backend never reads cookies - it only accepts `Authorization: Bearer` - so
 * the proxies in front of it translate the cookie into that header. The cookie
 * is therefore a transport convenience, not a second source of truth, and it is
 * httpOnly so page scripts cannot read it.
 */

/** Name must match what every proxy in this app reads. */
export const SESSION_COOKIE_NAME = "ledgera_token";

/**
 * Matches the backend's own token lifetime (`expiresIn: "7d"` in
 * `routes/auth.ts`). A longer cookie would linger past the point where the
 * backend rejects the token inside it; a shorter one would sign the user out
 * while their token was still valid.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * The caller's session token, from the `Authorization` header if the caller
 * sent one, otherwise from the cookie.
 *
 * Header first because an in-page caller holding the token has the freshest
 * copy; the cookie is what survives a reload.
 */
export function readSessionToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const fromHeader = authHeader.slice("Bearer ".length).trim();
    if (fromHeader) return fromHeader;
  }

  const fromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return fromCookie && fromCookie.trim() ? fromCookie : null;
}

/**
 * Attaches the session cookie to a response.
 *
 * `sameSite: "lax"` still sends the cookie on same-origin fetches while
 * blocking it on cross-site form posts, which is what CSRF protection needs
 * here. `secure` is omitted only in development, where the app is served over
 * plain http and a Secure cookie would be dropped.
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

/** Removes the session cookie by expiring it immediately. */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
