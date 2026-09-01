import { NextResponse } from "next/server";

// Demo fallback for the Ledgera Operating Console. Mirrors the live shape the
// backend engine (LedgeraConsoleEngine) returns so the internal page renders
// the full institutional surface even before the backend proxy is wired.
const demoData = {
  generatedAt: new Date().toISOString(),
  riskRegister: [
    { id: "risk-1", title: "Major cloud outage", category: "Operational", impact: "High", likelihood: "Low", owner: "CTO", status: "Mitigation in place", reviewDate: "2026-08-15" },
    { id: "risk-2", title: "Data breach (client financial data)", category: "Cybersecurity", impact: "High", likelihood: "Low", owner: "Head of Security", status: "Ongoing monitoring", reviewDate: "2026-08-10" },
    { id: "risk-3", title: "Customer churn spike", category: "Revenue", impact: "High", likelihood: "Medium", owner: "Chief Revenue Officer", status: "Action plan active", reviewDate: "2026-08-01" },
    { id: "risk-4", title: "Regulatory change (data privacy)", category: "Compliance", impact: "Medium", likelihood: "Medium", owner: "General Counsel", status: "Under review", reviewDate: "2026-08-20" },
    { id: "risk-5", title: "AI model drift degrading advice", category: "AI Risk", impact: "Medium", likelihood: "Medium", owner: "CTO / AI Lead", status: "Monitor drift metrics", reviewDate: "2026-08-18" },
    { id: "risk-6", title: "Single integration vendor dependency", category: "Vendor", impact: "Medium", likelihood: "Medium", owner: "CTO", status: "Diversify integrations", reviewDate: "2026-08-22" },
  ],
  riskDashboard: [
    { category: "Cybersecurity", owner: "Head of Security", riskCount: 1, highCount: 1, status: "action", metrics: [{ label: "Risk register entries", value: "1", status: "warn" }] },
    { category: "Operational", owner: "COO / CTO", riskCount: 1, highCount: 1, status: "action", metrics: [{ label: "Risk register entries", value: "1", status: "warn" }] },
    { category: "Financial", owner: "CFO", riskCount: 0, highCount: 0, status: "na", metrics: [{ label: "Accounts receivable aging", value: "$0", status: "ok" }, { label: "Cash runway", value: "$0", status: "na" }, { label: "Fraud signals", value: "0", status: "ok" }] },
    { category: "Legal & Compliance", owner: "General Counsel", riskCount: 1, highCount: 0, status: "monitor", metrics: [{ label: "Risk register entries", value: "1", status: "warn" }] },
    { category: "AI Risk", owner: "CTO / AI Lead", riskCount: 1, highCount: 0, status: "monitor", metrics: [{ label: "Risk register entries", value: "1", status: "warn" }] },
  ],
  productHealth: {
    summary: { outcomeScore: 75.4, adoptionPct: 66.2, churnPct: 5.16, renewalPct: 84.8 },
    areas: [
      { id: "pa-1", area: "Financial Intelligence", adoptionPct: 84, churnPct: 3.2, renewalPct: 91, timeSavedHrs: 41, outcomeScore: 88, trend: "up" },
      { id: "pa-2", area: "Executive Dashboard", adoptionPct: 76, churnPct: 4.1, renewalPct: 89, timeSavedHrs: 28, outcomeScore: 82, trend: "up" },
      { id: "pa-3", area: "AI Copilot", adoptionPct: 61, churnPct: 6.0, renewalPct: 84, timeSavedHrs: 18, outcomeScore: 71, trend: "flat" },
      { id: "pa-4", area: "Integrations", adoptionPct: 72, churnPct: 4.5, renewalPct: 87, timeSavedHrs: 22, outcomeScore: 78, trend: "up" },
      { id: "pa-5", area: "Acquisition Intelligence", adoptionPct: 38, churnPct: 8.0, renewalPct: 73, timeSavedHrs: 12, outcomeScore: 58, trend: "up" },
    ],
  },
  acquisition: {
    pipeline: [
      { stage: "Targets identified", count: 1842 },
      { stage: "Qualified", count: 214 },
      { stage: "Priority", count: 37 },
      { stage: "Management conversations", count: 12 },
      { stage: "Due diligence", count: 4 },
      { stage: "LOIs", count: 2 },
      { stage: "Closed", count: 3 },
    ],
    valueOpportunity: {
      targets: 37,
      aggregateRevenue: 412000000,
      aggregateEbitda: 41300000,
      improvementOpportunity: 12400000,
      evOpportunity: 173000000,
    },
    radar: [
      { tier: "priority", description: "Exceptionally well-scored targets", count: 8, hiddenGems: 2 },
      { tier: "watchlist", description: "Interesting but not ready yet", count: 24, hiddenGems: 1 },
      { tier: "monitor", description: "Potentially interesting, insufficient data", count: 61, hiddenGems: 0 },
      { tier: "avoid", description: "Poor economics / excessive risk / weak fit", count: 17, hiddenGems: 0 },
    ],
    topCandidates: [
      { id: "deal-1", name: "Southeast HVAC Platform — Branch 3", tier: "priority", score: 90, revenue: 18400000, ebitda: 1650000, ebitdaMargin: 9, growthRate: 8, hiddenGem: false },
      { id: "deal-2", name: "Gulf Coast Plumbing Roll-up", tier: "watchlist", score: 78, revenue: 9200000, ebitda: 980000, ebitdaMargin: 10.7, growthRate: 10, hiddenGem: true },
      { id: "deal-3", name: "Midwest Commercial Refrigeration", tier: "monitor", score: 66, revenue: 12400000, ebitda: 1420000, ebitdaMargin: 11.5, growthRate: 12, hiddenGem: false },
    ],
    calibration: [
      { id: "deal-1", targetName: "Southeast HVAC Platform — Branch 3", stage: "Closed", revenue: 18400000, ebitda: 1650000, predictedUplift: 1200000, actualUplift: 900000, accuracy: 75, closedDate: "2026-03-12" },
      { id: "deal-2", targetName: "Gulf Coast Plumbing Roll-up", stage: "Closed", revenue: 9200000, ebitda: 980000, predictedUplift: 620000, actualUplift: 700000, accuracy: 113, closedDate: "2026-01-28" },
      { id: "deal-3", targetName: "Midwest Commercial Refrigeration", stage: "Integrated", revenue: 12400000, ebitda: 1420000, predictedUplift: 880000, actualUplift: 0, accuracy: 0, closedDate: "2026-06-05" },
    ],
    predictionAccuracyPct: 94,
    learnedSignals: [
      "Service-agreement penetration is the strongest predictor of realized EBITDA uplift.",
      "Pricing improvements consistently over-perform vs. labor-efficiency estimates.",
      "Owner-dependent companies with weak financial reporting take 2.3x longer to integrate.",
      "Geographic density (jobs per mile) correlates with faster post-close margin expansion.",
    ],
  },
  impact: {
    customerImpact: 21400000,
    acquisitionImpact: 2300000,
    platformImpact: 23700000,
    methodology: [
      "Customer impact = realized EBITDA lift from implemented agent signals + recovery automation.",
      "Acquisition impact = realized EBITDA uplift from closed Ledgera deals (prediction-vs-actual).",
      "Platform impact = customer impact + acquisition impact. Not a valuation multiple.",
    ],
  },
};

export async function GET() {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(demoData, { headers });
}
