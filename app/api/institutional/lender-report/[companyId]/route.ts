import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;

  const data = {
    companyId,
    title: "Lender Readiness Report",
    summary: "Consolidated institutional view of debt, covenants, cyber posture, credit health, and refinance opportunity.",
    score: {
      overall: 64,
      debt: 47,
      cyber: 62,
      leverage: 70,
      coverage: 80,
      covenant: 66,
      credit: 55,
    },
    verdict: "Conditional Approval Likely",
    headline: "Debt is costly (26% credit cards) and cyber posture is moderate — refinance before applying for best terms.",
    generatedAt: new Date().toISOString(),
    keyRisks: [
      { level: "HIGH", label: "Credit card debt", detail: "$74,000 at 26% interest is the largest drag on borrowing cost." },
      { level: "MODERATE", label: "Cyber readiness", detail: "No offline backups and missing MFA leave the business exposed to ransomware." },
      { level: "MODERATE", label: "Covenant headroom", detail: "Debt/EBITDA at 1.17x leaves thin headroom to the 2.00x bank limit." },
      { level: "LOW", label: "Interest coverage", detail: "EBIT covers interest 6.0x — comfortably above the 2.0x lender threshold." },
    ],
    debt: {
      totalDebt: 1284000,
      monthlyPayments: 18950,
      annualInterestExpense: 118320,
      weightedAvgRate: 11.9,
      debtToEbitda: 1.17,
      interestCoverage: 6.0,
      ebitda: 1100000,
      ebit: 850000,
      interest: 170000,
      debtByType: [
        { name: "Equipment Loan", balance: 420000, rate: 6.9, monthly: 8100, maturity: "2028-06-01" },
        { name: "Truck Loans", balance: 610000, rate: 8.2, monthly: 7550, maturity: "2027-11-01" },
        { name: "Working Capital Loan", balance: 180000, rate: 13.4, monthly: 2900, maturity: "2026-12-01" },
        { name: "Credit Cards", balance: 74000, rate: 26.0, monthly: 2400, maturity: "2026-08-01" },
      ],
      maturitySchedule: [
        { year: 2026, amount: 180000 },
        { year: 2027, amount: 320000 },
        { year: 2028, amount: 900000 },
        { year: 2029, amount: 210000 },
      ],
      variableVsFixed: { fixed: 1030000, variable: 254000 },
      balloonPayments: [{ creditor: "Equipment Loan", due: "2028-06-01", amount: 95000 }],
      personalGuarantees: 2,
    },
    covenants: {
      status: "MONITOR",
      items: [
        { name: "Debt / EBITDA", current: 1.17, limit: 2.0, unit: "x", status: "within", headroomPct: 41 },
        { name: "Interest Coverage", current: 6.0, minimum: 2.0, unit: "x", status: "within" },
        { name: "Current Ratio", current: 1.4, minimum: 1.1, unit: "x", status: "within" },
        { name: "Minimum EBITDA", current: 1100000, minimum: 750000, unit: "$", status: "within" },
        { name: "Leverage (Senior Debt/EBITDA)", current: 1.17, limit: 2.25, unit: "x", status: "within" },
      ],
    },
    refinance: {
      opportunities: [
        { name: "SBA 7(a) refinance", description: "Refinance working capital + credit cards below 10%", targetRate: 9.5, eligibleDebt: 254000 },
        { name: "Equipment loan consolidation", description: "Consolidate equipment + trucks at 7.2%", targetRate: 7.2, eligibleDebt: 1030000 },
      ],
      currentAnnualInterest: 118320,
      potentialAnnualInterest: 80920,
      annualSavings: 37400,
    },
    enterpriseValueImpact: {
      currentValue: 4620000,
      potentialValue: 4862000,
      impact: -242000,
      rationale: "High-rate debt (11.9% blended) raises the buyer's cost of capital and depresses the effective enterprise value.",
    },
    cyber: {
      score: 62,
      riskLevel: "Moderate Risk",
      controls: [
        { name: "MFA enabled", status: "partial" },
        { name: "Endpoint protection", status: "ok" },
        { name: "Offline backups", status: "missing" },
        { name: "Restore testing", status: "missing" },
        { name: "Phishing protection", status: "partial" },
        { name: "Software updates", status: "ok" },
      ],
      readiness: 58,
    },
    credit: {
      business: { bureaus: [{ bureau: "Experian Intelliscore", score: 68, band: "Fair" }, { bureau: "Equifax Business", score: 64, band: "Fair" }, { bureau: "Dun & Bradstreet", score: 71, band: "Good" }] },
      status: "FAIR",
    },
    underwriterSummary: "A sound operating business with healthy EBITDA coverage. Primary concerns are the high-cost credit card balance, moderate cyber posture, and limited covenant headroom. Refinancing the 26% credit card debt and enabling MFA + offline backups would materially improve approval odds.",
  };

  return NextResponse.json(data);
}
