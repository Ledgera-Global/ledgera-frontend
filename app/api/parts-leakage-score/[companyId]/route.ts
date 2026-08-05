import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  score: 18,
  totalPartsLeakage: 12400,
  highRiskParts: 23,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/parts-leakage-score`, demoData);
}
