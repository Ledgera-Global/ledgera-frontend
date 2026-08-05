"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";

type IntegrationStatus = "connected" | "not_connected" | "error" | "demo";

type Integration = {
  provider: string;
  label: string;
  description: string;
  category: string;
  status: IntegrationStatus;
};

/**
 * Default integration definitions.
 * Hardcoded statuses act as fallbacks and remain for providers that lack
 * a backend IntegrationCredential record (e.g. demo-only integrations).
 * The API response overrides statuses for providers backed by real OAuth.
 */
const allIntegrations: Integration[] = [
  // Field Service
  { provider: "servicetitan", label: "ServiceTitan", description: "Field service management, job data, and technician scheduling", category: "field-service", status: "not_connected" },
  { provider: "housecall-pro", label: "Housecall Pro", description: "Dispatch, work orders, and customer management", category: "field-service", status: "not_connected" },
  { provider: "jobber", label: "Jobber", description: "Field service operations and client management", category: "field-service", status: "not_connected" },
  // Fleet & IoT
  { provider: "samsara", label: "Samsara", description: "Fleet tracking, vehicle GPS, driver behavior, and trip analytics", category: "fleet", status: "not_connected" },
  // Accounting
  { provider: "quickbooks", label: "QuickBooks Online", description: "General ledger, invoicing, and expense tracking", category: "accounting", status: "not_connected" },
  { provider: "xero", label: "Xero", description: "Cloud accounting and financial reporting", category: "accounting", status: "not_connected" },
  { provider: "netsuite", label: "NetSuite", description: "Enterprise accounting and ERP", category: "accounting", status: "not_connected" },
  // Payroll
  { provider: "gusto", label: "Gusto", description: "Payroll, benefits, and labor cost tracking", category: "payroll", status: "not_connected" },
  { provider: "adp", label: "ADP Workforce Now", description: "Enterprise payroll and HR management", category: "payroll", status: "not_connected" },
  { provider: "paychex", label: "Paychex Flex", description: "Payroll processing and labor data", category: "payroll", status: "not_connected" },
  // Payments
  { provider: "stripe", label: "Stripe", description: "Payment processing, invoice collection, and refunds", category: "payments", status: "demo" },
  { provider: "square", label: "Square", description: "Point of sale and payment processing", category: "payments", status: "not_connected" },
  // Scheduling
  { provider: "calendly", label: "Calendly", description: "Appointment scheduling and booking automation", category: "scheduling", status: "connected" },
  // Communications
  { provider: "twilio", label: "Twilio", description: "SMS, voice, and call tracking", category: "communications", status: "demo" },
  // CRM
  { provider: "hubspot", label: "HubSpot", description: "CRM, pipeline management, and lead scoring", category: "crm", status: "not_connected" },
  // Data Warehouse
  { provider: "bigquery", label: "BigQuery", description: "Data warehouse and analytics infrastructure", category: "data-warehouse", status: "not_connected" },
];

/**
 * Backend providers that have IntegrationCredential support.
 * When the API returns a status for these, it overrides the hardcoded default.
 */
const backendProviders = new Set([
  "servicetitan", "quickbooks", "netsuite", "gusto", "adp", "paychex", "samsara",
]);

const categoryLabels: Record<string, string> = {
  "field-service": "Field Service Management",
  "accounting": "Accounting & GL",
  "payroll": "Payroll",
  "payments": "Payments",
  "scheduling": "Scheduling & Booking",
  "communications": "Communications",
  "crm": "CRM",
  "data-warehouse": "Data & BI",
  "fleet": "Fleet & IoT",
};

const statusColors: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  demo: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  not_connected: "bg-surface-800/50 text-surface-400 border-surface-700/30",
  error: "bg-red-400/10 text-red-200 border-red-400/20",
};

const statusLabels: Record<IntegrationStatus, string> = {
  connected: "Connected",
  demo: "Demo Active",
  not_connected: "Not Connected",
  error: "Error",
};

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Analytics", href: "/analytics" },
  { label: "Executive", href: "/analytics/executive" },
  { label: "Acquisition", href: "/analytics/acquisition" },
  { label: "Engines", href: "/analytics/engines" },
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? "companyA";
  const [scrolled, setScrolled] = useState(false);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, IntegrationStatus> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch real integration statuses from the backend
  useEffect(() => {
    fetch(`/api/integrations?companyId=${companyId}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        // Prune to known IntegrationStatus values
        const pruned: Record<string, IntegrationStatus> = {};
        for (const [provider, status] of Object.entries(data)) {
          if (status === "connected" || status === "not_connected" || status === "error") {
            pruned[provider] = status;
          }
        }
        setLiveStatuses(pruned);
      })
      .catch((err) => {
        console.warn("[integrations] Failed to load live statuses, using defaults:", err);
        setLiveStatuses({});
      });
  }, [companyId]);

  // Merge live backend statuses into the hardcoded defaults
  const integrations = allIntegrations.map((i) => {
    if (liveStatuses && backendProviders.has(i.provider) && liveStatuses[i.provider] !== undefined) {
      return { ...i, status: liveStatuses[i.provider] };
    }
    return i;
  });

  const connectedCount = integrations.filter((i) => i.status === "connected" || i.status === "demo").length;
  const totalCount = integrations.length;
  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/integrations"
                    ? "text-white"
                    : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main */}
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-semibold text-white">Integrations</h1>
              <span className="rounded-full border border-brand-400/20 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200">
                {connectedCount}/{totalCount} active
              </span>
            </div>
            <p className="max-w-2xl text-base text-surface-300">
              Connect your existing tools to unlock the full Ledgera intelligence layer.
              Each integration feeds real operational data into our analysis engines.
            </p>
          </div>

          {/* Category sections */}
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryIntegrations = integrations.filter((i) => i.category === category);
              return (
                <section key={category}>
                  <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-surface-400">
                    {categoryLabels[category] || category}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryIntegrations.map((integration) => (
                      <div
                        key={integration.provider}
                        className="rounded-2xl border border-white/10 bg-surface-950/60 p-5 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-white">{integration.label}</h3>
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusColors[integration.status]}`}
                          >
                            {statusLabels[integration.status]}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-surface-400">{integration.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                          {integration.status === "not_connected" ? (
                            <button
                              onClick={async () => {
                                // All providers use the same backend-driven OAuth flow
                                window.location.href = `/api/oauth/connect/${integration.provider}?companyId=${companyId}`;
                              }}
                              className="rounded-full bg-brand-500/90 px-4 py-1.5 text-xs font-medium text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02]"
                            >
                              Connect &rarr;
                            </button>
                          ) : integration.status === "demo" ? (
                            <span className="rounded-full border border-brand-400/15 bg-brand-400/5 px-4 py-1.5 text-xs font-medium text-brand-300">
                              Demo data active
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-1.5 text-xs font-medium text-emerald-300">
                              Live connection
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Data layer note */}
          <div className="mt-16 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
            <h3 className="text-xl font-semibold text-white mb-3">Data infrastructure</h3>
            <p className="max-w-3xl text-sm leading-7 text-surface-300">
              All integrations feed into Ledgera&rsquo;s unified data layer &mdash; a harmonized warehouse that normalizes
              accounting, payroll, field service, and communications data into a single operating view.
              This enables cross-system analysis that individual tools cannot provide alone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["BigQuery sync", "Staging export", "Reconciliation engine", "Audit trail"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-surface-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
          <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">Landing</Link>
        </div>
      </footer>
    </div>
  );
}
