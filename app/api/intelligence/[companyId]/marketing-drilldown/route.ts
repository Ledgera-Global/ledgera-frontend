import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  const search = req.nextUrl.searchParams;
  const qs = new URLSearchParams();
  if (search.get("lookbackDays")) qs.set("lookbackDays", search.get("lookbackDays")!);
  const query = qs.toString();
  return handleApiGet(
    req,
    p,
    `/intelligence/${p.companyId}/marketing-drilldown${query ? `?${query}` : ""}`,
    null
  );
}
