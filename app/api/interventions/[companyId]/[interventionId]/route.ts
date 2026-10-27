import { NextRequest } from "next/server";
import { handleApiMutation } from "@/lib/backendProxy";
import type { InterventionSummary } from "@/lib/types/interventions";

/**
 * PATCH /api/interventions/:companyId/:interventionId
 *
 * Records or corrects the measurement windows for one intervention. There is no
 * fixture fallback here and there never should be: a mutation that silently
 * wrote fabricated dates would corrupt the only input the attribution depends
 * on, and the damage would not surface until someone quoted the result.
 *
 * The backend validates the windows before storing them - a baseline may not
 * touch the treated period and neither window may be shorter than a month - and
 * returns its rejection message, which is passed straight through to the page so
 * the owner sees why the dates were refused rather than a generic failure.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; interventionId: string }> }
) {
  const p = await params;
  return handleApiMutation<InterventionSummary>(
    req,
    p,
    `/interventions/${p.companyId}/interventions/${p.interventionId}`,
    "PATCH"
  );
}
