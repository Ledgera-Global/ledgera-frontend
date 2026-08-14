"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const metrics = [
  { label: "Cash runway", value: "14 mo", detail: "Months of operating runway" },
  { label: "EBITDA margin", value: "18.4%", detail: "Trailing 12 months" },
  { label: "Founder stress index", value: "42", detail: "Moderate, improving" },
  { label: "Estimated leakage", value: "$184K", detail: "Annualized, recoverable" },
];

const capabilities = [
  "Cash Command Center: payroll coverage, cash runway, and AR aging in one view",
  "Margin leak detection that explains where profit is disappearing",
  "AI Business Advisor grounded in the company's own cash and margin data",
  "Enterprise value tracking and acquisition readiness for owners and platforms",
  "Lender readiness reports built for banks, credit unions, and equipment lenders",
  "Benchmarking against anonymized peer companies in the same trades",
];

const workflowSteps = [
  { step: "01", title: "Understand", body: "Every morning the Command Center shows cash, payroll risk, stress, and the biggest money leaks across all locations." },
  { step: "02", title: "Decide", body: "The AI Business Advisor answers real questions: Can I afford another truck? Which branch is underperforming? Can we hire?" },
  { step: "03", title: "Act", body: "Executives get prioritized recommendations with estimated EBITDA impact, plus a weekly CEO briefing they can forward as-is." },
];

const signals = [
  "Cash runway dropped to 3.2 months at one location",
  "Payroll is covered for the next 14 days",
  "Install margins fell 3.1% on five jobs this month",
  "AR over 45 days increased 18% — escalation recommended",
];

const leadCards = [
  { company: "Cash Command Center", owner: "Owner daily screen", status: "Payroll, runway, stress", score: "Live" },
  { company: "AI Business Advisor", owner: "Grounded in your data", status: "Ask about any decision", score: "AI" },
  { company: "Enterprise Value", owner: "Exit and platform ready", status: "EBITDA, retention, maturity", score: "EV" },
];

const navLinks = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Command Center", href: "/analytics/command-center" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "Analytics", href: "/analytics" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ─── Components ──────────────────────────────────────────────────────────────

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="text-base leading-relaxed text-surface-300 sm:text-lg">{description}</p>
    </div>
  );
}


function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [user, setUser] = useState<{ email: string; companyId: string } | null>(() => {
    try {
      const raw = sessionStorage.getItem("ledgera_auth");
      if (raw) {
        return JSON.parse(raw).user;
      }
    } catch {}
    return null;
  });

  function handleLogout() {
    sessionStorage.removeItem("ledgera_auth");
    setUser(null);
    router.push("/login");
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
          <span className="text-lg font-semibold text-white">Ledgera Global</span>
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) =>
            link.href.startsWith("/dash") || link.href.startsWith("/login") || link.href.startsWith("/signup") ? (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full bg-brand-400/10 border border-brand-400/20 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-400/20 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-surface-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          {user ? (
            <>
              <span className="text-xs text-surface-400">{user.email}</span>
              <button onClick={handleLogout} className="text-sm font-medium text-surface-300 hover:text-white transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full bg-brand-400/10 border border-brand-400/20 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-400/20 transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-surface-950 hover:bg-brand-400 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-surface-200 transition-colors hover:text-white lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            {menuOpen ? (
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/5 bg-surface-950/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-base font-medium text-surface-200 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3">
                <span className="truncate text-sm text-surface-400">{user.email}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="shrink-0 text-sm font-medium text-surface-300 transition-colors hover:text-white"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-brand-400/20 bg-brand-400/10 px-4 py-2.5 text-sm font-medium text-brand-300 transition-colors hover:bg-brand-400/20"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2.5 text-sm font-medium text-surface-950 transition-colors hover:bg-brand-400"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly widget script dynamically to avoid React hydration mismatches
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16">
      {/* Background: deep navy with subtle brass glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,149,106,0.10),_transparent_34%),linear-gradient(180deg,_#060910_0%,_#0d111c_55%,_#172032_100%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-col gap-8 p-6 lg:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                Institutional operating layer
              </span>
              <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">
                For owners, platforms, and private equity
              </span>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                    Institutional financial intelligence for home services and industrial contractors.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-surface-300 sm:text-xl">
                    Ledgera gives owners, platforms, and investors one operating view of cash, payroll, margin, enterprise value, and lender readiness across every location. The AI Business Advisor answers the questions that keep owners up at night with evidence from their own numbers.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-300 hover:scale-[1.02]"
                    href="/analytics/command-center"
                  >
                    Open the Command Center
                  </Link>
                  <a
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
                    href="#capabilities"
                  >
                    Explore capabilities
                  </a>
                </div>

                <div className="mt-4 flex justify-center">
                  <div ref={calendlyRef} className="calendly-inline-widget calendly-inline-widget-home" data-url="https://calendly.com/hello-ledgeraglobal" />
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl border border-white/10 bg-surface-950/60 p-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm text-surface-400">{metric.label}</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <p className="text-3xl font-semibold text-white">{metric.value}</p>
                      <p className="text-xs text-brand-300">{metric.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section id="capabilities" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-lg shadow-black/20 backdrop-blur-sm">
            <SectionTitle
              eyebrow="Core capabilities"
              title="Built as the financial operating system for growing service companies."
              description="Every module answers a decision the owner actually makes: payroll, hiring, trucks, pricing, branches, lenders, and exit readiness."
            />
            <ul className="mt-8 space-y-3">
              {capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface-950/50 p-4 text-sm text-surface-200"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-surface-950">✓</span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 shadow-lg shadow-black/20">
            <SectionTitle
              eyebrow="Operating rhythm"
              title="From morning questions to weekly decisions."
              description="Owners stop digging through reports. The platform surfaces the answer, the evidence, and the recommended action."
            />
            <div className="mt-8 grid gap-4">
              {workflowSteps.map((item) => (
                <article key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-400/10 text-sm font-semibold text-brand-200">
                      {item.step}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-surface-300">{item.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  return (
    <section id="pipeline" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-lg shadow-black/20 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <SectionTitle
                eyebrow="Platform modules"
                title="One platform across the entire ownership lifecycle."
                description="Owner, operator, platform, and investor audiences each get the same disciplined view of the business."
              />
              <span className="shrink-0 rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">
                Live
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {leadCards.map((lead) => (
                <article key={lead.company} className="rounded-2xl border border-white/10 bg-surface-950/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{lead.company}</h3>
                      <p className="mt-1 text-sm text-surface-400">{lead.owner}</p>
                    </div>
                    <span className="rounded-full bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">{lead.score}</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-surface-300">{lead.status}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 shadow-lg shadow-black/20">
              <SectionTitle eyebrow="Executive signals" title="Operational context from live activity." description="Short, precise updates keep leadership aligned across every location." />
              <ul className="mt-6 space-y-3">
                {signals.map((signal) => (
                  <li key={signal} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-6 text-surface-200">{signal}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8 shadow-lg shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">Institutional posture</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Built for diligence, lenders, and exit.</h2>
              <p className="mt-3 text-sm leading-7 text-surface-300">Audit-ready financial reporting, documented operational maturity, and lender readiness reports make every company more valuable and easier to underwrite.</p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-surface-950/70 p-4">
                <p className="text-sm font-medium text-white">Lender readiness</p>
                <p className="mt-2 break-all font-mono text-sm text-surface-400">EBITDA, debt coverage, covenant monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-950/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-[10px] font-bold text-surface-950">L</span>
          <span className="text-sm text-surface-400">© {new Date().getFullYear()} Ledgera Global Inc.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm text-surface-400 hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="text-sm text-surface-400 hover:text-white transition-colors">Contact</Link>
          <Link href="/analytics/command-center" className="text-sm text-surface-400 hover:text-white transition-colors">Command Center</Link>
          <a href="https://calendly.com/hello-ledgeraglobal" className="text-sm text-surface-400 hover:text-white transition-colors">Book a demo</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-950 text-surface-100">
      <Navbar />
      <HeroSection />
      <CapabilitiesSection />
      <PipelineSection />
      <Footer />
    </main>
  );
}
