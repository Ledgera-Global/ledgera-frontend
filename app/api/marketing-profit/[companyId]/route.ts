import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

// Demo fallback matching the EngineReport shape the marketing-profit page
// renders (dataSource, hasAttribution, campaigns[].campaignId, diagnostics as
// strings). Must stay in sync with the backend marketingProfitEngine so the
// page never crashes on an object-as-React-child when the backend is down.
const demoMarketingProfit = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  dataSource: "demo" as const,
  demoNotice: "Illustrative sample data. Numbers below are NOT your company's performance.",
  totalSpend: 100000,
  totalAttributedGrossProfit: 616200,
  profitAfterMarketing: 516200,
  roas: 6.16,
  profitRatio: 5.16,
  profitLeaking: false,
  hasAttribution: true,
  diagnostics: [
    "Sample data shown — connect bank/card/accounting plus Google Ads, Meta Ads, or CallRail to replace this with your real spend and returns.",
  ],
  campaigns: [
    { campaignId: "camp-google-hvac", channel: "google", name: "Google Ads - HVAC Repair", spend: 42000, attributedGrossProfit: 297960 },
    { campaignId: "camp-meta-maintenance", channel: "meta", name: "Meta - Maintenance Plans", spend: 18000, attributedGrossProfit: 112320 },
    { campaignId: "camp-other-direct", channel: "other", name: "Direct Mail - Commercial", spend: 24000, attributedGrossProfit: 133380 },
    { campaignId: "camp-google-generic", channel: "google", name: "Google Ads - Generic Keywords", spend: 16000, attributedGrossProfit: 72540 },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/marketing-profit/${p.companyId}`, demoMarketingProfit);
}
