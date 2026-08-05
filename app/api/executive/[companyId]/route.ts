import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  margin: {
    "Install": { revenue: 85000, profit: 29750, margin: 0.35 },
    "Repair": { revenue: 42000, profit: 12600, margin: 0.30 },
    "Maintenance": { revenue: 18000, profit: 7200, margin: 0.40 },
  },
  techRevenue: [
    { technicianId: "T001", technicianName: "Mike Lopez", revenue: 52000 },
    { technicianId: "T002", technicianName: "Sarah Chen", revenue: 48000 },
    { technicianId: "T003", technicianName: "James Wilson", revenue: 41000 },
  ],
  ar: [
    { bucket: "0-30 days", total: 45000, count: 28 },
    { bucket: "31-60 days", total: 22000, count: 12 },
    { bucket: "61-90 days", total: 11000, count: 5 },
  ],
  forecast: { ebitda: 185000, revenue: 420000, expenses: 235000, message: "Healthy trajectory" },
  valuation: { ebitda: 185000, valuation: 925000, valuationReadiness: "Operational Improve" },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/executive/${p.companyId}`, demoData);
}
