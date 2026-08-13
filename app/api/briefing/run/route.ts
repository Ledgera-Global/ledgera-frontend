import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/backendProxy";

// ─── Weekly CEO Briefing — delivery endpoint ───────────────────────────
// Cron-invocable (Bearer CRON_SECRET), like the existing /api/cron route.
// Composes a Monday-morning briefing from live company data and POSTs it to
// a Slack-style webhook (BRIEFING_WEBHOOK_URL) when configured. Returns the
// structured briefing so a scheduler can also call it and store/email it.

type DailyBrief = {
  date: string;
  financial: {
    grossMarginToday: number;
    ebitdaToday: number;
    revenuePace: number | string;
    cashRunway: number;
    payrollRisk: string;
  };
  operational: {
    technicianProfitability: string;
    branchRankings: string;
    callbackCost: string;
    membershipHealth: number | string;
    truckUtilization: number | string;
  };
  alerts: string[];
  generatedAt: string;
};

function fmtCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

function buildBriefingText(companyId: string, brief: DailyBrief): string {
  const lines = [
    `📊 *Weekly CEO Briefing — ${new Date(brief.generatedAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}*`,
    ``,
    `*Financial*`,
    `• Gross margin: ${brief.financial.grossMarginToday}%`,
    `• EBITDA: ${fmtCurrency(brief.financial.ebitdaToday)}`,
    `• Runway: ${brief.financial.cashRunway} months`,
    `• Payroll risk: ${brief.financial.payrollRisk}`,
    ``,
    `*Operational*`,
    `• ${brief.operational.technicianProfitability}`,
    `• ${brief.operational.callbackCost}`,
    `• ${brief.operational.truckUtilization}`,
    ``,
    `*This week's watch list*`,
    ...(brief.alerts.length > 0
      ? brief.alerts.map((a) => `• ${a}`)
      : ["• No alerts — steady week."]),
    ``,
    `— Ledgera Command Center`,
  ];
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { companyId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }

  const companyId = body.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  const backendUrl = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "JWT_SECRET not configured; cannot reach backend" },
      { status: 503 }
    );
  }

  try {
    const brief = await fetchFromBackend<DailyBrief>(
      `/daily-brief/${companyId}`,
      companyId
    );

    const text = buildBriefingText(companyId, brief);

    // Delivery: Slack-style webhook if configured (email delivery can be added
    // by pointing an email provider at the same endpoint).
    let delivered: { channel: string; ok: boolean; status?: number } | null = null;
    const webhookUrl = process.env.BRIEFING_WEBHOOK_URL;
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      delivered = { channel: "webhook", ok: res.ok, status: res.status };
    }

    return NextResponse.json({
      ok: true,
      companyId,
      generatedAt: new Date().toISOString(),
      delivered,
      briefing: text,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Briefing failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
