import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  currentEbitda: 185000,
  forecastedEbitda: 242000,
  growthPct: 30.8,
  message: "EBITDA projected to grow 30.8% with current recovery initiatives.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/ebitda-forecast`, demoData);
}
