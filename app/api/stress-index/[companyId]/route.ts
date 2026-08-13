import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  score: 42,
  level: "MODERATE",
  headline:
    "Moderate pressure. A few operational areas deserve attention this week.",
  signals: [
    { key: "cashRunway", label: "Cash Runway", score: 75, weight: 0.28, detail: "3.2 months of cash runway" },
    { key: "payrollCoverage", label: "Payroll Coverage", score: 45, weight: 0.28, detail: "Cash covers payroll 1.9x" },
    { key: "arPressure", label: "Receivables Pressure", score: 70, weight: 0.16, detail: "26% of receivables at risk" },
    { key: "techEfficiency", label: "Team Efficiency", score: 25, weight: 0.12, detail: "Average tech efficiency 78/100" },
    { key: "profitVariability", label: "Profit Variability", score: 15, weight: 0.1, detail: "11% of recent jobs below 25% margin" },
    { key: "marginPressure", label: "Margin Pressure", score: 30, weight: 0.06, detail: "EBITDA margin 16.4%" },
  ],
  drivers: [
    { key: "cashRunway", label: "Cash Runway", score: 75, weight: 0.28, detail: "3.2 months of cash runway" },
    { key: "arPressure", label: "Receivables Pressure", score: 70, weight: 0.16, detail: "26% of receivables at risk" },
    { key: "payrollCoverage", label: "Payroll Coverage", score: 45, weight: 0.28, detail: "Cash covers payroll 1.9x" },
  ],
  inputs: {
    monthsOfRunway: 3.2,
    payrollCoverage: 1.9,
    arAtRiskRatio: 0.26,
    avgTechEfficiency: 78,
    lowMarginJobRatio: 0.11,
    margin: 0.164,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/stress-index/${p.companyId}`, demoData);
}
