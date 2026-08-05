import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { logWebhookSignatureFailure } from "@/lib/audit";

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";

/**
 * Validates a Twilio webhook request using Twilio's signature validation.
 *
 * Twilio sends a `X-Twilio-Signature` header which is an HMAC-SHA1 hash
 * of the full URL + POST body, signed with the Twilio Auth Token.
 *
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
function isValidTwilioRequest(
  url: string,
  params: URLSearchParams,
  signature: string
): boolean {
  if (!TWILIO_AUTH_TOKEN) {
    // Dev mode without configured token — warn but allow
    console.warn(
      "[twilio-webhook] TWILIO_AUTH_TOKEN not set, skipping signature validation"
    );
    return true;
  }

  // Twilio validation: sort params alphabetically, concatenate as key-value pairs
  const sortedKeys = Array.from(params.keys()).sort();
  let validationString = url;
  for (const key of sortedKeys) {
    validationString += key + params.get(key);
  }

  const expectedSignature = crypto
    .createHmac("sha1", TWILIO_AUTH_TOKEN)
    .update(validationString)
    .digest("base64");

  // Use timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Proxies Twilio webhooks to the Express backend with signature validation.
 */
export async function POST(req: NextRequest) {
  // ── 1. Read raw body for signature verification ─────────────────────
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  const twilioSignature = req.headers.get("x-twilio-signature") || "";

  // ── 2. Verify Twilio signature ──────────────────────────────────────
  const fullUrl = req.url;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!isValidTwilioRequest(fullUrl, params, twilioSignature)) {
    logWebhookSignatureFailure("twilio", ip, "signature mismatch");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 }
    );
  }

  // ── 3. Forward to Express backend ──────────────────────────────────
  const backendUrl =
    process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

  try {
    const backendRes = await fetch(`${backendUrl}/twilio/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: rawBody,
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => "Unknown error");
      console.error(
        `[twilio-webhook] Backend returned ${backendRes.status}: ${errorText}`
      );
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: backendRes.status }
      );
    }

    // Twilio expects a TwiML response (or empty 200 for confirmation)
    const text = await backendRes.text();
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("[twilio-webhook] Backend unreachable:", err);
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
