import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  financial: {
    revenue: 420000,
    grossMarginPct: 40.0,
    ebitda: 1100000,
    cash: 185000,
    debt: {
      totalDebt: 1284000,
      monthlyDebtPayments: 28000,
      annualInterestExpense: 166780,
      weightedAvgRate: 13.0,
      variableRatePortion: 254000,
      totalBalloonPayments: 145000,
      personalGuaranteeExposure: 790000,
      items: [
        { id: "debt-1", name: "Equipment Loan", type: "equipment", principal: 420000, interestRate: 6.9, monthlyPayment: 8100, remainingTermMonths: 60, isVariableRate: false, hasBalloonPayment: false, hasPersonalGuarantee: false, lender: "Bank of America", maturityDate: "2031-06-15" },
        { id: "debt-2", name: "Truck Loans", type: "truck", principal: 610000, interestRate: 8.2, monthlyPayment: 12500, remainingTermMonths: 48, isVariableRate: false, hasBalloonPayment: true, balloonAmount: 145000, balloonDate: "2028-12-01", hasPersonalGuarantee: true, lender: "Mercedes Financial", maturityDate: "2028-12-01" },
        { id: "debt-3", name: "Working Capital Loan", type: "working_capital", principal: 180000, interestRate: 13.4, monthlyPayment: 4200, remainingTermMonths: 36, isVariableRate: true, hasBalloonPayment: false, hasPersonalGuarantee: true, lender: "OnDeck", maturityDate: "2029-03-20" },
        { id: "debt-4", name: "Credit Cards", type: "credit_card", principal: 74000, interestRate: 26.0, monthlyPayment: 3200, remainingTermMonths: 24, isVariableRate: true, hasBalloonPayment: false, hasPersonalGuarantee: false, lender: "Chase / Amex", maturityDate: "2028-08-01" },
      ],
      byLender: {},
      maturitySchedule: [{ year: 2028, amount: 684000, items: ["Truck Loans", "Credit Cards"] }, { year: 2029, amount: 180000, items: ["Working Capital Loan"] }, { year: 2031, amount: 420000, items: ["Equipment Loan"] }],
    },
    debtHealth: { score: 47, rating: "High Risk", factors: {} },
    debtToEbitda: { totalDebt: 1284000, ebitda: 1100000, ratio: 1.17, assessment: "Moderate leverage" },
    interestCoverage: { ebit: 850000, annualInterest: 166780, coverageRatio: 5.1, status: "Strong" },
    enterpriseValueImpact: { currentDebtCostAnnual: 166780, optimizedDebtCostAnnual: 83450, potentialSavingsAnnual: 83330, multipleImpact: 0.75, evImpact: 374985, narrative: "Because your debt carries high interest rates averaging 13.0%, your company is worth approximately $375K less than it could be." },
    refinanceOpportunities: { opportunities: [ { type: "Debt Consolidation — Credit Cards", currentRate: 26.0, estimatedNewRate: 8.5, annualSavings: 12950 } ], totalSavings: 12950 },
    cashFlowWaterfall: { revenue: 420000, cogs: 252000, grossProfit: 168000, grossMarginPct: 40.0, payroll: 98000, rent: 18000, marketing: 12000, interest: 28000, taxes: 8400, netIncome: 3600, freeCashFlow: 3600, flowItems: [] },
  },
  operational: { technicianUtilization: 72, bookingRate: 84, membershipRenewalRate: 82, installCloseRate: 38, maintenanceRevenue: 216000 },
  risk: {
    cyberHealth: { score: 65, rating: "Good", factors: { mfaScore: 72, passwordScore: 45, endpointScore: 80, backupScore: 65, phishingScore: 55, patchScore: 70, emailSecurityScore: 60, vendorScore: 75 } },
    fraudAlerts: 3,
    darkWebAlerts: 3,
    cashRunway: 3.2,
    covenantStatus: "Watch",
    covenantAtRisk: 2,
    complianceStatus: "All compliance checks passed",
  },
  growth: { acquisitionReadiness: "Pre-Revenue Threshold", multiLocationCount: 3, customerLifetimeValue: 4200, marketingROI: 3.2, expansionCapacity: "Moderate — strengthen cash flow before new locations" },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const p = await params;
  return handleApiGet(req, p, `/institutional/executive-risk-dashboard/${p.companyId}`, demoData);
}
