import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/sessionCookie";

/**
 * Removes the caller's session cookie.
 *
 * Like its `set` counterpart this used to forward to a backend route that does
 * not exist, and a cookie belonging to this origin can only be removed by a
 * response from this origin. Without this the cookie would outlive the sign-out
 * and the next visitor on a shared machine would inherit the session.
 *
 * Anything already in flight with the old cookie still has to pass the backend,
 * which re-checks the account on every request, so a stale cookie cannot
 * resurrect a session that was deliberately ended.
 */

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
