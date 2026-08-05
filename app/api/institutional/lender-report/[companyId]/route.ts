import { type NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const BACKEND_PATH = "/institutional/lender-report";

/**
 * Demo fallback for the consolidated lender readiness report.
 * Mirrors the shape returned by ledgera-backend GET /institutional/lender-report/:companyId.
 */
const DEMO_LENDER_REPORT = {
  companyId: "companyA",
  reportId: "LDR-DEMO",
  generatedAt: new Date().toISOString(),
  overallScore: 64,
  verdict: "Conditional Approval Likely",
  headline:
    "This company carries roughly $95K/yr of avoidable interest. Strengthening the debt stack is worth $95K/yr in cash flow.",
  sections: {
    debt: {
      status: "yellow",
      data: {
        totalDebt: 1284000,
        monthlyDebtPayments: 28000,
        annualInterestExpense: 141160,
        weightedAvgRate: 11.0,
        variableRatePortion: 254000,
        totalBalloonPayments: 145000,
        personalGuaranteeExposure: 790000,
        items: [],
        byLender: {},
        maturitySchedule: [
          { year: 2027, amount: 180000, items: ["Equipment Loan"] },
          { year: 2028, amount: 684000, items: ["Truck Loans", "Credit Cards"] },
          { year: 2029, amount: 420000, items: ["Working Capital Loan"] },
        ],
      },
      notes: [],
    },
    debtHealth: {
      status: "yellow",
      data: {
        score: 47,
        rating: "Fair",
        factors: {
          interestRateScore: 52,
          leverageScore: 45,
          maturityScore: 60,
          paymentBurdenScore: 41,
          ebitdaCoverageScore: 51,
          liquidityScore: 42,
          covenantRiskScore: 38,
        },
      },
      notes: [],
    },
    leverage: {
      status: "yellow",
      data: { totalDebt: 1284000, ebitda: 1100000, ratio: 1.17, assessment: "Moderate leverage - within bank comfort zone" },
      notes: ["Moderate leverage - within bank comfort zone"],
    },
    interestCoverage: {
      status: "green",
      data: { ebit: 847000, annualInterest: 141160, coverageRatio: 6.0, status: "Strong" },
      notes: [],
    },
    evImpact: {
      status: "yellow",
      data: {
        currentDebtCostAnnual: 141160,
        optimizedDebtCostAnnual: 86400,
        potentialSavingsAnnual: 54760,
        multipleImpact: 0.75,
        evImpact: 246420,
        narrative:
          "Because your debt carries high interest rates averaging 11%, your company is worth approximately $246K less than it could be.",
      },
      notes: [],
    },
    refinance: {
      status: "yellow",
      data: {
        opportunities: [
          {
            type: "Debt Consolidation - Credit Cards",
            currentRate: 26,
            estimatedNewRate: 8.5,
            currentAnnualInterest: 19240,
            newAnnualInterest: 6290,
            annualSavings: 12950,
            estimatedFees: 1850,
            breakevenMonths: 2,
            recommendation: "Refinance Credit Cards from 26% to ~8.5% - saves $13K/yr, breaks even in 2 months.",
          },
          {
            type: "SBA Refinance - Working Capital Loan",
            currentRate: 13.4,
            estimatedNewRate: 9,
            currentAnnualInterest: 24120,
            newAnnualInterest: 16200,
            annualSavings: 7920,
            estimatedFees: 4500,
            breakevenMonths: 7,
            recommendation: "Refinance Working Capital Loan from 13.4% to ~9% - saves $8K/yr, breaks even in 7 months.",
          },
        ],
        totalCurrentInterest: 141160,
        totalOptimizedInterest: 120440,
        totalSavings: 20870,
      },
      notes: [],
    },
    cashFlow: {
      status: "green",
      data: {
        revenue: 420000,
        cogs: 252000,
        grossProfit: 168000,
        grossMarginPct: 40,
        payroll: 98000,
        rent: 18000,
        marketing: 12000,
        interest: 28000,
        taxes: 8400,
        netIncome: 3600,
        freeCashFlow: 3600,
        flowItems: [],
      },
      notes: [],
    },
    covenants: {
      status: "yellow",
      data: {
        companyId: "companyA",
        covenants: [],
        totalCovenants: 6,
        greenCount: 3,
        yellowCount: 2,
        redCount: 1,
        atRiskCovenants: [],
        overallStatus: "Watch",
        generatedAt: new Date().toISOString(),
      },
      notes: [],
    },
    cyber: {
      status: "yellow",
      data: {
        overallScore: 62,
        status: "Needs Improvement",
        categories: {
          mfa: { score: 45, status: "At Risk", gaps: ["Admin portal MFA not enforced for 8 of 12 users"] },
          backups: { score: 78, status: "Acceptable", gaps: ["No offline/air-gapped backups"] },
          endpoint: { score: 70, status: "Acceptable", gaps: ["12 laptops lack disk encryption"] },
          training: { score: 40, status: "At Risk", gaps: ["Annual phishing simulation participation rate is only 34%"] },
          patchManagement: { score: 55, status: "Needs Improvement", gaps: ["Average patch deployment time is 38 days"] },
        },
        generatedAt: new Date().toISOString(),
      },
      notes: [],
    },
    credit: {
      status: "yellow",
      data: {
        companyId: "companyA",
        businessCredit: [
          { name: "Experian Business", score: 72, scoreRange: { min: 0, max: 100 }, lastUpdated: "2026-07-15", trend: "stable", changePoints: 0, factors: [] },
          { name: "Equifax Business", score: 65, scoreRange: { min: 0, max: 100 }, lastUpdated: "2026-07-10", trend: "down", changePoints: -3, factors: [] },
          { name: "Dun & Bradstreet", score: 78, scoreRange: { min: 0, max: 100 }, lastUpdated: "2026-07-01", trend: "up", changePoints: 2, factors: [] },
        ],
        inquiries: [],
        alerts: [],
        overallHealth: "Good",
        generatedAt: new Date().toISOString(),
      },
      notes: [],
    },
  },
  keyRisks: [
    "Rate exposure: 20% of debt is variable-rate.",
    "Balloon exposure: $145K in balloon payments due (1 facility/facilities).",
    "Personal guarantees: $790K of debt is personally guaranteed.",
    "Cyber posture (62/100) may fail insurer underwriting or raise premium materially.",
    "Refinance opportunity: ~$21K/yr in interest savings identified - strengthen the balance sheet before applying.",
  ],
  lenderConfidenceNotes: [
    "Debt service burden: $28.0K/mo across 4 facilities at a 11% blended rate.",
    "Debt/EBITDA of 1.17x is within standard SBA/equipment underwriting parameters.",
    "Covenant status: 3/6 tracked covenants green (Watch).",
    "Cyber insurance readiness: 62/100 (Needs Improvement) - insurers currently require MFA + tested backups + endpoint protection.",
  ],
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;
  return handleApiGet(req, { companyId }, `${BACKEND_PATH}/${companyId}`, DEMO_LENDER_REPORT);
}
