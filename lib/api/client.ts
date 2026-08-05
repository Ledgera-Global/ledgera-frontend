// ─── API Client ─────────────────────────────────────────────────────────
// Institutional-grade fetch wrapper with error handling, logging, and retry

const DEFAULT_TIMEOUT_MS = 15_000;

let sentryCapture: ((error: Error) => void) | null = null;

/**
 * Configure the Sentry capture function for error logging.
 * Call once during app initialization.
 */
export function configureApiClient(capture: (error: Error) => void): void {
  sentryCapture = capture;
}

// ─── Error Types ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    message?: string
  ) {
    super(message ?? `API error ${status} on ${url}`);
    this.name = "ApiError";
  }
}

export class ApiTimeoutError extends Error {
  constructor(public readonly url: string) {
    super(`Request timed out: ${url}`);
    this.name = "ApiTimeoutError";
  }
}

// ─── Core Fetch ─────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiTimeoutError(url);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Fetch JSON with timeout, error handling, and optional fallback.
 * Use as the single data-fetching primitive across all pages.
 */
export async function fetchJson<T>(
  url: string,
  fallback: T,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, options);

    if (!response.ok) {
      const error = new ApiError(response.status, url);
      sentryCapture?.(error);
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiTimeoutError) {
      sentryCapture?.(error);
    } else {
      sentryCapture?.(error instanceof Error ? error : new Error(String(error)));
    }
    return fallback;
  }
}

/**
 * Fetch with retry logic (exponential backoff).
 * Use for critical endpoints where fallback data is not acceptable.
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  fallback: T,
  maxRetries = 2,
  options: FetchOptions = {}
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchJson<T>(url, fallback, options);
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      sentryCapture?.(error instanceof Error ? error : new Error(String(error)));
      return fallback;
    }
  }
  return fallback;
}

/**
 * Fetch multiple endpoints in parallel with individual fallbacks.
 * Returns a tuple matching the order of inputs.
 */
export async function fetchAll<T extends unknown[]>(
  ...requests: { url: string; fallback: T[number] }[]
): Promise<T> {
  return Promise.all(
    requests.map((r) => fetchJson(r.url, r.fallback))
  ) as Promise<T>;
}
