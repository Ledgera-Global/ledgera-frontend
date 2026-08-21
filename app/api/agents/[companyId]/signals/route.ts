import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoSignals = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  signals: [],
  summary: {
    totalOpen: 0,
    totalApproved: 0,
    totalImplemented: 0,
    totalEstimatedImpact: 0,
    totalRealizedImpact: 0,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/agents/${p.companyId}/signals`, demoSignals);
}
