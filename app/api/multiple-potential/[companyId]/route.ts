import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { DEFAULT_MULTIPLE_POTENTIAL } from "@/lib/data/defaults";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/multiple-potential/${p.companyId}`, DEFAULT_MULTIPLE_POTENTIAL);
}
