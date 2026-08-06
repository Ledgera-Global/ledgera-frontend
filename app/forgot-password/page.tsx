"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Email is required"); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to send reset email");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
                  <span className="text-2xl text-emerald-300">✓</span>
                </div>
                <h1 className="text-2xl font-semibold text-white">Check your email</h1>
                <p className="mt-3 text-sm text-surface-400">
                  If an account exists for <strong className="text-surface-200">{email}</strong>, we{"'"}ve sent a password reset link.
                </p>
                <Link href="/login" className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400">
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
                  <p className="mt-2 text-sm text-surface-400">Enter your email and we{"'"}ll send you a reset link</p>
                </div>

                {error && (
                  <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">Email address</label>
                    <input
                      id="email" type="email" autoComplete="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                      placeholder="you@company.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? "Sending..." : "Send reset link"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-surface-400">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
