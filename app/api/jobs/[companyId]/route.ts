import { NextRequest, NextResponse } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  jobs: [
    { jobId: "J-1042", revenue: 12400, cost: 9800, profit: 2600, technician: "Tech #4", durationHours: 4.3, durationText: "4h 18m" },
    { jobId: "J-1088", revenue: 9200, cost: 8900, profit: 300, technician: "Tech #2", durationHours: 3.9, durationText: "3h 54m" },
    { jobId: "J-1120", revenue: 16700, cost: 14200, profit: 2500, technician: "Tech #1", durationHours: 5.1, durationText: "5h 6m" },
    { jobId: "J-1184", revenue: 13600, cost: 13150, profit: 450, technician: "Tech #4", durationHours: 4.7, durationText: "4h 42m" },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/jobs`, demoData);
}
