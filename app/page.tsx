"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const heroMetrics = [
  { label: "Cash runway", value: "14 mo", detail: "Months of operating runway" },
  { label: "EBITDA margin", value: "18.4%", detail: "Trailing 12 months" },
  { label: "Founder stress index", value: "42", detail: "Moderate, improving" },
  { label: "Estimated leakage", value: "$184K", detail: "Annualized, recoverable" },
];

const homeServices = ["HVAC", "Plumbing", "Electrical", "Restoration", "Mechanical"];
const industrialServices = ["Industrial Maintenance", "Field Services", "Specialty Contracting", "Infrastructure Services"];

const sourceSystems = ["QuickBooks", "ServiceTitan", "NetSuite", "Banks", "Payroll", "CRM"];

const thesisQuadrants = [
  {
    title: "Financial",
    items: ["Revenue", "Cash flow", "Gross margin", "EBITDA", "AR / AP", "Working capital"],
  },
  {
    title: "Operational",
    items: ["Jobs", "Labor", "Technicians", "Dispatch", "Utilization", "Maintenance agreements"],
  },
  {
    title: "Commercial",
    items: ["Pricing", "Sales", "Customers", "Recurring revenue", "Pipeline"],
  },
  {
    title: "Investment",
    items: ["Valuation", "Acquisition readiness", "Portfolio performance", "Scenario analysis"],
  },
];

const problemFlow = [
  { label: "Systems of record", detail: "QuickBooks · ServiceTitan · NetSuite · Banking · Payroll · CRM" },
  { label: "Fragmented data", detail: "Each system records its own slice of the business" },
  { label: "Ledgera Global", detail: "One normalized intelligence layer" },
  { label: "Decision", detail: "Cash, margin, hire, invest, exit - grounded in evidence" },
];

const audiences = [
  {
    title: "Operators",
    tagline: "Real-time financial control",
    body: "Know where margin, cash, and operational performance are moving before month-end. Own the morning questions: payroll, trucks, hiring, pricing.",
  },
  {
    title: "Private Equity",
    tagline: "Portfolio intelligence",
    body: "Standardize financial and operational data across portfolio companies and identify value-creation opportunities - from one view.",
  },
  {
    title: "Family Offices",
    tagline: "Investment visibility",
    body: "Evaluate operating companies with consistent financial and operational intelligence instead of bespoke monthly pack reads.",
  },
  {
    title: "Strategic Acquirers",
    tagline: "Acquisition intelligence",
    body: "Assess companies, normalize financial information, and monitor post-acquisition performance on a common operating layer.",
  },
];

const architectureSteps = [
  {
    step: "01",
    title: "Connect",
    body: "Integrate financial, operational, and commercial systems - without replacing the systems of record you already run on.",
  },
  {
    step: "02",
    title: "Normalize",
    body: "Create a unified financial and operational data model across locations, entities, and systems.",
  },
  {
    step: "03",
    title: "Intelligence",
    body: "AI continuously identifies changes, anomalies, margin leakage, cash-flow risk, and operational inefficiencies.",
  },
];

const modules = [
  { name: "Cash Command Center", href: "/analytics/command-center", detail: "Payroll coverage, cash runway, and AR aging - the owner's daily screen." },
  { name: "AI Business Advisor", href: "/dashboard", detail: "\u201CCan I afford another truck?\u201D answered with evidence from your own data." },
  { name: "Margin Leak Detection", href: "/analytics", detail: "Explains where profit disappears - by job, technician, and location." },
  { name: "Enterprise Value Tracker", href: "/analytics/value-growth", detail: "EBITDA, retention, and operational maturity, tracked continuously." },
  { name: "Acquisition & Diligence", href: "/analytics/acquisition", detail: "Readiness scores, diligence reports, and multiple-potential analysis." },
  { name: "Lender Readiness", href: "/analytics/lender-readiness", detail: "Debt coverage, covenants, and reports built for banks and lenders." },
  { name: "Institutional Risk", href: "/analytics/institutional-risk", detail: "Debt dashboard, covenant monitoring, and executive risk signals." },
  { name: "Peer Benchmarks", href: "/analytics/benchmarks", detail: "Anonymized comparison of margins and KPIs across the same trades." },
  { name: "Missed-Call Revenue", href: "/analytics/missed-calls", detail: "Recover revenue lost to calls that never converted." },
  { name: "Marketing Profit", href: "/analytics/marketing-profit", detail: "Which spend actually produces margin - not just leads." },
  { name: "Founder Stress Index", href: "/analytics/command-center", detail: "A single score for operational health across the company." },
  { name: "Weekly CEO Briefing", href: "/analytics/executive", detail: "Priorities, alerts, and recommended actions every Monday morning." },
];

const portfolioRows = [
  { company: "Company A", revenue: "$18.4M", grossMargin: "41.2%", ebitda: "14.8%", cash: "$2.1M", risk: "Low" },
  { company: "Company B", revenue: "$31.7M", grossMargin: "34.6%", ebitda: "9.2%", cash: "$1.4M", risk: "Watch" },
  { company: "Company C", revenue: "$12.9M", grossMargin: "38.1%", ebitda: "12.6%", cash: "$3.0M", risk: "Low" },
];

const integrations = [
  { name: "QuickBooks", role: "Accounting" },
  { name: "ServiceTitan", role: "Field operations" },
  { name: "NetSuite", role: "ERP" },
  { name: "Banking", role: "Cash" },
  { name: "Payroll", role: "Labor cost" },
  { name: "CRM", role: "Sales & pipeline" },
  { name: "Samsara", role: "Fleet" },
  { name: "CallRail", role: "Call intelligence" },
];

const infrastructureItems = [
  "Role-based access & entity-level permissions",
  "Tenant data isolation across every company",
  "Full audit logging and traceability",
  "Encryption at rest and in transit",
  "Secure OAuth integrations with read/write controls",
  "API infrastructure for institutional data exchange",
  "Entity-level multi-company permissions",
  "Architected toward SOC 2 and institutional governance standards",
];

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "For Operators", href: "#audiences" },
  { label: "For Investors", href: "#audiences" },
  { label: "Intelligence", href: "#architecture" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "Company", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ─── Shared components ───────────────────────────────────────────────────────

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
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="text-sm font-medium text-surface-300 hover:text-white transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="text-sm font-medium text-surface-300 hover:text-white transition-colors">
                {link.label}
              </Link>
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
                Request access
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
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-surface-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-surface-200 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
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
                  Request access
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative pt-36 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,149,106,0.10),_transparent_34%),linear-gradient(180deg,_#060910_0%,_#0d111c_55%,_#172032_100%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-col gap-8 p-6 lg:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                Institutional operating layer
              </span>
              <span className="inline-flex rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">
                Owners · Operators · Private equity · Institutional capital
              </span>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
                    The financial operating system for the service economy.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-surface-300 sm:text-xl">
                    Ledgera Global connects financial, operational, and transactional data across home services and industrial services into a real-time intelligence layer for owners, operators, and the institutions that finance and invest in them.
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
                    href="#platform"
                  >
                    Explore the platform
                  </a>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Home services</span>
                    <span className="text-sm text-surface-300">{homeServices.join(" · ")}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Industrial services</span>
                    <span className="text-sm text-surface-300">{industrialServices.join(" · ")}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl border border-white/10 bg-surface-950/60 p-4">
                {heroMetrics.map((metric) => (
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

            {/* Systems → Ledgera → Decision pipeline */}
            <div className="rounded-2xl border border-white/10 bg-surface-950/60 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {sourceSystems.map((system) => (
                  <span key={system} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-surface-300">
                    {system}
                  </span>
                ))}
                <span className="text-surface-500">→</span>
                <span className="rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1.5 text-xs font-semibold text-brand-200">
                  Ledgera intelligence layer
                </span>
                <span className="text-surface-500">→</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white">
                  Decisions
                </span>
              </div>
              <p className="mt-3 text-xs text-surface-400">
                Financial and operational systems stay in place. Ledgera sits above them as the intelligence layer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThesisSection() {
  return (
    <section id="platform" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-12 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="The thesis"
              title="One intelligence layer across the operating company."
              description="Financial systems record transactions. Operating systems record activity. Banks record cash. CRMs record relationships. Ledgera unifies them."
            />
            <p className="max-w-sm text-base leading-7 text-surface-300">
              Ledgera Global transforms fragmented operating data into institutional-grade financial intelligence.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {thesisQuadrants.map((quadrant) => (
              <article key={quadrant.title} className="rounded-2xl border border-white/10 bg-surface-950/50 p-5">
                <h3 className="text-lg font-semibold text-brand-200">{quadrant.title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {quadrant.items.map((item) => (
                    <li key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-surface-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <SectionTitle
              eyebrow="The problem"
              title="The service economy runs on fragmented infrastructure."
              description="None of the underlying systems provides a unified view of how the business actually performs. Owners and investors reconcile reality from month-end packs."
            />
            <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">The result</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-surface-300">
                <li>Owners discover margin problems weeks after they happen.</li>
                <li>Investors cannot compare companies on consistent numbers.</li>
                <li>Lenders underwrite on stale, manually assembled data.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            {problemFlow.map((node, index) => (
              <div key={node.label} className="rounded-2xl border border-white/10 bg-surface-950/50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <span className="mr-2 text-brand-300">0{index + 1}</span>
                      {node.label}
                    </h3>
                    <p className="mt-1 text-sm text-surface-400">{node.detail}</p>
                  </div>
                  <span className="text-xl text-surface-600">↓</span>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-brand-400/25 bg-brand-400/10 p-5">
              <h3 className="text-lg font-semibold text-brand-100">Financial intelligence</h3>
              <p className="mt-1 text-sm text-surface-300">The unified view that turns data into confident decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudiencesSection() {
  return (
    <section id="audiences" className="relative py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionTitle
          eyebrow="Who it's for"
          title="Built for the people who operate and allocate capital."
          description="One operating layer serves the owner in the field and the institution underwriting the business."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {audiences.map((audience) => (
            <article key={audience.title} className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-white">{audience.title}</h3>
                <span className="rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">
                  {audience.tagline}
                </span>
              </div>
              <p className="mt-4 text-base leading-8 text-surface-300">{audience.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionTitle
          eyebrow="Platform architecture"
          title="An intelligence layer built on the operating company's data."
          description="AI is not the product. It is the engine underneath the infrastructure."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {architectureSteps.map((item) => (
            <article key={item.step} className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 shadow-lg shadow-black/20">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-400/10 text-base font-semibold text-brand-200">
                {item.step}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-surface-300">{item.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-6 text-center">
          <p className="text-base leading-7 text-surface-200">
            {"AI doesn't replace the underlying financial infrastructure. It makes the infrastructure intelligent."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Platform modules"
            title="Everything the owner and the institution need, in one layer."
            description="Each module answers a real decision - payroll, trucks, pricing, lenders, exit - not just a chart."
          />
          <span className="rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">Live</span>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="group rounded-2xl border border-white/10 bg-surface-950/50 p-6 transition-colors hover:border-brand-400/25 hover:bg-surface-950/80"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-100 transition-colors">{module.name}</h3>
              <p className="mt-3 text-sm leading-6 text-surface-300">{module.detail}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioSection() {
  return (
    <section id="portfolio" className="relative py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Portfolio intelligence"
              title="From individual operating companies to portfolio-wide intelligence."
              description="Creditors, acquirers, and fund managers see every company on the same normalized operating layer."
            />
            <Link
              href="/analytics/acquisition"
              className="rounded-full border border-brand-400/25 bg-brand-400/10 px-5 py-2.5 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-400/20"
            >
              Explore acquisition intelligence →
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-[0.15em] text-surface-400">
                  <th className="py-3 pr-4">Company</th>
                  <th className="py-3 pr-4">Revenue</th>
                  <th className="py-3 pr-4">Gross margin</th>
                  <th className="py-3 pr-4">EBITDA</th>
                  <th className="py-3 pr-4">Cash</th>
                  <th className="py-3">Risk</th>
                </tr>
              </thead>
              <tbody className="text-sm text-surface-200">
                {portfolioRows.map((row) => (
                  <tr key={row.company} className="border-b border-white/5 last:border-0">
                    <td className="py-4 pr-4 font-medium text-white">{row.company}</td>
                    <td className="py-4 pr-4">{row.revenue}</td>
                    <td className="py-4 pr-4">{row.grossMargin}</td>
                    <td className="py-4 pr-4">{row.ebitda}</td>
                    <td className="py-4 pr-4">{row.cash}</td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          row.risk === "Low"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 lg:p-10 shadow-lg shadow-black/20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Integrations"
              title="Built on the systems businesses already run."
              description="Ledgera does not require companies to replace ServiceTitan, QuickBooks, or their bank. It connects them."
            />
            <Link
              href="/integrations"
              className="rounded-full border border-brand-400/25 bg-brand-400/10 px-5 py-2.5 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-400/20"
            >
              View integrations →
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-base font-semibold text-white">{integration.name}</h3>
                <p className="mt-1 text-xs text-surface-400">{integration.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSection() {
  return (
    <section id="infrastructure" className="relative py-24 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionTitle
          eyebrow="Institutional infrastructure"
          title="Infrastructure for institutional capital."
          description="The architecture is built to the standard institutional counterparties expect before they connect their capital to operating data."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {infrastructureItems.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-surface-950/50 p-4 text-sm text-surface-200">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-surface-950">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisionCtaSection() {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.07] to-white/[0.02] p-8 lg:p-14 text-center shadow-xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">The vision</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            The financial infrastructure layer for the service economy.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-surface-300 sm:text-lg">
            The service economy represents trillions of dollars of activity across thousands of fragmented operating companies. Ledgera Global builds the intelligence layer that connects those businesses to the capital and institutions that finance, acquire, and operate them.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-brand-400 px-6 py-3.5 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-300 hover:scale-[1.02]"
            >
              For Operators - Request Access
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
            >
              For Investors - Institutional Access
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:scale-[1.02]"
            >
              For Partners - Partner With Us
            </Link>
          </div>

          <div className="mt-10 flex justify-center">
            <div ref={calendlyRef} className="calendly-inline-widget calendly-inline-widget-home" data-url="https://calendly.com/hello-ledgeraglobal" />
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
      <ThesisSection />
      <ProblemSection />
      <AudiencesSection />
      <ArchitectureSection />
      <ModulesSection />
      <PortfolioSection />
      <IntegrationsSection />
      <InfrastructureSection />
      <VisionCtaSection />
      <Footer />
    </main>
  );
}
