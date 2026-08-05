import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  currentValue: 11200000,
  ebitda: 1600000,
  multiple: 7.0,
  trend: [
    { periodLabel: "Today", enterpriseValue: 11200000, ebitda: 1600000, multiple: 7.0 },
    { periodLabel: "30 Days Ago", enterpriseValue: 10800000, ebitda: 1550000, multiple: 6.97 },
    { periodLabel: "12 Months Ago", enterpriseValue: 8900000, ebitda: 1300000, multiple: 6.85 },
  ],
  drivers: [
    { label: "EBITDA Growth", change: "+$300K", impact: 1400000 },
    { label: "Margin Improvement", change: "+2.1%", impact: 500000 },
    { label: "Recurring Revenue Growth", change: "+8%", impact: 250000 },
    { label: "Reduced Callback Rate", change: "-3%", impact: 150000 },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/value-tracker/${p.companyId}`, demoData);
}
