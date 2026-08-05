import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Read companyId from query param (set by the client-side button handler)
  const companyId = request.nextUrl.searchParams.get("companyId") || "companyA";
  const appUrl = process.env.APP_URL || "https://ledgerahq.com";

  // ── Samsara: API token auth, not OAuth ──────────────────────────────
  // Samsara uses long-lived API tokens generated from their dashboard.
  // Instead of an OAuth redirect, return a page prompting for the token.
  if (provider === "samsara") {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Connect Samsara – Ledgera</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0a0f;
      color: #e4e4e7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #12121a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 40px;
      max-width: 520px;
      width: 100%;
      margin: 20px;
    }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; color: white; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px; }
    ol {
      list-style: decimal;
      padding-left: 20px;
      font-size: 13px;
      line-height: 1.8;
      color: #a1a1aa;
      margin-bottom: 24px;
    }
    ol a { color: #818cf8; }
    input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: #1a1a24;
      color: white;
      font-size: 14px;
      font-family: monospace;
      margin-bottom: 16px;
      outline: none;
    }
    input:focus { border-color: #818cf8; }
    button {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: #818cf8;
      color: #0a0a0f;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #f87171; font-size: 13px; margin-top: 12px; display: none; }
    .success { color: #34d399; font-size: 13px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Connect Samsara</h1>
    <p>Samsara uses API token authentication. Create a token in your Samsara dashboard and paste it below.</p>
    <ol>
      <li>Go to Samsara Dashboard: <strong>Settings → API → API Tokens</strong></li>
      <li>Click <strong>Create API Token</strong> and copy the token value</li>
      <li>Paste it below and click Connect</li>
    </ol>
    <input type="password" id="apiToken" placeholder="Paste your Samsara API token..." autocomplete="off" />
    <button id="connectBtn" onclick="connect()">Connect &rarr;</button>
    <div id="error" class="error"></div>
    <div id="success" class="success"></div>
  </div>
  <script>
    async function connect() {
      const token = document.getElementById("apiToken").value.trim();
      const btn = document.getElementById("connectBtn");
      const errorEl = document.getElementById("error");
      const successEl = document.getElementById("success");
      errorEl.style.display = "none";
      successEl.style.display = "none";

      if (!token) {
        errorEl.textContent = "Please enter your Samsara API token";
        errorEl.style.display = "block";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Connecting...";

      try {
        const res = await fetch("/api/integrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "samsara",
            companyId: "${companyId}",
            apiToken: token,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Connection failed (" + res.status + ")");
        }

        successEl.textContent = "Connected successfully! Redirecting...";
        successEl.style.display = "block";
        setTimeout(() => { window.location.href = "${appUrl}/integrations?connected=samsara"; }, 1500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Connect \\u2192";
      }
    }
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // ── OAuth providers ─────────────────────────────────────────────────
  const providerMap: Record<string, string> = {
    servicetitan: "servicetitan",
    quickbooks: "quickbooks",
    gusto: "gusto",
  };

  const backendProvider = providerMap[provider];
  if (!backendProvider) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a0a0f;color:#e4e4e7;padding:40px"><h1>Unknown provider</h1><p>The integration "${provider}" is not supported yet.</p><a href="${appUrl}/integrations" style="color:#818cf8">Back to integrations</a></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const backendUrl = `${BACKEND_URL}/oauth/${backendProvider}/connect/${companyId}`;
  return NextResponse.redirect(backendUrl);
}
