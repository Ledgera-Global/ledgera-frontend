/**
 * Ledgera Global's employment labels.
 *
 * Mirrors the backend allowlist in `ledgera-backend/src/security/internalAccess.ts`.
 * A label on its own never grants access - the backend additionally requires
 * `User.isInternal`, a flag no customer-facing flow can set. Both checks are
 * mirrored here because this file only decides *which surface to paint*; the
 * access control decision is made again, server-side, on every internal request.
 */
export const INTERNAL_ROLE_LABELS = [
  "admin",
  "staff",
  "exec",
  "executive",
  "internal",
  "ceo",
  "superadmin",
  "root",
  "operator",
  // A customer-side word in this product. It stays listed only so accounts
  // provisioned before `isInternal` existed keep working; a client account
  // holding it is still refused, because `isInternal` is what decides employment.
  "owner",
] as const;

const INTERNAL_ROLES: ReadonlySet<string> = new Set(INTERNAL_ROLE_LABELS);

/** True when `role` is one of Ledgera Global's employee labels. */
export function isInternalRoleLabel(role: string | null | undefined): boolean {
  if (!role) return false;
  return INTERNAL_ROLES.has(role.trim().toLowerCase());
}

/**
 * Whether this account may see Ledgera's internal surface.
 *
 * Both conditions are required, deliberately: `isInternal` decides employment,
 * the label decides the job. The value of `isInternal` must come from a server
 * response - never from session storage, which the user controls.
 */
export function isLedgeraEmployee(
  user: { role?: string | null; isInternal?: boolean } | null | undefined
): boolean {
  if (!user) return false;
  return user.isInternal === true && isInternalRoleLabel(user.role);
}
