/**
 * Reads the account address out of a password-reset token.
 *
 * The token is decoded, never verified. The API is the only thing that decides
 * whether a token is valid; the address read here is used for one purpose only:
 * filling a hidden username field so a password manager can file the new
 * password under the right account instead of creating an orphan entry.
 *
 * A malformed, truncated or unparseable token returns null and the reset form
 * still renders and submits normally.
 */
export function readResetTokenEmail(token: string): string | null {
  const encodedPayload = token.split(".")[1];
  if (!encodedPayload) {
    return null;
  }

  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const claims: unknown = JSON.parse(atob(padded));

    if (typeof claims !== "object" || claims === null) {
      return null;
    }

    const email = (claims as { email?: unknown }).email;
    return typeof email === "string" && email.includes("@") ? email : null;
  } catch {
    return null;
  }
}
