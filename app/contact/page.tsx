"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const channels = [
  {
    label: "Sales",
    detail: "Bookings, demos, and onboarding",
    email: "sales@ledgeraglobal.com",
  },
  {
    label: "Partnerships",
    detail: "Integrations, channel, and strategic alliances",
    email: "partners@ledgeraglobal.com",
  },
  {
    label: "General",
    detail: "Anything else",
    email: "hello@ledgeraglobal.com",
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

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
                link.href === "/contact" ? "text-white" : "text-surface-300 hover:text-white"
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
                  link.href === "/contact" ? "text-white" : "text-surface-200"
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const subject = encodeURIComponent(`${company ? `${company} | ` : ""}Inquiry from ${name || "Ledgera website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:hello@ledgeraglobal.com?subject=${subject}&body=${body}`;
  }

  return (
    <main className="min-h-screen bg-surface-950 text-surface-100">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">Contact</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Let's discuss what your numbers are hiding.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-surface-300 sm:text-xl">
              Looking to improve profitability, operational visibility, or prepare your
              business for growth? Tell us where your company stands and we will respond
              with a clear next step.
            </p>
          </div>
        </div>
      </section>

      {/* Form + channels */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Form */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
              <SectionTitle
                eyebrow="Send a message"
                title="Tell us about your business."
                description="The more context you include, the more specific our response will be."
              />
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-surface-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-surface-500 focus:border-brand-400/50 focus:outline-none"
                    placeholder="Jordan Miller"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-surface-300">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-surface-500 focus:border-brand-400/50 focus:outline-none"
                    placeholder="Summit Mechanical LLC"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-300">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-surface-500 focus:border-brand-400/50 focus:outline-none"
                    placeholder="jordan@summitmechanical.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-surface-300">
                    What are you hoping to understand?
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-surface-950/60 px-4 py-3 text-sm text-white placeholder:text-surface-500 focus:border-brand-400/50 focus:outline-none"
                    placeholder="We run four trucks and two locations. Our technicians seem busy but our margins keep slipping, where would you start?"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-300"
                >
                  Send message
                </button>
              </form>
            </div>

            {/* Channels + demo */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8">
                <SectionTitle eyebrow="Direct lines" title="Prefer email?" description="Reach the right team directly." />
                <div className="mt-6 space-y-3">
                  {channels.map((channel) => (
                    <div key={channel.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-white">{channel.label}</p>
                        <span className="text-xs text-surface-400">{channel.detail}</span>
                      </div>
                      <a href={`mailto:${channel.email}`} className="mt-2 inline-block text-sm text-brand-300 hover:text-brand-200 transition-colors">
                        {channel.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
                <SectionTitle
                  eyebrow="Book a demo"
                  title="Bring a month of real data."
                  description="We will walk through your actual numbers and show where the margin is going."
                />
                <a
                  href="https://calendly.com/hello-ledgeraglobal"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-300"
                >
                  Schedule a call
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
