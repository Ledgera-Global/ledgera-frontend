import { NextRequest, NextResponse } from "next/server";
import type { MissedCallRevenueImpact } from "@/lib/types/acquisition";

const demoMissedCallRevenue: MissedCallRevenueImpact = {
  missedCalls: 417,
  estimatedBookingRate: 0.78,
  estimatedBookableCallsLost: 325,
  avgRevenuePerCall: 450,
  revenueOpportunityLost: 146250,
  grossMarginPct: 0.50,
  grossProfitLost: 73125,
  annualEbitdaImpact: 889688,
  enterpriseValueImpact: 6227816,
  appliedMultiple: 7,
  daysAnalyzed: 30,
  periodLabel: "Last 30 days",
  benchmark: {
    industryAvgBookingRate: 0.82,
    benchmarkRevenueLost: 153765,
    gapVsBenchmark: 17,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  (await params);
  return NextResponse.json(demoMissedCallRevenue);
}
