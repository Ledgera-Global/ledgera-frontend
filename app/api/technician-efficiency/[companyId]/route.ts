import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  windowDays: 30,
  technicians: [
    { technicianId: "tech-4", technicianName: "Tech #4", jobsCount: 9, revenue: 62000, profit: 18500, marginPct: 29.84, revenuePerJob: 6888.89, profitPerJob: 2055.56, avgJobDurationHours: 4.7, efficiencyScore: 72.0 },
    { technicianId: "tech-2", technicianName: "Tech #2", jobsCount: 10, revenue: 56000, profit: 13200, marginPct: 23.57, revenuePerJob: 5600, profitPerJob: 1320, avgJobDurationHours: 4.1, efficiencyScore: 61.5 },
    { technicianId: "tech-1", technicianName: "Tech #1", jobsCount: 8, revenue: 49000, profit: 12100, marginPct: 24.69, revenuePerJob: 6125, profitPerJob: 1512.5, avgJobDurationHours: 5.3, efficiencyScore: 58.8 },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/technician-efficiency?windowDays=30`, demoData);
}
