"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

const MIN_PASSWORD_LENGTH = 8;

type Props = {
  token: string;
};

/**
 * The client half of /reset-password.
 *
 * Split out from the page so the page can stay a server component and read the
 * token from `searchParams` without pulling the whole route into client
 * rendering.
 */
export default function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      // Same-origin proxy: `connect-src 'self'` in vercel.json blocks a direct
      // call to the backend origin.
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Could not reset the password.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
          <span className="text-2xl text-emerald-300">✓</span>
        </div>
        <h1 className="text-2xl font-semibold text-white">Password updated</h1>
        <p className="mt-3 text-sm text-surface-400">
          Your password has been changed and every other session has been signed out.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Choose a new password</h1>
        <p className="mt-2 text-sm text-surface-400">
          Pick something you have not used before. This link works once.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-surface-300 mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
            placeholder="Type it again"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? "Saving..." : "Set new password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-400">
        Link expired?{" "}
        <Link href="/forgot-password" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">
          Request another
        </Link>
      </p>
    </>
  );
}
