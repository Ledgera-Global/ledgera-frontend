import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import type { CallMetric } from "@/lib/types";

const demoData: CallMetric[] = [
  { metric: "Total calls", value: 847, unit: "calls" },
  { metric: "Missed calls", value: 103, unit: "calls" },
  { metric: "Missed call rate", value: 12.2, unit: "%" },
  { metric: "Avg response time", value: 4.2, unit: "min" },
  { metric: "Call-to-job conversion", value: 34.5, unit: "%" },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/call-metrics`, demoData);
}
