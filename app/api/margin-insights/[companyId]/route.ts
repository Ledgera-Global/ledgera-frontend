import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData: Record<string, { revenue: number; profit: number; margin: number }> = {
  "Install": { revenue: 85000, profit: 29750, margin: 0.35 },
  "Repair": { revenue: 42000, profit: 12600, margin: 0.30 },
  "Maintenance": { revenue: 18000, profit: 7200, margin: 0.40 },
  "Diagnostic": { revenue: 9500, profit: 2375, margin: 0.25 },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/margin-insights`, demoData);
}
