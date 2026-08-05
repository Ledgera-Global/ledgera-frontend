import { NextRequest, NextResponse } from "next/server";
import { logWebhookSignatureFailure } from "@/lib/audit";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Proxies Stripe webhooks to the Express backend with signature verification.
 *
 * Staging/test mode: If STRIPE_WEBHOOK_SECRET is unset, webhooks are still
 * forwarded but a warning is logged. Production deployments MUST set this.
 */
export async function POST(req: NextRequest) {
  // ── 1. Read raw body for signature verification ─────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  // ── 2. Verify Stripe signature (production) ────────────────────────
  if (STRIPE_WEBHOOK_SECRET && !signature) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    logWebhookSignatureFailure("stripe", ip, "missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // ── 3. Forward to Express backend ──────────────────────────────────
  const backendUrl =
    process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

  try {
    const backendRes = await fetch(`${backendUrl}/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature ? { "stripe-signature": signature } : {}),
      },
      body: rawBody,
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => "Unknown error");
      console.error(
        `[stripe-webhook] Backend returned ${backendRes.status}: ${errorText}`
      );
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[stripe-webhook] Backend unreachable:", err);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 502 }
    );
  }
}

/**
 * Reject non-POST requests to this endpoint.
 */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
