"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const principles = [
  {
    title: "Precision",
    body: "Every metric is traceable. Every recommendation can be explained. Our reports are structured so a CFO or private equity firm can rely on them without further questions.",
  },
  {
    title: "Accountability",
    body: "We tie outcomes to numbers. When we tell an owner where cash is trapped or which contract is underpriced, we show the calculation and the source.",
  },
  {
    title: "Long-term thinking",
    body: "We build for companies that plan to run for decades and for owners who want to sell one day. That means clean books, auditable reporting, and enterprise value.",
  },
  {
    title: "Operational grounding",
    body: "We sit between the field and the office. Our analysis respects how jobs are priced, dispatched, and collected, not just how they look on a spreadsheet.",
  },
];

const industries = [
  "HVAC",
  "Mechanical",
  "Plumbing",
  "Electrical",
  "Restoration",
  "Industrial services",
];

const focusAreas = [
  {
    title: "Financial intelligence",
    body: "EBITDA, cash flow, debt optimization, and enterprise value drivers.",
  },
  {
    title: "Operational intelligence",
    body: "Technician productivity, dispatch efficiency, pricing, and margins.",
  },
  {
    title: "Risk intelligence",
    body: "Cyber posture, fraud detection, financial controls, and business continuity.",
  },
  {
    title: "Strategic intelligence",
    body: "Acquisition readiness, lender reporting, benchmarking, and recommendations.",
  },
];

// ─── Small shared components (page-local, matching landing structure) ───────

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

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
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                link.href === "/about" ? "text-white" : "text-surface-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-full bg-brand-400/10 border border-brand-400/20 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-400/20 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-surface-950 hover:bg-brand-400 transition-colors">
            Sign up
          </Link>
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
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-white/5 hover:text-white ${
                  link.href === "/about" ? "text-white" : "text-surface-200"
                }`}
              >
                {link.label}
              </Link>
            ))}
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
          </div>
        </div>
      )}
    </header>
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
          <a href="https://calendly.com/hello-ledgeraglobal" className="text-sm text-surface-400 hover:text-white transition-colors">Book a demo</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-surface-950 text-surface-100">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">About Ledgera Global</p>
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Financial infrastructure for industrial service companies.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-surface-300 sm:text-xl">
              Ledgera connects your accounting, field operations, and financial data to
              measure profitability in real time and surface the decisions that move
              EBITDA, cash flow, and enterprise value.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
              <SectionTitle
                eyebrow="Mission"
                title="Give owners the same visibility their investors would demand."
                description="Most service companies operate on monthly snapshots: a P&L, a balance sheet, a guess about where profit went. We replace that with a system that tracks profitability continuously, by job, by technician, by location, and turns it into a clear next action."
              />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 lg:p-10">
              <SectionTitle
                eyebrow="What we do"
                title="Monitor profitability. Find the leaks. Recover the margin."
                description="Ledgera sits between your daily operations and your financial systems. It reconciles ServiceTitan, QuickBooks, payroll, and bank activity so the numbers you see reflect the business you actually run."
              />
              <div className="mt-8 grid gap-4">
                {focusAreas.map((area) => (
                  <article key={area.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-lg font-semibold text-white">{area.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-surface-300">{area.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
            <SectionTitle
              eyebrow="Who we serve"
              title="Built for companies that run on trucks, permits, and labor hours."
              description="Our focus starts with HVAC and expands to the trades that share the same economics: field labor, job pricing, equipment investment, and recurring maintenance contracts."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {industries.map((industry) => (
                <span key={industry} className="rounded-full border border-white/10 bg-surface-950/60 px-4 py-2 text-sm text-surface-200">
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            {principles.map((principle) => (
              <article key={principle.title} className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8">
                <h3 className="text-2xl font-semibold text-white">{principle.title}</h3>
                <p className="mt-4 text-base leading-8 text-surface-300">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              See how Ledgera reads your business.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-surface-300 sm:text-lg">
              Show us a real month of operations and we will show you where the margin is going.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://calendly.com/hello-ledgeraglobal"
                className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-300"
              >
                Book a demo
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
