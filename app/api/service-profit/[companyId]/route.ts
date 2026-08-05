import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = [
  { serviceType: "Install", revenue: 85000, profit: 29750, marginPct: 35.0, jobCount: 42 },
  { serviceType: "Repair", revenue: 42000, profit: 12600, marginPct: 30.0, jobCount: 68 },
  { serviceType: "Maintenance", revenue: 18000, profit: 7200, marginPct: 40.0, jobCount: 91 },
  { serviceType: "Diagnostic", revenue: 9500, profit: 2375, marginPct: 25.0, jobCount: 35 },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/service-profit`, demoData);
}
