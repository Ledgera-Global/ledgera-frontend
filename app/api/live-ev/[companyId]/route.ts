import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { DEFAULT_LIVE_EV } from "@/lib/data/defaults";
import type { LiveEvData } from "@/lib/types/acquisition";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  // Simulate fresh timestamps
  const fresh = {
    ...DEFAULT_LIVE_EV,
    lastUpdated: new Date().toISOString(),
    secondsSinceUpdate: Math.floor(Math.random() * 30) + 5,
    activity: DEFAULT_LIVE_EV.activity.map((a) => ({
      ...a,
      time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    })),
  };
  return handleApiGet(req, p, `/live-ev/${p.companyId}`, fresh);
}
