import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoAnomalies = {
  companyId: "",
  generatedAt: new Date().toISOString(),
  periodLabel: "Last 30 days vs 6-period baseline",
  daysAnalyzed: 30,
  anomalies: [],
  summary: {
    anomaliesDetected: 0,
    highSeverity: 0,
    totalExcessSpend: 0,
    annualizedExcessSpend: 0,
    categoriesMonitored: 0,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(
    req,
    p,
    `/intelligence/${p.companyId}/expense-anomalies`,
    demoAnomalies
  );
}
