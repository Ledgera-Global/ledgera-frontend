"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";

type IntegrationStatus = "connected" | "not_connected" | "error" | "demo" | "roadmap";

type CatalogItem = {
  provider: string;
  label: string;
  description: string;
  category: string;
  authType: "oauth" | "api-token" | "webhook";
  tier: 1 | 2 | 3;
  built: boolean;
  callbackPath: string | null;
};

/**
 * Fallback catalog used when the backend is unreachable (cold start / dev).
 * Mirrors the backend registry so the page never renders empty.
 */
const FALLBACK_CATALOG: CatalogItem[] = [
  { provider: "servicetitan", label: "ServiceTitan", description: "Field service management, job data, and technician scheduling", category: "field-service", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/servicetitan/callback" },
  { provider: "housecall-pro", label: "Housecall Pro", description: "Dispatch, work orders, and customer management", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "jobber", label: "Jobber", description: "Field service operations and client management", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "fieldedge", label: "FieldEdge", description: "Dispatch, work orders, and customer management for residential HVAC/plumbing", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "service-fusion", label: "Service Fusion", description: "Field service management for HVAC, plumbing, and electrical contractors", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "successware", label: "Successware", description: "HVAC/plumbing service management platform", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "servicetrade", label: "ServiceTrade", description: "Commercial mechanical, HVAC, and restoration field service management", category: "field-service", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "simpro", label: "Simpro", description: "Commercial/mechanical job management and maintenance scheduling", category: "field-service", authType: "oauth", tier: 1, built: false, callbackPath: "/oauth/simpro/callback" },
  { provider: "samsara", label: "Samsara", description: "Fleet tracking, vehicle GPS, driver behavior, and trip analytics", category: "fleet", authType: "api-token", tier: 2, built: true, callbackPath: null },
  { provider: "quickbooks", label: "QuickBooks Online", description: "General ledger, invoicing, and expense tracking", category: "accounting", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/quickbooks/callback" },
  { provider: "quickbooks-desktop", label: "QuickBooks Enterprise/Desktop", description: "Desktop accounting used by many $3M-$15M shops", category: "accounting", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "xero", label: "Xero", description: "Cloud accounting and financial reporting", category: "accounting", authType: "oauth", tier: 2, built: false, callbackPath: null },
  { provider: "netsuite", label: "NetSuite", description: "Enterprise accounting and ERP for $10M+ operators", category: "accounting", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/netsuite/callback" },
  { provider: "sage-intacct", label: "Sage Intacct", description: "Cloud financial management for scaling service businesses", category: "accounting", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "viewpoint-vista", label: "Viewpoint Vista", description: "Construction ERP for commercial contractors", category: "accounting", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "foundation", label: "Foundation Software", description: "Construction-specific accounting and job costing", category: "accounting", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "acumatica", label: "Acumatica", description: "Cloud ERP with strong project accounting", category: "accounting", authType: "oauth", tier: 2, built: false, callbackPath: "/oauth/acumatica/callback" },
  { provider: "gusto", label: "Gusto", description: "Payroll, benefits, and labor cost tracking", category: "payroll", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/gusto/callback" },
  { provider: "adpWorkforceNow", label: "ADP Workforce Now", description: "Enterprise payroll and HR management", category: "payroll", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/adp/callback" },
  { provider: "paychexFlex", label: "Paychex Flex", description: "Payroll processing and labor data", category: "payroll", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/paychex/callback" },
  { provider: "rippling", label: "Rippling", description: "Modern payroll, HR, and IT management", category: "payroll", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "stripe", label: "Stripe", description: "Payment processing, invoice collection, and refunds", category: "payments", authType: "webhook", tier: 2, built: true, callbackPath: null },
  { provider: "authorize-net", label: "Authorize.net", description: "Payment gateway widely used by HVAC/mechanical contractors", category: "payments", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "quickbooks-payments", label: "QuickBooks Payments", description: "Intuit payment processing tied to QuickBooks", category: "payments", authType: "oauth", tier: 2, built: false, callbackPath: "/oauth/quickbooks-payments/callback" },
  { provider: "fiserv-clover", label: "Fiserv (Clover)", description: "Clover point-of-sale and payment data", category: "payments", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "plaid", label: "Plaid", description: "Banking aggregation - cash balances, transactions, and cash-flow analytics across 12,000+ financial institutions", category: "banking", authType: "oauth", tier: 1, built: true, callbackPath: "/oauth/plaid/callback" },
  { provider: "finicity", label: "Finicity (Mastercard)", description: "Open-banking data aggregation", category: "banking", authType: "api-token", tier: 3, built: false, callbackPath: null },
  { provider: "mx", label: "MX Technologies", description: "Financial data aggregation and enrichment", category: "banking", authType: "api-token", tier: 3, built: false, callbackPath: null },
  { provider: "calendly", label: "Calendly", description: "Appointment scheduling and booking automation", category: "scheduling", authType: "webhook", tier: 2, built: true, callbackPath: null },
  { provider: "callrail", label: "CallRail", description: "Call tracking, recording, and marketing attribution for missed call analysis", category: "communications", authType: "api-token", tier: 1, built: true, callbackPath: null },
  { provider: "twilio", label: "Twilio", description: "SMS, voice, and call tracking", category: "communications", authType: "webhook", tier: 2, built: true, callbackPath: null },
  { provider: "ringcentral", label: "RingCentral", description: "Cloud phone system and call analytics", category: "communications", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "zoom", label: "Zoom", description: "Video meetings and webinar data", category: "communications", authType: "api-token", tier: 2, built: true, callbackPath: null },
  { provider: "microsoft-teams", label: "Microsoft Teams", description: "Team collaboration and meeting data", category: "communications", authType: "oauth", tier: 3, built: false, callbackPath: "/oauth/teams/callback" },
  { provider: "hubspot", label: "HubSpot", description: "CRM, pipeline management, and lead scoring", category: "crm", authType: "api-token", tier: 1, built: true, callbackPath: null },
  { provider: "salesforce", label: "Salesforce", description: "Enterprise sales CRM for larger commercial teams", category: "crm", authType: "oauth", tier: 2, built: false, callbackPath: "/oauth/salesforce/callback" },
  { provider: "dynamics-365", label: "Microsoft Dynamics 365", description: "Microsoft CRM/ERP suite", category: "crm", authType: "oauth", tier: 2, built: false, callbackPath: "/oauth/dynamics/callback" },
  { provider: "google-ads", label: "Google Ads", description: "Search, display, and call-only campaign spend analytics", category: "marketing", authType: "api-token", tier: 1, built: true, callbackPath: null },
  { provider: "google-analytics", label: "Google Analytics (GA4)", description: "Website traffic, lead source, and conversion attribution", category: "marketing", authType: "api-token", tier: 1, built: false, callbackPath: null },
  { provider: "meta-ads", label: "Meta for Business", description: "Facebook/Instagram ads spend and conversion analytics", category: "marketing", authType: "api-token", tier: 1, built: true, callbackPath: null },
  { provider: "birdeye", label: "Birdeye", description: "Reviews, reputation, and local marketing", category: "marketing", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "docusign", label: "DocuSign", description: "Contract e-signature and agreement lifecycle", category: "document", authType: "oauth", tier: 2, built: true, callbackPath: "/oauth/docusign/callback" },
  { provider: "dropbox", label: "Dropbox", description: "File storage for contracts and job documents", category: "document", authType: "api-token", tier: 2, built: false, callbackPath: null },
  { provider: "google-drive", label: "Google Drive", description: "Cloud document storage", category: "document", authType: "api-token", tier: 3, built: false, callbackPath: null },
  { provider: "sharepoint", label: "Microsoft SharePoint", description: "Enterprise document management", category: "document", authType: "oauth", tier: 3, built: false, callbackPath: "/oauth/sharepoint/callback" },
  { provider: "bigquery", label: "BigQuery", description: "Data warehouse and analytics infrastructure", category: "data", authType: "api-token", tier: 2, built: true, callbackPath: null },
];

/**
 * Providers that have a working connect flow on the frontend
 * (either OAuth redirect or an API-token form). Everything else
 * renders as "coming soon" instead of a dead Connect button.
 */
const CONNECTABLE_PROVIDERS = new Set([
  "servicetitan", "quickbooks", "gusto",
  "callrail", "samsara", "google-ads", "meta-ads", "hubspot",
]);

const categoryLabels: Record<string, string> = {
  "field-service": "Field Service Management",
  "accounting": "Accounting & GL",
  "payroll": "Payroll",
  "payments": "Payments",
  "scheduling": "Scheduling & Booking",
  "communications": "Communications",
  "crm": "CRM",
  "data": "Data & BI",
  "data-warehouse": "Data & BI",
  "fleet": "Fleet & IoT",
  "banking": "Banking & Cash Flow",
  "document": "Document Management",
  "marketing": "Marketing & Attribution",
};

const statusColors: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  demo: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  not_connected: "bg-surface-800/50 text-surface-400 border-surface-700/30",
  error: "bg-red-400/10 text-red-200 border-red-400/20",
  roadmap: "bg-surface-800/30 text-surface-500 border-surface-700/20",
};

const statusLabels: Record<IntegrationStatus, string> = {
  connected: "Connected",
  demo: "Demo Active",
  not_connected: "Not Connected",
  error: "Error",
  roadmap: "On the roadmap",
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
  const [catalog, setCatalog] = useState<CatalogItem[] | null>(null);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, IntegrationStatus> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch the provider catalog from the backend registry
  useEffect(() => {
    fetch("/api/integrations/catalog")
      .then((r) => r.json())
      .then((data: CatalogItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        } else {
          setCatalog(FALLBACK_CATALOG);
        }
      })
      .catch((err) => {
        console.warn("[integrations] Failed to load catalog, using fallback:", err);
        setCatalog(FALLBACK_CATALOG);
      });
  }, []);

  // Fetch real integration statuses from the backend
  useEffect(() => {
    fetch(`/api/integrations?companyId=${companyId}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const pruned: Record<string, IntegrationStatus> = {};
        for (const [provider, status] of Object.entries(data)) {
          if (["connected", "not_connected", "error", "demo"].includes(status)) {
            pruned[provider] = status as IntegrationStatus;
          }
        }
        setLiveStatuses(pruned);
      })
      .catch((err) => {
        console.warn("[integrations] Failed to load live statuses, using defaults:", err);
        setLiveStatuses({});
      });
  }, [companyId]);

  const list: CatalogItem[] = catalog ?? FALLBACK_CATALOG;

  // Merge live backend statuses; default by tier when unknown.
  const integrations = list.map((item) => {
    const live = liveStatuses?.[item.provider];
    const status: IntegrationStatus =
      live ?? (item.tier === 3 ? "roadmap" : "not_connected");
    return { ...item, status };
  });

  const connectedCount = integrations.filter(
    (i) => i.status === "connected" || i.status === "demo"
  ).length;
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
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
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
                          {integration.status === "connected" ? (
                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-1.5 text-xs font-medium text-emerald-300">
                              Live connection
                            </span>
                          ) : integration.status === "demo" ? (
                            <span className="rounded-full border border-brand-400/15 bg-brand-400/5 px-4 py-1.5 text-xs font-medium text-brand-300">
                              Demo data active
                            </span>
                          ) : integration.status === "roadmap" ? (
                            <span className="rounded-full border border-surface-700/30 bg-surface-800/30 px-4 py-1.5 text-xs font-medium text-surface-500">
                              Coming soon
                            </span>
                          ) : CONNECTABLE_PROVIDERS.has(integration.provider) ? (
                            <button
                              onClick={async () => {
                                // Providers with a connect flow: OAuth redirect or API-token form
                                window.location.href = `/api/oauth/connect/${integration.provider}?companyId=${companyId}`;
                              }}
                              className="rounded-full bg-brand-500/90 px-4 py-1.5 text-xs font-medium text-surface-950 transition-all hover:bg-brand-400 hover:scale-[1.02]"
                            >
                              Connect &rarr;
                            </button>
                          ) : (
                            <span className="rounded-full border border-surface-700/30 bg-surface-800/30 px-4 py-1.5 text-xs font-medium text-surface-500">
                              Coming soon
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
