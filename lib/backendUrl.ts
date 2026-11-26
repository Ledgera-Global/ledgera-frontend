/**
 * Single source of truth for "which host is the Express backend".
 *
 * The bug this exists to prevent: the login route and the API proxy both did
 * `process.env.LEDGERA_BACKEND_URL || "http://localhost:4000"`. On a laptop
 * that fallback is correct. In a Vercel serverless function, `localhost` is the
 * function itself, so a missing variable did not fail fast - it opened a
 * connection nothing was listening on and hung until the platform killed the
 * request. Every user saw a bare 502 after fifteen seconds, and the logs said
 * nothing, because the failure looked like a slow network rather than a
 * missing setting.
 *
 * So the fallback is now environment-aware:
 *   - local development keeps `localhost:4000`, which is right there;
 *   - a deployed build that has no variable set uses the production backend
 *     instead of a host that cannot exist;
 *   - a deployed build explicitly pointed at loopback is treated as a
 *     misconfiguration and corrected, with a log line naming the variable.
 *
 * Resolved per request rather than at module load, so a bad value produces one
 * loud response instead of breaking the module graph for the whole app.
 */

const LOCAL_BACKEND_URL = "http://localhost:4000";

/**
 * The live backend, as documented in .env.example.
 *
 * Held as a literal so that a missing environment variable degrades sign-in to
 * "works" rather than "hangs". It is public information - the same host is in
 * the committed example file and in every NEXT_PUBLIC_ variable.
 */
export const PRODUCTION_BACKEND_URL = "https://ledgera-backend-production.up.railway.app";

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

/** True when this process is a deployed build rather than someone's machine. */
export function isDeployedRuntime(): boolean {
  // VERCEL is set to "1" by the platform on every build and function.
  // NODE_ENV=production alone is not enough: `next build` locally sets it too,
  // but that is harmless here because the result is only used when the
  // configured URL is missing or points at loopback.
  return Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV);
}

function configuredBackendUrl(): string | null {
  const candidates = [process.env.LEDGERA_BACKEND_URL, process.env.NEXT_PUBLIC_BACKEND_URL];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return value.replace(/\/+$/, "");
  }
  return null;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True when the URL points at this machine, which a deployment never wants. */
export function isLoopbackUrl(url: string): boolean {
  const hostname = hostnameOf(url);
  return hostname !== null && LOOPBACK_HOSTNAMES.has(hostname);
}

/**
 * The backend base URL (no trailing slash) to use for this request.
 *
 * Never throws: a caller in a request path needs a URL or a clear failure it
 * can turn into a response, not an exception raised while importing a module.
 */
export function resolveBackendUrl(): string {
  const configured = configuredBackendUrl();
  const deployed = isDeployedRuntime();

  if (!configured) {
    return deployed ? PRODUCTION_BACKEND_URL : LOCAL_BACKEND_URL;
  }

  if (deployed && isLoopbackUrl(configured)) {
    console.error(
      "[backendUrl] LEDGERA_BACKEND_URL points at loopback (%s) in a deployed build; " +
        "using %s instead. Set LEDGERA_BACKEND_URL in the deployment environment.",
      configured,
      PRODUCTION_BACKEND_URL
    );
    return PRODUCTION_BACKEND_URL;
  }

  return configured;
}

/**
 * Whether the configured URL came from a real environment variable.
 * Used by diagnostics to distinguish "configured" from "fell back".
 */
export function isBackendUrlConfigured(): boolean {
  return configuredBackendUrl() !== null;
}
