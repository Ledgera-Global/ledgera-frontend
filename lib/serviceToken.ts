import jwt from "jsonwebtoken";

/**
 * Server-to-server service credentials.
 *
 * Cron jobs and schedulers have no logged-in user, so they cannot present a
 * user session token. Rather than forging a fake user identity (which would
 * bypass per-user revocation checks), automation presents a credential that
 * declares itself as such via `scope: "service"`.
 *
 * The backend accepts these only when the claim matches exactly and derives the
 * tenant from `companyId`. Because a service principal carries no user id, it
 * cannot reach user-scoped routes. Service tokens are short-lived.
 */

/** How long a minted service credential remains valid. */
const SERVICE_TOKEN_TTL_SECONDS = 300;

/**
 * Claim value that marks a token as a service credential. Must match the value
 * the backend's auth middleware requires.
 */
const SERVICE_SCOPE = "service";

/**
 * Resolves the signing secret. Prefers SERVICE_JWT_SECRET so automation can be
 * rotated independently of user sessions; falls back to JWT_SECRET, which the
 * backend also uses as its default for service credentials.
 */
function resolveSigningSecret(): string {
  const secret = process.env.SERVICE_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET (or SERVICE_JWT_SECRET) is not configured");
  }
  return secret;
}

/**
 * Mints a short-lived service credential scoped to a single company.
 *
 * @param companyId Tenant the credential may act for.
 * @param service   Human-readable name of the calling job, recorded in audit logs.
 */
export function issueServiceToken(companyId: string, service: string): string {
  return jwt.sign(
    { scope: SERVICE_SCOPE, companyId, service },
    resolveSigningSecret(),
    { algorithm: "HS256", expiresIn: SERVICE_TOKEN_TTL_SECONDS }
  );
}
