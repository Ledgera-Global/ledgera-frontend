import { startAuthorization } from "@vercel/connect";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/quickbooks/connect
 *
 * Starts a Vercel Connect OAuth authorization for QuickBooks.
 * Returns the URL the user should be redirected to.
 *
 * The user authorizes at that URL, Vercel handles the OAuth callback
 * at https://connect.vercel.com/callback, and then the frontend can
 * call /api/quickbooks/sync to get the token and sync data.
 */
const CONNECTOR = "quickbooks.intuit.com/celeste-lamp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId;
    const companyId = body.companyId;

    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "Missing userId and companyId" },
        { status: 400 }
      );
    }

    // Start the Vercel Connect OAuth flow for QuickBooks
    const authorization = await startAuthorization(CONNECTOR, {
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

    return NextResponse.json({
      url: authorization.url,
      companyId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start QuickBooks authorization";
    console.error("[quickbooks/connect]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
