import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  score: 72,
  recommendation: "Strong acquisition candidate — healthy margins with moderate operational risk.",
  signals: [
    "Revenue growth above industry median",
    "Technician utilization at 82%",
    "AR aging below 30 days for 78% of outstanding",
    "EBITDA margin above 15% threshold",
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/acquisition/${p.companyId}`, demoData);
}
