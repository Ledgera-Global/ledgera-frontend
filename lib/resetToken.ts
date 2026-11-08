/**
 * Reads the email address out of a password-reset token, if the token carries one.
 *
 * The address is display-only: it feeds a hidden username field so password
 * managers can file the new password under the right account. The token is
 * decoded, not verified. The backend verifies it on /auth/reset-password, so
 * nothing here should be trusted for any decision.
 *
 * Never throws. Returns null for malformed tokens or when no usable email
 * claim is present.
 */
export function readResetTokenEmail(token: string): string | null {
  try {
    const segments = token.split(".");
    if (segments.length !== 3) return null;

    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload: unknown = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));

    if (!payload || typeof payload !== "object") return null;

    const email = (payload as { email?: unknown }).email;
    if (typeof email === "string" && email.length > 0 && email.includes("@")) {
      return email;
    }
    return null;
  } catch {
    return null;
  }
}
