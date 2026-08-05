import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = { windowDays: 30, totalRevenue: 125000, totalProfit: 31250, avgMarginPct: 25.0, moneyLeakedThisWeek: 12000 };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/dashboard-metrics?windowDays=30`, demoData);
}
