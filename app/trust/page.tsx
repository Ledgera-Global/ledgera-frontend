import Link from "next/link";

export const metadata = {
  title: "Security & Trust - Ledgera Global",
  description:
    "How Ledgera Global protects institutional financial data: encryption, tenant isolation, audit logging, backups, compliance roadmap, and subprocessors.",
};

const trustStatus = [
  {
    label: "SOC 2",
    status: "In progress",
    detail:
      "Control environment under formalization. Targeting SOC 2 Type I, then Type II, as Ledgera pursues institutional customers.",
    tone: "progress",
  },
  {
    label: "ISO 27001",
    status: "Planned",
    detail:
      "Roadmapped after SOC 2 Type II. Reuses the same control set to reduce effort.",
    tone: "planned",
  },
  {
    label: "Encryption in transit",
    status: "Active",
    detail:
      "TLS 1.2+ everywhere: customer traffic, API traffic, and database connections.",
    tone: "active",
  },
  {
    label: "Encryption at rest",
    status: "Active",
    detail:
      "Provider-level disk encryption plus AES-256-GCM application-layer encryption for integration credentials and tokens.",
    tone: "active",
  },
  {
    label: "Tenant isolation",
    status: "Active",
    detail:
      "Cross-tenant path and body access enforced in middleware and covered by automated tests.",
    tone: "active",
  },
  {
    label: "Audit logging",
    status: "Active",
    detail:
      "Sensitive route access is logged per user, method, path, and company. Backups are encrypted and restore-tested.",
    tone: "active",
  },
];

const trustControls = [
  {
    category: "Identity & access",
    items: [
      "Authentication via Supabase GoTrue (JWKS-verified) with legacy signed-token fallback",
      "Role-based authorization and per-company tenant context",
      "MFA enforced on GitHub and admin access",
      "No production credentials in repositories - secret scanning gates every push",
    ],
  },
  {
    category: "Application security",
    items: [
      "CSP and COEP security headers via Helmet",
      "Global rate limiting plus strict limits on webhooks",
      "Webhook signature verification (Stripe, Twilio, Calendly, DocuSign)",
      "Dependency and secret scanning in CI (Gitleaks + npm audit)",
    ],
  },
  {
    category: "Data protection",
    items: [
      "Multi-tenant isolation with automated regression tests",
      "Encrypted automated backups with tested restore procedure",
      "Encrypted storage of OAuth tokens and API credentials",
      "CORS allowlist enforcement in production",
    ],
  },
  {
    category: "Observability",
    items: [
      "Sentry error monitoring on backend and frontend",
      "Audit logging on sensitive routes",
      "Application health checks and automatic restarts",
      "Usage analytics without selling or renting customer data",
    ],
  },
];

const roadmap = [
  {
    phase: "Now",
    title: "Secure MVP",
    detail:
      "Tenant isolation, encryption, rate limiting, audit logs, tested backups, secret scanning, and this Trust Center.",
  },
  {
    phase: "After first customers",
    title: "Procurement-driven hardening",
    detail:
      "Close gaps exposed by real security questionnaires. Formalize access reviews, staging parity, and control narratives.",
  },
  {
    phase: "Institutional",
    title: "SOC 2 Type I → Type II",
    detail:
      "Continuous evidence collection via a compliance platform, independent auditor, annual penetration test, and workforce SSO.",
  },
  {
    phase: "Enterprise",
    title: "ISO 27001 & data residency",
    detail:
      "Regional data architectures (US/EU/CA), customer SSO, and advanced governance as institutional customers require.",
  },
];

// Append-only security journey: each entry mirrors SECURITY_IMPROVEMENT_LOG.md.
// New milestones are added to BOTH places; this timeline renders newest first.
const securityJourney = [
  {
    date: "2026-08-19",
    category: "Evidence program",
    title: "Operational security evidence program",
    detail:
      "Published six auditable procedures - access control, change management, vulnerability management, encryption & key management, data retention & deletion, and security monitoring - converting code-level controls into evidence-producing operations.",
  },
  {
    date: "2026-08-19",
    category: "Controls",
    title: "Secret hygiene hardening",
    detail:
      "Added repository-level protections that block credential files from ever being committed, closing a high-severity finding from the August security audit.",
  },
  {
    date: "2026-08-19",
    category: "Controls",
    title: "Secure Git access",
    detail:
      "Deployed secret scanning in CI (gitleaks) and npm audit gates, plus pre-commit and pre-push hooks, so every push is scanned for credentials and vulnerable dependencies.",
  },
  {
    date: "2026-08-19",
    category: "Controls",
    title: "Rate limiting and CI cleanup",
    detail:
      "Removed the duplicate global rate limiter and cleaned duplicated CI steps. A single enforced rate-limit posture (100 requests/15 min global, 10/15 min webhooks) is now in effect.",
  },
  {
    date: "2026-08-16",
    category: "Policy",
    title: "Incident response runbook",
    detail:
      "Published severity-classified incident response: SEV0-SEV3 definitions, containment and recovery phases, customer notification obligations, and a quarterly tabletop checklist.",
  },
  {
    date: "2026-08-16",
    category: "Policy",
    title: "Data map published",
    detail:
      "Documented every data class, its sensitivity and retention, all US-region storage locations, integration data flows, subprocessors, key inventory, and logs.",
  },
  {
    date: "2026-08-15",
    category: "Program",
    title: "Institutional security masterplan",
    detail:
      "Published the codebase-audited roadmap to institutional trust: tenant isolation, JWKS auth, AES-256-GCM credential encryption, tested backups, and a phased path to SOC 2 and ISO 27001.",
  },
];

const upcomingCommitments = [
  { month: "Q4 2026", title: "First formal quarterly reviews", detail: "Access, vulnerability, and retention reviews with incident response tabletop." },
  { month: "H1 2027", title: "SOC 2 readiness assessment", detail: "Control narrative draft and gap analysis with an independent auditor." },
  { month: "2027+", title: "SOC 2 Type I, then Type II", detail: "Independent examination after controls operate for 3-6 months." },
  { month: "Future", title: "ISO 27001 & data residency", detail: "Regions, customer SSO, and advanced governance as customers require." },
];

const subprocessors = [
  { name: "Vercel", role: "Frontend hosting & edge delivery", region: "US / Global edge" },
  { name: "Railway", role: "Backend hosting (US region)", region: "US" },
  { name: "Supabase", role: "Authentication & PostgreSQL database", region: "US" },
  { name: "Google Cloud / BigQuery", role: "Data warehouse for analytics", region: "US" },
  { name: "Stripe", role: "Billing & payment processing", region: "US" },
  { name: "Twilio", role: "Call tracking & messaging", region: "US" },
  { name: "Sentry", role: "Error monitoring", region: "US" },
  { name: "Calendly", role: "Scheduling", region: "US" },
];

const statusToneClasses: Record<string, { badge: string; dot: string }> = {
  active: { badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", dot: "bg-emerald-400" },
  progress: { badge: "bg-amber-400/10 text-amber-300 border-amber-400/20", dot: "bg-amber-400" },
  planned: { badge: "bg-surface-400/10 text-surface-300 border-surface-400/20", dot: "bg-surface-500" },
};

function TrustHeader() {
  return (
    <header className="border-b border-white/5 bg-surface-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
          <span className="text-lg font-semibold text-white">Ledgera Global</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-surface-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="rounded-full border border-brand-400/20 bg-brand-400/10 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-400/20 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-surface-950 hover:bg-brand-400 transition-colors">
            Book a demo
          </Link>
        </div>
      </nav>
    </header>
  );
}

function StatusCard({ card }: { card: (typeof trustStatus)[number] }) {
  const tone = statusToneClasses[card.tone];
  return (
    <article className="rounded-2xl border border-white/10 bg-surface-950/50 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-surface-300">{card.label}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {card.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-surface-400">{card.detail}</p>
    </article>
  );
}

function TrustFooter() {
  return (
    <footer className="border-t border-white/5 bg-surface-950/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-[10px] font-bold text-surface-950">L</span>
          <span className="text-sm text-surface-400">© {new Date().getFullYear()} Ledgera Global Inc.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-sm text-surface-400 hover:text-white transition-colors">Privacy</Link>
          <Link href="/eula" className="text-sm text-surface-400 hover:text-white transition-colors">Terms</Link>
          <Link href="/about" className="text-sm text-surface-400 hover:text-white transition-colors">About</Link>
          <a href="mailto:security@ledgerahq.com" className="text-sm text-surface-400 hover:text-white transition-colors">
            security@ledgerahq.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-surface-950 text-surface-100">
      <TrustHeader />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,149,106,0.08),_transparent_34%),linear-gradient(180deg,_#060910_0%,_#0d111c_55%,_#172032_100%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-400">Security & Trust</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Here is exactly how Ledgera protects your data.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-surface-300 sm:text-lg">
              Ledgera is the financial and operational infrastructure layer for service and industrial companies. That role
              only works if institutions trust how we handle their data. This page states - without marketing language -
              how we secure it today and what we are building toward.
            </p>
          </div>
        </div>
      </section>

      {/* Trust status */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-2xl font-semibold text-white">Current trust status</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trustStatus.map((card) => (
              <StatusCard key={card.label} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-white">Data architecture</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-300">
              Customer data is processed on US-hosted infrastructure. Systems of record (ServiceTitan, QuickBooks, banks,
              payroll) stay at the customer. Ledgera connects to them over authenticated, encrypted integrations.
            </p>
            <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
              <div className="rounded-2xl border border-white/10 bg-surface-950/60 p-5 text-sm text-surface-200">
                <p className="font-semibold text-white">Customer</p>
                <p className="mt-1 text-xs text-surface-400">Browser / API clients</p>
              </div>
              <span className="hidden text-surface-500 lg:block">→</span>
              <div className="rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-5 text-sm text-surface-200">
                <p className="font-semibold text-brand-200">Vercel + Supabase Edge</p>
                <p className="mt-1 text-xs text-surface-400">TLS · CDN · Auth</p>
              </div>
              <span className="hidden text-surface-500 lg:block">→</span>
              <div className="rounded-2xl border border-white/10 bg-surface-950/60 p-5 text-sm text-surface-200">
                <p className="font-semibold text-white">Railway API</p>
                <p className="mt-1 text-xs text-surface-400">Express · rate limits · tenant isolation</p>
              </div>
              <span className="hidden text-surface-500 lg:block">→</span>
              <div className="rounded-2xl border border-white/10 bg-surface-950/60 p-5 text-sm text-surface-200">
                <p className="font-semibold text-white">Encrypted PostgreSQL</p>
                <p className="mt-1 text-xs text-surface-400">US region · encrypted backups</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-surface-400">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">AES-256-GCM credential encryption</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">BigQuery analytics warehouse (US)</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">Sentry error monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-2xl font-semibold text-white">Security controls in operation</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-300">
            These controls are implemented in the platform today and are subject to automated tests and CI scanning.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {trustControls.map((group) => (
              <article key={group.category} className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-7">
                <h3 className="text-lg font-semibold text-brand-200">{group.category}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-surface-300">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-surface-950">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-brand-400/15 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-white">Compliance roadmap</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-300">
              Ledgera does not claim certifications it does not hold. This is the path to institutional-grade compliance,
              each stage triggered by real customer requirements rather than speculative spending.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {roadmap.map((stage, index) => (
                <article key={stage.phase} className="rounded-2xl border border-white/10 bg-surface-950/60 p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                    {index + 1}. {stage.phase}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-white">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-surface-400">{stage.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security journey */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-surface-950/50 p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-white">Our security journey</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-300">
              Security is not a snapshot - it is a compounding record of controls shipped, policies
              published, and audits passed. This timeline is append-only: every milestone is dated and
              retained, so you can see how Ledgera&apos;s program has improved over months, years, and
              decades - and hold us to it.
            </p>
            <ol className="relative mt-10 space-y-8 border-l border-white/10 pl-8">
              {securityJourney.map((entry) => (
                <li key={entry.date + entry.title} className="relative">
                  <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full bg-brand-400 ring-4 ring-brand-400/20" />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300">
                      {entry.date}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-surface-400">
                      {entry.category}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{entry.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-surface-400">{entry.detail}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 border-t border-white/10 pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-surface-300">
                What we have committed to next
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {upcomingCommitments.map((commitment) => (
                  <li key={commitment.month + commitment.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300">{commitment.month}</p>
                      <p className="mt-1.5 text-sm font-medium text-white">{commitment.title}</p>
                      <p className="mt-1 text-xs leading-5 text-surface-400">{commitment.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Subprocessors */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-2xl font-semibold text-white">Subprocessors</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-surface-300">
            We share customer data only with subprocessors required to operate the service. We do not sell customer data. A
            full data processing agreement is available on request.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-[0.15em] text-surface-400">
                  <th className="px-5 py-3">Subprocessor</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Region</th>
                </tr>
              </thead>
              <tbody className="text-surface-300">
                {subprocessors.map((sub) => (
                  <tr key={sub.name} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-white">{sub.name}</td>
                    <td className="px-5 py-3.5">{sub.role}</td>
                    <td className="px-5 py-3.5">{sub.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="relative py-12 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/privacy" className="group rounded-2xl border border-white/10 bg-surface-950/50 p-6 transition-colors hover:border-brand-400/25">
              <h3 className="font-semibold text-white group-hover:text-brand-100 transition-colors">Privacy Policy</h3>
              <p className="mt-2 text-sm text-surface-400">How Ledgera collects, uses, and protects data.</p>
            </Link>
            <Link href="/eula" className="group rounded-2xl border border-white/10 bg-surface-950/50 p-6 transition-colors hover:border-brand-400/25">
              <h3 className="font-semibold text-white group-hover:text-brand-100 transition-colors">Terms & EULA</h3>
              <p className="mt-2 text-sm text-surface-400">Customer terms, data ownership, and acceptable use.</p>
            </Link>
            <a href="mailto:security@ledgerahq.com" className="group rounded-2xl border border-brand-400/20 bg-brand-400/[0.06] p-6 transition-colors hover:border-brand-400/40">
              <h3 className="font-semibold text-brand-100 group-hover:text-white transition-colors">Security & DPA requests</h3>
              <p className="mt-2 text-sm text-surface-400">security@ledgerahq.com - questionnaires, DPAs, and reports.</p>
            </a>
          </div>
        </div>
      </section>

      <TrustFooter />
    </main>
  );
}
