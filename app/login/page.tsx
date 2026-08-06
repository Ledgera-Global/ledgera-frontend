"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) { setLocalError("Email is required"); return; }
    if (!password) { setLocalError("Password is required"); return; }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch {
      setLocalError(null); // error is set in auth context
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
        </nav>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-surface-400">Sign in to your Ledgera account</p>
            </div>

            {displayError && (
              <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="you@company.com"
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

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-xs text-surface-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting || loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-400">
              Don&rsquo;t have an account?{" "}
              <Link href="/signup" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
