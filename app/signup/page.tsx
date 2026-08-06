"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim()) { setLocalError("Email is required"); return; }
    if (!companyName.trim()) { setLocalError("Company name is required"); return; }
    if (password.length < 8) { setLocalError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setLocalError("Passwords do not match"); return; }
    if (!eulaAccepted) { setLocalError("You must accept the End-User License Agreement"); return; }

    setSubmitting(true);
    try {
      await register(email.trim(), password, companyName.trim(), eulaAccepted);
      router.push("/onboarding");
    } catch {
      setLocalError(null);
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;

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
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white">Create your account</h1>
              <p className="mt-2 text-sm text-surface-400">Start tracking your financial intelligence</p>
            </div>

            {displayError && (
              <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {displayError}
              </div>
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

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-surface-300 mb-1.5">Company name</label>
                <input
                  id="companyName" type="text" autoComplete="organization" required
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="ACME HVAC Inc."
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                <input
                  id="password" type="password" autoComplete="new-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-300 mb-1.5">Confirm password</label>
                <input
                  id="confirmPassword" type="password" autoComplete="new-password" required
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-surface-950/70 px-4 py-3 text-sm text-white placeholder-surface-500 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-colors"
                  placeholder="Repeat your password"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="eula" type="checkbox" required
                  checked={eulaAccepted}
                  onChange={(e) => setEulaAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border border-white/20 bg-surface-950/70 text-brand-500 focus:ring-2 focus:ring-brand-400/20"
                />
                <label htmlFor="eula" className="text-sm text-surface-400 leading-5">
                  I have read and agree to the{" "}
                  <Link href="/eula" target="_blank" className="text-brand-300 hover:text-brand-200 underline underline-offset-2">
                    End-User License Agreement
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-brand-300 hover:text-brand-200 underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting || loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
