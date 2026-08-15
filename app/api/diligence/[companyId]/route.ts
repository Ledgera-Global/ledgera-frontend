import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  summary: "Operational due diligence indicates moderate risk concentration in labor efficiency and AR aging.",
  sections: [
    {
      title: "Financial Health",
      findings: [
        "Revenue trending up 18% YoY",
        "Net margin at 22%, above industry benchmark of 15%",
        "EBITDA margin stable at 16%",
      ],
      riskLevel: "LOW" as const,
    },
    {
      title: "Operations",
      findings: [
        "Technician utilization at 74% - below 85% target",
        "Average job duration 3.2 hours vs 2.8 benchmark",
        "Dispatch inefficiency detected in 12% of jobs",
      ],
      riskLevel: "MODERATE" as const,
    },
    {
      title: "Accounts Receivable",
      findings: [
        "22% of AR is beyond 60 days",
        "No automated collection process",
        "Concentration risk: top 3 customers = 45% of outstanding",
      ],
      riskLevel: "HIGH" as const,
    },
    {
      title: "Compliance & Contracts",
      findings: [
        "All vendor agreements current",
        "Worker classification reviewed - no red flags",
        "Insurance coverage adequate for operational scale",
      ],
      riskLevel: "LOW" as const,
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/diligence/${p.companyId}`, demoData);
}
