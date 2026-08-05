import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoRecommendation = {
  eligible: true,
  eligibilityReason: "Acquisition-ready with Mid-Market profile. A tuck-in strategy can accelerate to Large tier.",
  clientTier: "mid",
  clientRevenue: 420000,
  clientEbitda: 185000,
  targetTier: "large",
  recommendedTargetRevenue: { min: 84000, max: 168000 },
  recommendedTargetEbitda: { min: 8400, max: 42000 },
  targetCount: 5,
  proFormaRevenue: 1050000,
  proFormaEbitda: 432500,
  proFormaEbitdaMarginPct: 41.2,
  synergySavingsPct: 15,
  combinedEnterpriseValue: 4973750,
  combinedMultiple: 11.5,
  currentMultiple: 5.0,
  multipleAfterFirstDeal: 7.5,
  multipleAfterRollup: 11.5,
  ceilingAfterRollup: 15,
  multipleTrajectory: [
    { label: "Current Standalone", multiple: 5.0, enterpriseValue: 925000, ebitda: 185000 },
    { label: "After 1 acquisition", multiple: 7.5, enterpriseValue: 2148750, ebitda: 286500 },
    { label: "After 2 acquisitions", multiple: 9.0, enterpriseValue: 3195000, ebitda: 355000 },
    { label: "After 3 acquisitions", multiple: 10.2, enterpriseValue: 4131000, ebitda: 405000 },
    { label: "After 4 acquisitions", multiple: 11.0, enterpriseValue: 4785000, ebitda: 435000 },
    { label: "After 5 acquisitions", multiple: 11.5, enterpriseValue: 4973750, ebitda: 432500 },
  ],
  description: "As a Mid-Market company with $420k revenue and $185k EBITDA, you are well-positioned to execute a tuck-in acquisition strategy. By acquiring 5 target(s) in the $84k-$168k revenue range, you can scale to Large tier and expand your valuation multiple from 5.0x to 15x — unlocking significant enterprise value growth.",
  risks: [
    "Integration risk — combining operations, systems, and cultures requires dedicated leadership.",
    "Customer retention risk — acquired customers may churn during transition.",
    "Financing risk — acquisitions require capital; structure debt carefully.",
    "Talent retention — key employees at the target may leave post-acquisition.",
    "Multiple simultaneous integrations increase execution complexity.",
  ],
  generatedAt: new Date().toISOString(),
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/rollup-advisor/${p.companyId}`, demoRecommendation);
}
