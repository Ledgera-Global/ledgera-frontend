import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
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
  byLender: { "Bank of America": { principal: 420000, count: 1 }, "Mercedes Financial": { principal: 610000, count: 1 }, "OnDeck": { principal: 180000, count: 1 }, "Chase / Amex": { principal: 74000, count: 1 } },
  maturitySchedule: [{ year: 2028, amount: 684000, items: ["Truck Loans", "Credit Cards"] }, { year: 2029, amount: 180000, items: ["Working Capital Loan"] }, { year: 2031, amount: 420000, items: ["Equipment Loan"] }],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const p = await params;
  return handleApiGet(req, p, `/institutional/debt-dashboard/${p.companyId}`, demoData);
}
