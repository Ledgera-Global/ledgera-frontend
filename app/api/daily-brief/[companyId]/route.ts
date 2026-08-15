import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  date: new Date().toISOString(),
  financial: {
    grossMarginToday: 32.4,
    ebitdaToday: 184000,
    revenuePace: "Above target by 3.2%",
    cashRunway: 3.2,
    payrollRisk: "MEDIUM",
  },
  operational: {
    technicianProfitability: "Tech #4 leads at $2,055 profit/job; Tech #2 lowest at $1,320",
    branchRankings: "Greenville (85) > Charlotte (78) > Raleigh (62)",
    callbackCost: "$12,400 in callback costs this month (+8% vs last month)",
    membershipHealth: "82% renewal rate - 900 agreements at risk next quarter",
    truckUtilization: "72% fleet utilization - 2 trucks underperforming",
  },
  alerts: [
    "Gross margin dropped 3.1% because install labor exceeded estimate on five jobs.",
    "Charlotte branch is projected to miss monthly EBITDA by $42,000.",
    "Accounts receivable over 45 days increased 18%.",
    "You can safely hire two technicians next month based on current booked work.",
    "Raise diagnostic fee by $15 to match market average of $94.",
  ],
  generatedAt: new Date().toISOString(),
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/daily-brief/${p.companyId}`, demoData);
}
