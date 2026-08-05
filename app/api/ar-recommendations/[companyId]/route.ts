import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  totalOutstanding: 86000,
  atRiskAmount: 19000,
  generatedAt: new Date().toISOString(),
  recommendations: [
    {
      invoiceId: "#1831",
      customer: "Greenway Properties",
      amount: 12400,
      daysOverdue: 67,
      bucket: "61-90 days",
      priority: "HIGH",
      estimatedRecovery: 9920,
      recoveryProbabilityPct: 80,
      recommendation: "Send certified final notice and place on credit hold. Client has paid 4 of last 5 invoices on time.",
      ebitdaImpact: 620,
    },
    {
      invoiceId: "#1842",
      customer: "Riverside Commercial HVAC",
      amount: 5800,
      daysOverdue: 45,
      bucket: "31-60 days",
      priority: "MEDIUM",
      estimatedRecovery: 5220,
      recoveryProbabilityPct: 90,
      recommendation: "Call customer directly. This is a recurring monthly service client — a reminder usually resolves within 7 days.",
      ebitdaImpact: 290,
    },
    {
      invoiceId: "#1850",
      customer: "Oakwood Estates",
      amount: 3800,
      daysOverdue: 82,
      bucket: "61-90 days",
      priority: "HIGH",
      estimatedRecovery: 2280,
      recoveryProbabilityPct: 60,
      recommendation: "Engage collections agency. Two previous reminders went unanswered. Customer is responsive only to third-party contact.",
      ebitdaImpact: 190,
    },
  ],
  totalEstimatedRecovery: 17420,
  totalEbitdaImpact: 1100,
  projectedMarginImpactPct: 1.2,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/ar-recommendations/${p.companyId}`, demoData);
}
