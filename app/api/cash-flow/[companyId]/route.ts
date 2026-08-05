import { NextRequest, NextResponse } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = { cashIn: 120000, cashOut: 132000, realCashFlow: -12000 };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const resolvedParams = await params;
  return handleApiGet(req, resolvedParams, `/analytics/${resolvedParams.companyId}/cash-flow`, demoData);
}
