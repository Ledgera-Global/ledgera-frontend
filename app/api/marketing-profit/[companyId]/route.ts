import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { MarketingProfitReport } from "@/lib/types/acquisition";

const demoMarketingProfit: MarketingProfitReport = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  periodLabel: "Last 90 days",
  totalSpend: 100000,
  totalRevenue: 1580000,
  totalGrossProfit: 616200,
  profitAfterMarketing: 516200,
  marketingROAS: 15.8,
  marketingProfitRatio: 6.16,
  totalProfitLeaking: 11600,
  campaigns: [
    {
      id: "camp-google-hvac",
      name: "Google Ads - HVAC Repair",
      channel: "google",
      spend: 42000,
      leads: 640,
      bookedJobs: 212,
      revenue: 764000,
      materialCost: 229200,
      laborCost: 236840,
      grossProfit: 297960,
      grossMarginPct: 39,
      costPerLead: 66,
      costPerBookedJob: 198,
      closeRatePct: 33,
      paybackMonths: 4.2,
      status: "scaling",
      profitAfterMarketing: 255960,
    },
    {
      id: "camp-meta-maintenance",
      name: "Meta - Maintenance Plans",
      channel: "meta",
      spend: 18000,
      leads: 380,
      bookedJobs: 96,
      revenue: 288000,
      materialCost: 86400,
      laborCost: 89280,
      grossProfit: 112320,
      grossMarginPct: 39,
      costPerLead: 47,
      costPerBookedJob: 188,
      closeRatePct: 25,
      paybackMonths: 3.1,
      status: "holding",
      profitAfterMarketing: 94320,
    },
    {
      id: "camp-other-direct",
      name: "Direct Mail - Commercial",
      channel: "other",
      spend: 24000,
      leads: 120,
      bookedJobs: 38,
      revenue: 342000,
      materialCost: 102600,
      laborCost: 106020,
      grossProfit: 133380,
      grossMarginPct: 39,
      costPerLead: 200,
      costPerBookedJob: 632,
      closeRatePct: 32,
      paybackMonths: 8.9,
      status: "trimming",
      profitAfterMarketing: 109380,
    },
    {
      id: "camp-google-generic",
      name: "Google Ads - Generic Keywords",
      channel: "google",
      spend: 16000,
      leads: 290,
      bookedJobs: 62,
      revenue: 186000,
      materialCost: 55800,
      laborCost: 57660,
      grossProfit: 72540,
      grossMarginPct: 39,
      costPerLead: 55,
      costPerBookedJob: 258,
      closeRatePct: 21,
      paybackMonths: 6.9,
      status: "candidate_off",
      profitAfterMarketing: 56540,
    },
  ],
  diagnostics: [
    {
      campaignId: "camp-google-generic",
      campaignName: "Google Ads - Generic Keywords",
      severity: "high",
      finding: "Falling conversion and rising acquisition cost",
      evidence:
        "Google Ads - Generic Keywords closes 21% at $258 per booked job.",
      recommendedAction:
        "Shift budget toward higher converting campaigns or fix the landing page before scaling further.",
      profitImpactEstimate: 4000,
    },
    {
      campaignId: "camp-other-direct",
      campaignName: "Direct Mail - Commercial",
      severity: "medium",
      finding: "Capital recovery period is too long",
      evidence:
        "Direct Mail - Commercial takes 8.9 months to recover spend, above the 6-month institutional threshold.",
      recommendedAction:
        "Tighten targeting to reduce cost per booked job, or reduce allocation until payback improves.",
      profitImpactEstimate: 3600,
    },
    {
      campaignId: "camp-google-generic",
      campaignName: "Google Ads - Generic Keywords",
      severity: "medium",
      finding: "Capital recovery period is too long",
      evidence:
        "Google Ads - Generic Keywords takes 6.9 months to recover spend, above the 6-month institutional threshold.",
      recommendedAction:
        "Tighten targeting to reduce cost per booked job, or reduce allocation until payback improves.",
      profitImpactEstimate: 2400,
    },
    {
      campaignId: "camp-google-generic",
      campaignName: "Google Ads - Generic Keywords",
      severity: "medium",
      finding: "Candidate for deactivation",
      evidence:
        "Google Ads - Generic Keywords is flagged with a 6.9 month payback and 21% close rate.",
      recommendedAction: "Reallocate this budget to the best performing channel.",
      profitImpactEstimate: 1600,
    },
  ],
  enterpriseValueImpact: 329308,
  appliedMultiple: 7,
  narrative:
    "Marketing returned $616K of gross profit on $100K of spend (15.8x ROAS, 6.2x profit ratio). Google Ads - HVAC Repair is your most profitable source at $256K net. Google Ads - Generic Keywords returned $57K net and is dragging overall efficiency. Executing the 4 recommended actions could recover approximately $12K per period and $329K of enterprise value at 7x EBITDA.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/marketing-profit/${p.companyId}`, demoMarketingProfit);
}
