import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const BACKEND_FETCH_TIMEOUT_MS = 8000;

/**
 * One proxy for the whole employee workspace.
 *
 * A single catch-all rather than twenty route files: every workspace call needs
 * exactly the same three things - the caller's own session token forwarded, the
 * path passed through, and no fallback data. Twenty copies of that is twenty
 * chances for one of them to drift into serving a fixture.
 *
 * SECURITY: There is deliberately no demo-data path. The token is the caller's
 * own, and the backend re-checks `isInternal` against the database on every
 * request. An unauthenticated caller is refused here; a signed-in customer is
 * refused by the backend, and that refusal is passed through unchanged rather
 * than being softened into an empty success.
 */

/** The caller's session token: Authorization header first, then the session cookie. */
function extractSessionToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
    return req.cookies.get("ledgera_token")?.value ?? null;
}

type RouteContext = { params: Promise<{ path: string[] }> };

/** Build the backend URL, preserving the query string the browser sent. */
function backendUrl(req: NextRequest, segments: string[]): string {
    const path = segments.map(encodeURIComponent).join("/");
    const query = req.nextUrl.search;
    return `${BACKEND_URL}/internal/workforce/${path}${query}`;
}

async function forward(
    req: NextRequest,
    context: RouteContext,
    method: "GET" | "POST" | "PATCH" | "DELETE"
): Promise<NextResponse> {
    const { path } = await context.params;
    const token = extractSessionToken(req);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
        // Read the raw text rather than re-serialising parsed JSON: a body the
        // backend will reject for its shape should reach it unchanged.
        body = await req.text();
    }

    try {
        const res = await fetch(backendUrl(req, path), {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body,
            cache: "no-store",
            signal: AbortSignal.timeout(BACKEND_FETCH_TIMEOUT_MS),
        });

        const text = await res.text();
        return new NextResponse(text, {
            status: res.status,
            headers: {
                "Content-Type": res.headers.get("content-type") ?? "application/json",
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        // The workspace is unavailable, and that is what the page will say. It
        // will not quietly render an empty inbox as though the work were done.
        console.error(
            `[internal-workforce] ${method} /${path.join("/")} failed:`,
            (err as Error).message
        );
        return NextResponse.json(
            { error: "The employee workspace is temporarily unavailable" },
            { status: 503 }
        );
    }
}

export async function GET(req: NextRequest, context: RouteContext) {
    return forward(req, context, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
    return forward(req, context, "POST");
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    return forward(req, context, "PATCH");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    return forward(req, context, "DELETE");
}
