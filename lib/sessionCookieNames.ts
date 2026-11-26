/**
 * The cookie names, and nothing else.
 *
 * They live apart from `sessionCookie.ts` because that module imports
 * `next/server` for `NextRequest`/`NextResponse`. A client component that only
 * needs to know a cookie's name would otherwise pull the server runtime into
 * the browser bundle.
 *
 * The session cookie carries the caller's token and is httpOnly. The hint
 * carries no secret at all: it exists so page scripts can tell that a session
 * is present without being able to read it, which is what lets the app skip the
 * "am I signed in?" request on a first, anonymous visit.
 */

/** The httpOnly cookie holding the session token. Server routes read this. */
export const SESSION_COOKIE_NAME = "ledgera_token";

/** Non-secret marker written beside the session cookie. */
export const SESSION_HINT_COOKIE_NAME = "ledgera_session";
