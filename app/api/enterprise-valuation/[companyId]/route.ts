import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { DEFAULT_VALUATION } from "@/lib/data/defaults";
import type { EnterpriseValuation } from "@/lib/types/acquisition";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/enterprise-valuation/${p.companyId}`, DEFAULT_VALUATION);
}
