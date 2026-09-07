import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoPortfolio = {
  generatedAt: new Date().toISOString(),
  companies: [],
  capital: {
    identifiedCostOptimization: 0,
    potentialEbitdaImprovement: 0,
    potentialEvCreationLow: 0,
    potentialEvCreationMid: 0,
    potentialEvCreationHigh: 0,
    findingsRequiringReview: 0,
  },
  summary: {
    totalCompanies: 0,
    withData: 0,
    strong: 0,
    watch: 0,
    underperforming: 0,
    noData: 0,
    portfolioRevenue: 0,
    portfolioEbitda: 0,
    blendedMarginPct: 0,
    valueCreationGap: 0,
  },
  priorities: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/intelligence/${p.companyId}/portfolio`, demoPortfolio);
}
