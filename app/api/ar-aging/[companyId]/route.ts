import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  buckets: [
    { bucket: "0-30 days", total: 45000, count: 28 },
    { bucket: "31-60 days", total: 22000, count: 12 },
    { bucket: "61-90 days", total: 11000, count: 5 },
    { bucket: "90+ days", total: 8000, count: 3 },
  ],
  totalOutstanding: 86000,
  atRiskAmount: 19000,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/analytics/${p.companyId}/ar-aging`, demoData);
}
