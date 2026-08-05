import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  currentUtilizationPct: 72,
  maxCapacity: 100,
  bookedJobsNext30d: 168,
  estimatedJobsPerTech: 14,
  recommendedHires: 2,
  canHireSafely: true,
  message: "You can safely hire 2 technicians next month based on current booked work.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/capacity-forecast/${p.companyId}`, demoData);
}
