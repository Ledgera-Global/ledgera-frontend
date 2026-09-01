"use client";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../lib/auth-context";

// Mirrors the backend's internal-role allowlist (routes/internalConsole.ts).
// Only these roles may access Ledgera Global's internal surface.
const INTERNAL_ROLES = new Set([
  "admin",
  "staff",
  "exec",
  "executive",
  "internal",
  "ceo",
  "owner",
  "superadmin",
  "root",
  "operator",
]);

export default function InternalGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const role = (user.role || "").toLowerCase();
    if (!INTERNAL_ROLES.has(role)) {
      // A normal customer/visitor must never see Ledgera's internal side.
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <p className="text-sm text-surface-400">Loading&hellip;</p>
      </div>
    );
  }

  if (!user || !INTERNAL_ROLES.has((user.role || "").toLowerCase())) {
    return null;
  }

  return <>{children}</>;
}
