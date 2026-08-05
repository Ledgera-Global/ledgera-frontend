import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  branches: [
    { name: "Charlotte", revenue: 420000, profit: 84000, marginPct: 20.0, techCount: 8, jobsCount: 145, efficiencyScore: 78, trend: "up" },
    { name: "Greenville", revenue: 380000, profit: 95000, marginPct: 25.0, techCount: 6, jobsCount: 120, efficiencyScore: 85, trend: "up" },
    { name: "Raleigh", revenue: 310000, profit: 46500, marginPct: 15.0, techCount: 5, jobsCount: 98, efficiencyScore: 62, trend: "down" },
  ],
  summary: { topBranch: "Greenville", bottomBranch: "Raleigh", averageMargin: 20.0 },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/branch-rankings/${p.companyId}`, demoData);
}
