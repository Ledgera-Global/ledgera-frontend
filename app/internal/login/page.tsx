"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { isLedgeraEmployee } from "@/lib/internal/roles";

/**
 * The internal front door.
 *
 * `InternalGuard` sends anyone without a live session here rather than to the
 * customer login, so the two front doors stay distinct: a customer should never
 * be nudged toward the staff entrance, and an employee should not be told to
 * create a company account.
 *
 * Signing in proves nothing about employment. The decision is made by the server:
 * `login()` establishes the session, then `/api/auth/me` is read back and the
 * account is admitted only when the server reports `isInternal` plus an employee
 * label. A customer who signs in successfully here is told plainly that this door
 * is not for them and is pointed at their own workspace.
 */

type MeResponse = {
  user?: { role?: string; isInternal?: boolean };
};

export default function InternalLoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notStaff, setNotStaff] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setNotStaff(false);

    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }
    if (!password) {
      setLocalError("Password is required");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);

      // The session exists, but employment is decided by the server, never by
      // what this page holds. Read the identity back before admitting anyone.
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        setLocalError("Signed in, but your account could not be verified. Try again.");
        return;
      }

      const body = (await res.json()) as MeResponse;
      if (isLedgeraEmployee(body.user)) {
        router.push("/internal/workforce");
        return;
      }

      setNotStaff(true);
    } catch {
      // The auth context holds the message for a failed sign-in.
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;
  const busy = submitting || loading;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
              L
            </span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-surface-500">
            Internal
          </span>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white">Staff sign-in</h1>
              <p className="mt-2 text-sm text-surface-400">
                The internal workspace is limited to Ledgera Global employees.
              </p>
            </div>

            {displayError && (
              <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {displayError}
              </div>
            )}

            {notStaff && (
              <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                <p className="font-medium">This sign-in is for Ledgera Global staff.</p>
                <p className="mt-1 text-amber-200/90">
                  Your account is a customer account, so the internal workspace stays
                  closed to it.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block font-medium text-amber-100 underline underline-offset-4 hover:text-white"
                >
                  Go to my workspace
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="you@ledgerahq.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-400">
              Not Ledgera staff?{" "}
              <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">
                Use the customer sign-in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
