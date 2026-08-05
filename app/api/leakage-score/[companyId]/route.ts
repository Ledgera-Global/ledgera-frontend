import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  score: 33,
  signal: "HIGH",
  totalLeakage: 25000,
  breakdown: { uncollectedRevenue: 14000, underpricedServices: 6000, laborInefficiency: 5000 },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/leakage-score`, demoData);
}
