import { NextRequest } from "next/server";
import { handleApiMutation } from "@/lib/backendProxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; signalId: string }> }
) {
  const p = await params;
  return handleApiMutation(
    req,
    { companyId: p.companyId },
    `/agents/${p.companyId}/signals/${p.signalId}/implement`,
    "POST"
  );
}
