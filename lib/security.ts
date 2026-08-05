import jwt from "jsonwebtoken";

/**
 * Security utilities for Next.js API routes.
 * Provides middleware for rate limiting, origin validation, and header injection.
 */

// ─── Rate Limiting (in-memory sliding window) ────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
  }
}, 60_000).unref();

export interface RateLimitOptions {
  /** Max requests per window (default: 30) */
  limit?: number;
  /** Window duration in seconds (default: 15) */
  windowSeconds?: number;
  /** Key prefix for distinguishing endpoint types */
  prefix?: string;
}

export function checkRateLimit(
  identifier: string,
  opts: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { limit = 30, windowSeconds = 15, prefix = "api" } = opts;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    rateLimitStore.set(key, entry);
  }

  entry.count += 1;

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

// ─── Origin / Referer Validation (CSRF protection) ──────────────────────────

const ALLOWED_ORIGINS = new Set<string>([
  "http://localhost:3000",
  "http://localhost:4000",
  "https://ledgerahq.com",
  "https://www.ledgerahq.com",
  // Vercel preview deployments
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  // Custom domain from env
  ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
]);

// Also allow any Vercel preview branch domain pattern
const VERCEL_BRANCH_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false; // Block requests without origin header for POST/PUT/DELETE
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (VERCEL_BRANCH_PATTERN.test(origin)) return true;
  return false;
}

export function validateRequestOrigin(request: Request): {
  valid: boolean;
  reason?: string;
} {
  // Only enforce for mutating methods
  const method = request.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { valid: true };
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return { valid: false, reason: "Missing Origin header" };
  }

  if (!isOriginAllowed(origin)) {
    return { valid: false, reason: `Origin not allowed: ${origin}` };
  }

  return { valid: true };
}

// ─── Security Headers Response Wrapper ──────────────────────────────────────

export function applySecurityHeaders(headers: Headers): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "0"); // Deprecated but harmless to include

  // Only set HSTS in production
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

// ─── Token validation utilities ─────────────────────────────────────────────


export function verifyApiToken(token: string): {
  valid: boolean;
  companyId?: string;
  userId?: string;
  error?: string;
} {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { valid: false, error: "JWT_SECRET not configured" };
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as {
      sub?: string;
      companyId?: string;
      userId?: string;
    };

    const companyId = decoded.companyId ?? decoded.sub;
    if (!companyId) {
      return { valid: false, error: "Token missing companyId" };
    }

    return { valid: true, companyId, userId: decoded.userId };
  } catch {
    return { valid: false, error: "Invalid or expired token" };
  }
}
