import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const APP_URL = process.env.APP_URL || "https://ledgerahq.com";

interface CatalogField {
  key: string;
  label: string;
  placeholder: string;
  secret: boolean;
}

interface CatalogItem {
  provider: string;
  label: string;
  description: string;
  category: string;
  authType: "oauth" | "api-token" | "webhook";
  tier: number;
  built: boolean;
  fields?: CatalogField[];
  docsUrl?: string | null;
}

/**
 * Local mirror of the backend registry - used when the backend catalog is
 * unreachable so connect forms still render. Field definitions must match
 * ledgera-backend/src/integrations/registry.ts.
 */
const LOCAL_REGISTRY: CatalogItem[] = [
  { provider: "servicetitan", label: "ServiceTitan", description: "", category: "", authType: "oauth", tier: 1, built: true },
  { provider: "quickbooks", label: "QuickBooks Online", description: "", category: "", authType: "oauth", tier: 1, built: true },
  { provider: "gusto", label: "Gusto", description: "", category: "", authType: "oauth", tier: 1, built: true },
  { provider: "housecall-pro", label: "Housecall Pro", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [{ key: "apiKey", label: "API Key", placeholder: "Paste your Housecall Pro API key...", secret: true }] },
  { provider: "autodesk-acc", label: "Autodesk Construction Cloud", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "accessToken", label: "Access Token (APS)", placeholder: "Paste your Autodesk APS token...", secret: true },
      { key: "accountId", label: "Account ID", placeholder: "Autodesk account id", secret: false },
    ] },
  { provider: "viewpoint-vista", label: "Viewpoint Vista (Trimble)", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Paste your Vista API key...", secret: true },
      { key: "baseUrl", label: "Instance URL", placeholder: "https://api.viewpoint.com", secret: false },
    ] },
  { provider: "netsuite", label: "NetSuite", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your NetSuite access token...", secret: true },
      { key: "accountId", label: "Account ID", placeholder: "NetSuite account id", secret: false },
    ] },
  { provider: "sage-intacct", label: "Sage Intacct", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "senderId", label: "Sender ID", placeholder: "Sage Intacct Sender ID", secret: false },
      { key: "senderPassword", label: "Sender Password", placeholder: "Sage Intacct Sender Password", secret: true },
      { key: "companyId", label: "Company ID", placeholder: "Sage Intacct Company ID", secret: false },
      { key: "userId", label: "User ID", placeholder: "Sage Intacct web service user", secret: false },
      { key: "userPassword", label: "User Password", placeholder: "Sage Intacct web service password", secret: true },
    ] },
  { provider: "salesforce", label: "Salesforce", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your Salesforce access token...", secret: true },
      { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourOrg.my.salesforce.com", secret: false },
    ] },
  { provider: "dynamics-365", label: "Microsoft Dynamics 365", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your Microsoft identity platform access token...", secret: true },
      { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourorg.crm.dynamics.com", secret: false },
    ] },
  { provider: "adpWorkforceNow", label: "ADP Workforce Now", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your ADP access token...", secret: true },
      { key: "workforceOrgId", label: "Workforce Org ID", placeholder: "ADP workforce organization id", secret: false },
    ] },
  { provider: "paychexFlex", label: "Paychex Flex", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your Paychex access token...", secret: true },
      { key: "clientId", label: "Client ID", placeholder: "Paychex client id", secret: false },
    ] },
  { provider: "bamboohr", label: "BambooHR", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Paste your BambooHR API key...", secret: true },
      { key: "subdomain", label: "Subdomain", placeholder: "e.g. mycompany", secret: false },
    ] },
  { provider: "workday", label: "Workday", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "accessToken", label: "Access Token (ISU)", placeholder: "Paste your Workday integration token...", secret: true },
      { key: "tenantBaseUrl", label: "Tenant Base URL", placeholder: "https://services1.myworkday.com/ccx/...", secret: false },
    ] },
  { provider: "plaid", label: "Plaid", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "accessToken", label: "Plaid Access Token", placeholder: "access_production-...", secret: true },
      { key: "institutionName", label: "Institution Name", placeholder: "e.g. Chase", secret: false },
    ] },
  { provider: "procore", label: "Procore", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "apiToken", label: "API Token", placeholder: "Paste your Procore API token...", secret: true },
      { key: "companyId", label: "Procore Company ID", placeholder: "Numeric Procore company id", secret: false },
    ] },
  { provider: "google-ads", label: "Google Ads", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "customerId", label: "Customer ID", placeholder: "e.g. 123-456-7890", secret: false },
      { key: "apiToken", label: "Developer Token", placeholder: "Google Ads developer token...", secret: true },
    ] },
  { provider: "meta-ads", label: "Meta for Business", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "adAccountId", label: "Ad Account ID", placeholder: "e.g. 123456789012345", secret: false },
      { key: "apiToken", label: "System User Access Token", placeholder: "Meta long-lived token...", secret: true },
    ] },
  { provider: "callrail", label: "CallRail", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [
      { key: "accountId", label: "Account ID", placeholder: "e.g. 123456", secret: false },
      { key: "apiToken", label: "API Token", placeholder: "Paste your CallRail API token...", secret: true },
    ] },
  { provider: "hubspot", label: "HubSpot", description: "", category: "", authType: "api-token", tier: 1, built: true,
    fields: [{ key: "apiToken", label: "Private App Token", placeholder: "Paste your HubSpot private app token...", secret: true }] },
  { provider: "zoom", label: "Zoom", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [{ key: "apiToken", label: "Server-to-Server Token", placeholder: "Paste your Zoom token...", secret: true }] },
  { provider: "docusign", label: "DocuSign", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "Paste your DocuSign access token...", secret: true },
      { key: "accountId", label: "Account ID", placeholder: "DocuSign account id", secret: false },
    ] },
  { provider: "bigquery", label: "BigQuery", description: "", category: "", authType: "api-token", tier: 2, built: true,
    fields: [
      { key: "projectId", label: "Project ID", placeholder: "GCP project id", secret: false },
      { key: "apiToken", label: "Service Account Key (JSON)", placeholder: "Paste service account JSON...", secret: true },
    ] },
];

/** Per-provider setup instructions shown above the form. */
const SETUP_STEPS: Record<string, string[]> = {
  "housecall-pro": ["Log in to your Housecall Pro account", "Go to <strong>Settings &rarr; API</strong> and create an API token", "Paste the token below and click Connect"],
  "autodesk-acc": ["Create an app in the Autodesk Developer Console and provision an access token", "Note your <strong>Account ID</strong> from the ACC admin console URL", "Paste both below and click Connect"],
  "viewpoint-vista": ["Generate an API key in your Vista admin console", "Note your instance API base URL", "Paste both below and click Connect"],
  netsuite: ["In NetSuite go to <strong>Setup &rarr; Users/Roles &rarr; Access Tokens</strong>", "Create a token for an integration record and copy it plus your account id", "Paste both below and click Connect"],
  "sage-intacct": ["Create a web services user in Sage Intacct admin", "Collect sender id/password and company/user credentials", "Paste all five values below and click Connect"],
  salesforce: ["Create a connected app or use <strong>OAuth 2.0 JWT bearer</strong> to obtain an access token", "Copy your instance URL from the browser bar after login", "Paste both below and click Connect"],
  "dynamics-365": ["Register an app in Microsoft Entra ID and grant Dynamics 365 user_impersonation", "Acquire an access token and copy your CRM instance URL (yourorg.crm.dynamics.com)", "Paste both below and click Connect"],
  adpWorkforceNow: ["Request an ADP service account credential pair", "Generate an access token via the ADP OAuth client-credentials flow", "Paste the token and org id below and click Connect"],
  paychexFlex: ["Provision a Paychex integration user", "Generate an access token via Paychex OAuth", "Paste the token and client id below and click Connect"],
  bamboohr: ["In BambooHR, click your avatar &rarr; <strong>API Keys</strong> and generate a key", "Note your subdomain (from mycompany.bamboohr.com)", "Paste both below and click Connect"],
  workday: ["Provision an Integration System User and generate its token", "Copy your tenant base URL (services1.myworkday.com/ccx/...)", "Paste both below and click Connect"],
  plaid: ["Exchange a Plaid Link public_token for an access_token using your Plaid keys", "Note the institution name you linked", "Paste both below and click Connect"],
  procore: ["Create a Procore app in the developer portal and request an API token", "Note your numeric Procore company id", "Paste both below and click Connect"],
  "google-ads": ["Go to the Google Ads API Center and create a developer token", "Find your <strong>Customer ID</strong> in the Google Ads dashboard URL", "Paste both below and click Connect"],
  "meta-ads": ["Create a Meta system user in Business Manager with Ads Manager access", "Generate a long-lived access token for that system user", "Find your <strong>Ad Account ID</strong> in Meta Ads Manager and paste both below"],
  callrail: ["Go to your CallRail dashboard: <strong>Settings &rarr; API &rarr; API Tokens</strong>", "Create a token and note your <strong>Account ID</strong> from the URL", "Paste both below and click Connect"],
  hubspot: ["In HubSpot, go to <strong>Settings &rarr; Integrations &rarr; Private Apps</strong>", "Create a private app with CRM scopes and copy its token", "Paste the token below and click Connect"],
  zoom: ["In Zoom Marketplace create a Server-to-Server OAuth app", "Grant meeting/webinar read scopes and copy the account-level token", "Paste the token below and click Connect"],
  docusign: ["In DocuSign eSignature admin, create an integration key and obtain an access token (JWT grant)", "Note your DocuSign account id", "Paste both below and click Connect"],
  bigquery: ["Create a GCP service account with BigQuery data viewer + job user roles", "Download the service-account JSON key", "Paste the project id and JSON key below and click Connect"],
};

async function loadRegistry(): Promise<CatalogItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/integrations/catalog`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data as CatalogItem[];
    }
  } catch {
    // fall through to local mirror
  }
  return LOCAL_REGISTRY;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const companyId = request.nextUrl.searchParams.get("companyId") || "companyA";

  // ── OAuth providers: redirect to the backend consent flow ──────────
  const OAUTH_BACKEND: Record<string, string> = {
    servicetitan: "servicetitan",
    quickbooks: "quickbooks",
    gusto: "gusto",
  };
  const oauthProvider = OAUTH_BACKEND[provider];
  if (oauthProvider) {
    return NextResponse.redirect(`${BACKEND_URL}/oauth/${oauthProvider}/connect/${companyId}`);
  }

  const catalog = await loadRegistry();
  const item = catalog.find((p) => p.provider === provider);

  if (!item) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a0a0f;color:#e4e4e7;padding:40px"><h1>Unknown provider</h1><p>The integration "${provider}" is not supported.</p><a href="${APP_URL}/integrations" style="color:#818cf8">Back to integrations</a></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // ── Webhook providers: setup instructions + record button ──────────
  if (item.authType === "webhook") {
    return renderWebhookSetupPage(item, companyId);
  }

  // ── api-token providers: dynamic form from registry fields ─────────
  if (item.authType === "api-token" && item.fields?.length) {
    return renderTokenFormPage(item, companyId);
  }

  return new NextResponse(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a0a0f;color:#e4e4e7;padding:40px"><h1>Not yet available</h1><p>${item.label} does not expose a self-serve connection method at this time.</p><a href="${APP_URL}/integrations" style="color:#818cf8">Back to integrations</a></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/**
 * Webhook providers (Stripe / Twilio / Calendly): no credential is collected.
 * The page shows the webhook endpoint to configure on the provider side and
 * a button that records the connection through the unified token-connect
 * endpoint (which handles webhook providers as record-only).
 */
function renderWebhookSetupPage(item: CatalogItem, companyId: string): NextResponse {
  const webhookEndpoints: Record<string, string> = {
    stripe: "https://ledgera-backend-production.up.railway.app/webhooks/stripe",
    twilio: "https://ledgera-backend-production.up.railway.app/webhooks/twilio/" + companyId,
    calendly: "https://ledgera-backend-production.up.railway.app/webhooks/calendly",
  };
  const steps: Record<string, string[]> = {
    stripe: [
      "In Stripe Dashboard &rarr; Developers &rarr; Webhooks, click <strong>Add endpoint</strong>",
      `Set the endpoint URL to <code>${webhookEndpoints.stripe}</code>`,
      "Subscribe to events: <code>invoice.paid</code>, <code>invoice.payment_failed</code>, <code>customer.subscription.updated</code>",
      "Click <strong>Record connection</strong> below once saved",
    ],
    twilio: [
      "In Twilio Console &rarr; Phone Numbers, open your number's Messaging/Voice configuration",
      `Set the inbound webhook URL to <code>${webhookEndpoints.twilio}</code> (Twilio signs requests automatically)`,
      "Click <strong>Record connection</strong> below once configured",
    ],
    calendly: [
      "In Calendly Admin &rarr; Webhooks, register a subscription for your organization",
      `Set the callback URL to <code>${webhookEndpoints.calendly}</code>`,
      "Subscribe to <code>invitee.created</code> and <code>invitee.canceled</code>",
      "Click <strong>Record connection</strong> below once saved",
    ],
  };
  const stepList = (steps[item.provider] ?? ["Follow the provider's webhook documentation"]).map((s) => `<li>${s}</li>`).join("\n      ");
  const endpoint = webhookEndpoints[item.provider] ?? "";

  return new NextResponse(`<!DOCTYPE html>
<html>
<head>
  <title>Connect ${item.label} - Ledgera</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0f; color: #e4e4e7; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; max-width: 560px; width: 100%; margin: 20px; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; color: white; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
    ol { list-style: decimal; padding-left: 20px; font-size: 13px; line-height: 1.9; color: #a1a1aa; margin-bottom: 24px; }
    code { background: #1a1a24; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #c7d2fe; word-break: break-all; }
    button { width: 100%; padding: 12px; border-radius: 12px; border: none; background: #818cf8; color: #0a0a0f; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #f87171; font-size: 13px; margin-top: 12px; display: none; }
    .success { color: #34d399; font-size: 13px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connect ${item.label}</h1>
    <p>${item.label} connects by configuring a provider-side webhook. No secrets are shared with Ledgera.</p>
    <ol>
      ${stepList}
    </ol>
    ${endpoint ? `<p>Endpoint URL:<br><code>${endpoint}</code></p>` : ""}
    <button id="recordBtn" onclick="recordConnection()">Record connection &rarr;</button>
    <div id="error" class="error"></div>
    <div id="success" class="success"></div>
  </div>
  <script>
    async function recordConnection() {
      const btn = document.getElementById("recordBtn");
      const errorEl = document.getElementById("error");
      const successEl = document.getElementById("success");
      errorEl.style.display = "none";
      successEl.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Recording...";
      try {
        const res = await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider: "${item.provider}", companyId: "${companyId}", credentials: {} }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed (" + res.status + ")");
        }
        successEl.textContent = "Connection recorded! Redirecting...";
        successEl.style.display = "block";
        setTimeout(() => { window.location.href = "${APP_URL}/integrations?connected=${item.provider}"; }, 1500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Record connection \\u2192";
      }
    }
  </script>
</body>
</html>`, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/**
 * api-token providers: one generic form generator driven entirely by the
 * registry field definitions. Works for every current and future provider.
 */
function renderTokenFormPage(item: CatalogItem, companyId: string): NextResponse {
  const fields = item.fields ?? [];
  const steps = SETUP_STEPS[item.provider] ?? [
    "Generate an API credential in your " + item.label + " account settings",
    "Paste the required values below and click Connect",
  ];
  const docsLink = item.docsUrl
    ? `<p style="margin-top:-16px;margin-bottom:24px;font-size:12px"><a href="${item.docsUrl}" target="_blank" rel="noopener" style="color:#818cf8">${item.label} developer documentation &nearr;</a></p>`
    : "";

  const fieldsHtml = fields
    .map(
      (f) => `<div class="field">
      <label>${f.label}</label>
      <input type="${f.secret ? "password" : "text"}" id="field-${f.key}" placeholder="${f.placeholder}" autocomplete="off" />
    </div>`
    )
    .join("\n    ");

  const stepsHtml = steps.map((s) => `<li>${s}</li>`).join("\n      ");
  const collectJs = fields
    .map((f) => `credentials[${JSON.stringify(f.key)}] = document.getElementById(${JSON.stringify("field-" + f.key)}).value.trim();`)
    .join("\n        ");
  const validateJs = fields
    .map((f) => `if (!credentials[${JSON.stringify(f.key)}]) { errorEl.textContent = "Please enter your ${JSON.stringify(f.label).slice(1, -1).toLowerCase()}"; errorEl.style.display = "block"; return; }`)
    .join("\n      ");

  return new NextResponse(`<!DOCTYPE html>
<html>
<head>
  <title>Connect ${item.label} - Ledgera</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0f; color: #e4e4e7; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px; max-width: 520px; width: 100%; margin: 20px; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; color: white; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
    ol { list-style: decimal; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #a1a1aa; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; color: #a1a1aa; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: #1a1a24; color: white; font-size: 14px; font-family: monospace; outline: none; }
    input:focus { border-color: #818cf8; }
    button { width: 100%; padding: 12px; border-radius: 12px; border: none; background: #818cf8; color: #0a0a0f; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #f87171; font-size: 13px; margin-top: 12px; display: none; }
    .success { color: #34d399; font-size: 13px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connect ${item.label}</h1>
    <p>${item.description || item.label + " connects securely with your own API credentials."}</p>
    <ol>
      ${stepsHtml}
    </ol>
    ${docsLink}
    ${fieldsHtml}
    <button id="connectBtn" onclick="connect()">Connect &rarr;</button>
    <div id="error" class="error"></div>
    <div id="success" class="success"></div>
  </div>
  <script>
    async function connect() {
      const credentials = {};
      const btn = document.getElementById("connectBtn");
      const errorEl = document.getElementById("error");
      const successEl = document.getElementById("success");
      errorEl.style.display = "none";
      successEl.style.display = "none";

      ${collectJs}
      ${validateJs}

      btn.disabled = true;
      btn.textContent = "Connecting...";

      try {
        const res = await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "${item.provider}",
            companyId: "${companyId}",
            credentials: credentials,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Connection failed (" + res.status + ")");
        }

        successEl.textContent = "Connected successfully! Redirecting...";
        successEl.style.display = "block";
        setTimeout(() => { window.location.href = "${APP_URL}/integrations?connected=${item.provider}"; }, 1500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Connect \\u2192";
      }
    }
  </script>
</body>
</html>`, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
