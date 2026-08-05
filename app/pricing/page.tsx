"use client";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-surface-950 hover:bg-brand-400 transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-surface-400 hover:text-white transition-colors">Log in</Link>
                <Link href="/signup" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-surface-950 hover:bg-brand-400 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20 text-center">
            <div className="mb-8">
              <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                Per-Location Pricing
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-white">Full access to the Ledgera Financial Operating System</h1>
              <p className="mt-2 text-sm text-surface-400">Pricing is per location. Each location receives financial intelligence, operational analytics, enterprise value tracking, forecasting, and performance monitoring — so owners immediately understand why additional locations cost more.</p>
            </div>

            <div className="mb-6 space-y-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-surface-500 mb-1">Monthly subscription <span className="text-brand-300">per location</span></p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl font-bold text-white">$1,250</span>
                  <span className="text-sm text-surface-400">/month /location</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-surface-500 mb-1">One-time implementation <span className="text-brand-300">per location</span></p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-2xl font-bold text-white">$2,500</span>
                  <span className="text-sm text-surface-400">setup /location</span>
                </div>
              </div>
              <p className="text-xs text-surface-500 pt-1">
                First month total: <span className="text-surface-300 font-medium">$3,750 per location</span> &mdash; then $1,250/month per location
              </p>
            </div>

            <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-6">
              <ul className="space-y-3 text-left text-sm text-surface-300">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Profit leakage detection & alerts
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Cash flow & AR aging dashboards
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Technician efficiency scoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Recovery automation engine
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Enterprise value tracking & forecasting
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  Executive reporting & analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400 shrink-0">✓</span>
                  ServiceTitan & QuickBooks integration
                </li>
              </ul>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-8 py-4 text-base font-semibold text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02]"
            >
              Get started
            </Link>

            <p className="mt-6 text-xs text-surface-500">
              Secure payment via Stripe. Cancel anytime. No hidden fees.
            </p>
          </div>

          {/* Enterprise tier */}
          <div className="mt-8 rounded-[2rem] border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8 shadow-xl shadow-black/20 text-center">
            <span className="inline-flex rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              Enterprise
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-white">10+ locations? Contact Sales</h2>
            <p className="mt-3 text-sm text-surface-300 leading-relaxed max-w-sm mx-auto">
              Larger operators qualify for custom onboarding, dedicated support, tailored integrations, and volume pricing. Schedule a conversation with our team.
            </p>
            <a
              href="https://calendly.com/hello-ledgeraglobal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-full border border-brand-400/40 bg-brand-400/10 px-6 py-3 text-sm font-semibold text-brand-200 transition-all hover:bg-brand-400/20 hover:scale-[1.02]"
            >
              Contact Sales →
            </a>
          </div>

          {/* Trust & Infrastructure */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">Security</p>
              <p className="text-xs text-surface-400 leading-5">AES-256-GCM encryption, rate limiting, CSRF protection, and HSTS</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">Infrastructure</p>
              <p className="text-xs text-surface-400 leading-5">BigQuery data warehouse, encrypted backups, Stripe payments</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">Compliance</p>
              <p className="text-xs text-surface-400 leading-5">Audit logging, multi-tenant isolation, EULA & privacy policy</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">Integrations</p>
              <p className="text-xs text-surface-400 leading-5">ServiceTitan, QuickBooks, Gusto, ADP, BigQuery, NetSuite</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">OAuth 2.0</p>
              <p className="text-xs text-surface-400 leading-5">Secure token-based authentication for every integration</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300 mb-1">SLA</p>
              <p className="text-xs text-surface-400 leading-5">99.9% uptime, priority support, dedicated account management</p>
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-surface-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200 transition-colors">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
