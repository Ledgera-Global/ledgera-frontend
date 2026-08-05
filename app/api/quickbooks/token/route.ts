import { getToken } from "@vercel/connect";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns a Vercel Connect-issued QuickBooks access token for the given user.
 *
 * The frontend calls this endpoint after the user has authorized via
 * Vercel Connect's OAuth flow (which handles the Intuit redirect at
 * https://connect.vercel.com/callback).
 *
 * The returned token is sent to the backend for QuickBooks data sync.
 */
const CONNECTOR = "quickbooks.intuit.com/celeste-lamp";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const token = await getToken(CONNECTOR, {
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

    return NextResponse.json({ accessToken: token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get QuickBooks token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
