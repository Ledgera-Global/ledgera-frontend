import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  cashOnHand: 185000,
  cashInPerMonth: 320000,
  cashOutPerMonth: 345000,
  netBurnRate: -25000,
  monthsOfRunway: 3.2,
  payrollAmount: 98000,
  nextPayrollDate: "2026-08-15",
  canMakePayroll: true,
  payrollRisk: "MEDIUM",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/cash-runway/${p.companyId}`, demoData);
}
