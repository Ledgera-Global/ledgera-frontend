"use client";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { isLedgeraEmployee } from "../lib/internal/roles";

/**
 * Gate for Ledgera Global's internal surface.
 *
 * The decision comes from the server, never from what the browser holds. A
 * logged-in customer can edit `sessionStorage` and set any role or flag they
 * like; the only value that counts is the one `/api/auth/me` returns, which the
 * backend reads from the `User` row.
 *
 * This is still not the security boundary. Every internal endpoint re-checks
 * `isInternal` in the database on each request, so a tampered client renders an
 * empty shell whose data calls all 403. The guard exists so an employee sees
 * their workspace and a customer is never shown a door they cannot open.
 *
 * Fails closed: an unreachable or unreadable `/auth/me` denies access rather
 * than assuming the best.
 */

type Verification = "checking" | "granted" | "denied";

type MeResponse = {
  user?: { role?: string; isInternal?: boolean };
};

export default function InternalGuard({ children }: { children: ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [verification, setVerification] = useState<Verification>("checking");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setVerification("denied");
      router.replace("/internal/login");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          // No live session: send them to the internal sign-in rather than the
          // customer login, so the two front doors stay distinct.
          setVerification("denied");
          router.replace("/internal/login");
          return;
        }

        const body = (await res.json()) as MeResponse;
        if (cancelled) return;

        if (isLedgeraEmployee(body.user)) {
          setVerification("granted");
          return;
        }

        // A real, valid session that simply is not Ledgera staff.
        setVerification("denied");
        router.replace("/dashboard");
      } catch {
        if (cancelled) return;
        setVerification("denied");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [loading, user, token, router]);

  if (loading || verification === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <p className="text-sm text-surface-400" role="status">
          Verifying Ledgera Global access&hellip;
        </p>
      </div>
    );
  }

  if (verification === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950 px-6">
        <div className="max-w-md rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 text-center">
          <h1 className="text-lg font-semibold text-white">Ledgera Global internal only</h1>
          <p className="mt-2 text-sm text-surface-400">
            This workspace is limited to Ledgera Global employees. If you believe you should
            have access, ask your administrator to provision an employee account for this
            email address.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-surface-950 transition-colors hover:bg-surface-200"
          >
            Back to my workspace
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
