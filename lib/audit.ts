/**
 * Institutional security audit logging.
 *
 * Logs security-relevant events (auth failures, rate limits, token rejections)
 * to both the server console (stdout) and, if configured, Sentry.
 *
 * In production, these logs should also be shipped to a SIEM / log aggregator.
 * Sentry capture provides real-time alerting for security teams.
 */

// ─── Sentry lazy import (only if available) ────────────────────────────────

let sentryAvailable = false;
let sentryCapture: ((err: Error, ctx?: Record<string, unknown>) => void) | null = null;

async function initSentry() {
  if (sentryAvailable) return;
  try {
    const SentryModule = await import("@sentry/nextjs");
    sentryCapture = (err: Error, ctx?: Record<string, unknown>) => {
      SentryModule.captureException(err, { extra: ctx });
    };
    sentryAvailable = true;
  } catch {
    // Sentry not installed or configured - silently degrade
    sentryCapture = null;
    sentryAvailable = false;
  }
}

// Attempt lazy init (non-blocking)
initSentry().catch(() => {
  /* ignore */
});

// ─── Event types ───────────────────────────────────────────────────────────

export type SecurityEventType =
  | "auth_failure" // Login/register failed
  | "token_rejected" // Invalid/expired JWT
  | "rate_limit_exceeded" // 429
  | "csrf_rejected" // Origin validation failed
  | "forbidden_access" // 403 (companyId mismatch)
  | "webhook_signature_failure" // Invalid Stripe/Twilio signature
  | "api_key_rejected" // Invalid API key
  | "suspicious_request"; // Catch-all for anomalous traffic

export interface SecurityEvent {
  type: SecurityEventType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  ip?: string;
  userId?: string;
  companyId?: string;
  path?: string;
  method?: string;
  metadata?: Record<string, unknown>;
}

// ─── Logging ───────────────────────────────────────────────────────────────

/**
 * Log a security event.
 *
 * In development, writes structured JSON to stderr.
 * In production, also captures to Sentry as an exception with context.
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const timestamp = new Date().toISOString();
  const logLine = JSON.stringify({
    timestamp,
    level: "security",
    type: event.type,
    severity: event.severity,
    message: event.message,
    ip: event.ip,
    userId: event.userId,
    companyId: event.companyId,
    path: event.path,
    method: event.method,
    metadata: event.metadata,
  });

  // Always log to stderr (captured by Vercel/cloudwatch/papertrail)
  console.error(`[SECURITY] ${logLine}`);

  // Capture high-severity events to Sentry
  if (
    (event.severity === "high" || event.severity === "critical") &&
    sentryCapture
  ) {
    const err = new Error(`Security: ${event.message}`);
    err.name = `SecurityEvent.${event.type}`;
    sentryCapture(err, {
      type: event.type,
      severity: event.severity,
      ip: event.ip,
      userId: event.userId,
      companyId: event.companyId,
      path: event.path,
      method: event.method,
      ...event.metadata,
    });
  }
}

/**
 * Convenience wrapper for common security events.
 */
export function logAuthFailure(
  message: string,
  ip?: string,
  metadata?: Record<string, unknown>
): void {
  logSecurityEvent({
    type: "auth_failure",
    severity: "medium",
    message,
    ip,
    metadata,
  });
}

export function logTokenRejected(
  message: string,
  ip?: string,
  path?: string
): void {
  logSecurityEvent({
    type: "token_rejected",
    severity: "high",
    message,
    ip,
    path,
  });
}

export function logRateLimitExceeded(
  ip: string,
  path: string,
  method: string
): void {
  logSecurityEvent({
    type: "rate_limit_exceeded",
    severity: "low",
    message: `Rate limit exceeded for ${method} ${path}`,
    ip,
    path,
    method,
  });
}

export function logForbiddenAccess(
  message: string,
  ip?: string,
  userId?: string,
  companyId?: string,
  path?: string
): void {
  logSecurityEvent({
    type: "forbidden_access",
    severity: "high",
    message,
    ip,
    userId,
    companyId,
    path,
  });
}

export function logCsrfRejected(
  origin: string,
  ip: string,
  path: string,
  method: string
): void {
  logSecurityEvent({
    type: "csrf_rejected",
    severity: "medium",
    message: `CSRF check failed: origin=${origin}`,
    ip,
    path,
    method,
    metadata: { origin },
  });
}

export function logWebhookSignatureFailure(
  provider: string,
  ip: string,
  reason: string
): void {
  logSecurityEvent({
    type: "webhook_signature_failure",
    severity: "high",
    message: `Invalid ${provider} webhook signature: ${reason}`,
    ip,
    metadata: { provider },
  });
}
