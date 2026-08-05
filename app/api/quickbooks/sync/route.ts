import { getToken } from "@vercel/connect";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";
const CONNECTOR = "quickbooks.intuit.com/celeste-lamp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;
    const companyId = body.companyId;

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "Missing userId and companyId in request body" },
        { status: 400 }
      );
    }

    // Get a Vercel Connect-managed QuickBooks access token
    const accessToken = await getToken(CONNECTOR, {
      subject: {
        type: "user",
        id: userId,
      },
      scopes: [
        "com.intuit.quickbooks.accounting",
        "com.intuit.quickbooks.payment",
        "openid",
        "profile",
        "email",
        "phone",
        "address",
      ],
    });

    // Forward the token to the Express backend for QuickBooks data sync
    const backendUrl = `${BACKEND_URL}/integrations/quickbooks/sync`;
    const syncResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        accessToken,
      }),
    });

    if (!syncResponse.ok) {
      const text = await syncResponse.text().catch(() => "");
      throw new Error(`Backend sync failed (${syncResponse.status}): ${text}`);
    }

    const result = await syncResponse.json();
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "QuickBooks sync failed";
    console.error("[quickbooks/sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
