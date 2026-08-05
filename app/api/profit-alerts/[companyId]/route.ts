import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  windowDays: 30,
  generatedAt: new Date().toISOString(),
  alerts: [
    { type: "LOW_SERVICE_MARGIN", severity: "CRITICAL" as const, title: "$2,400 lost from underpriced installs", detail: "Pricing spread indicates underpriced services that reduce realized margin.", estimatedLostDollars: 2400 },
    { type: "LOW_TECHNICIAN_EFFICIENCY", severity: "HIGH" as const, title: "Tech #4 30% below avg productivity", detail: "Windowed efficiency score suggests lower revenue throughput vs peers.", estimatedLostDollars: 3600 },
    { type: "IDLE_TECHNICIAN", severity: "HIGH" as const, title: "12 missed calls = est. $6,000 lost", detail: "Dispatch/callback proxy indicates idle gaps that correlate with missed opportunities.", estimatedLostDollars: 6000 },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/profit-alerts?windowDays=30`, demoData);
}
