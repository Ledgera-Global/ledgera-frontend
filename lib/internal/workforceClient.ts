/**
 * Client for the employee workspace API.
 *
 * Every function throws on failure. That is the whole point of this file.
 *
 * The customer-facing pages use `fetchJson(url, fallback)`, which substitutes
 * bundled fixtures when the backend is unreachable - a reasonable choice for a
 * public product preview. Here it would be actively harmful: an internal
 * workspace that silently renders an empty task list and a zeroed brief is
 * indistinguishable from one where everything genuinely is done. A page that
 * cannot load says so.
 */

export class WorkforceApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = "WorkforceApiError";
    }
}

const BASE = "/api/internal/workforce";

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
}

/** Pull the backend's error message out of a response, with a usable default. */
async function errorMessage(res: Response): Promise<string> {
    try {
        const parsed = (await res.json()) as { error?: unknown };
        if (typeof parsed.error === "string" && parsed.error.trim()) {
            return parsed.error;
        }
    } catch {
        // A non-JSON body (a proxy page, an HTML error) is not worth surfacing raw.
    }

    if (res.status === 401) return "Your session has expired. Sign in again.";
    if (res.status === 403) return "This account is not a Ledgera employee account.";
    if (res.status === 503) return "The employee workspace is temporarily unavailable.";
    return `Request failed (${res.status}).`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    let res: Response;
    try {
        res = await fetch(`${BASE}/${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
            cache: "no-store",
        });
    } catch {
        throw new WorkforceApiError(0, "Could not reach the employee workspace.");
    }

    if (!res.ok) {
        throw new WorkforceApiError(res.status, await errorMessage(res));
    }

    if (res.status === 204) return undefined as T;

    try {
        return (await res.json()) as T;
    } catch {
        throw new WorkforceApiError(res.status, "The workspace returned an unreadable response.");
    }
}

export function workforceGet<T>(path: string): Promise<T> {
    return request<T>(path);
}

export function workforcePost<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body });
}

export function workforcePatch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "PATCH", body });
}
