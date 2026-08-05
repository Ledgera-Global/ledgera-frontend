import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = [
  { technicianId: "T001", technicianName: "Mike Lopez", revenue: 52000, profit: 18200, marginPct: 35.0 },
  { technicianId: "T002", technicianName: "Sarah Chen", revenue: 48000, profit: 16800, marginPct: 35.0 },
  { technicianId: "T003", technicianName: "James Wilson", revenue: 41000, profit: 10250, marginPct: 25.0 },
  { technicianId: "T004", technicianName: "David Kim", revenue: 37000, profit: 5550, marginPct: 15.0 },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/technician-profit`, demoData);
}
