import { NextRequest } from "next/server";
import { handleApiGet, handleApiMutationWithDetail } from "@/lib/backendProxy";
import { ASSURANCE_CASES_DEMO } from "@/lib/data/assuranceCasesDemo";
import type { AssuranceCase } from "@/lib/types/assuranceCases";

/**
 * GET   /api/assurance-cases/:companyId/:caseId  → one case
 * PATCH /api/assurance-cases/:companyId/:caseId  → own it, reschedule it, close it
 *
 * The PATCH uses the detail-forwarding mutation helper rather than the generic
 * one, because every refusal the policy makes is a sentence written for the
 * operator: "a closure needs a resolution note", "a written-off case cannot
 * carry a recovery amount". Collapsing those into a generic failure would leave
 * the form with nothing to say beyond "not saved".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; caseId: string }> }
) {
  const p = await params;
  const demo =
    ASSURANCE_CASES_DEMO.cases.find((row) => row.id === p.caseId) ??
    ASSURANCE_CASES_DEMO.cases[0];

  return handleApiGet<AssuranceCase>(
    req,
    p,
    `/assurance-cases/${p.companyId}/cases/${p.caseId}`,
    demo
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; caseId: string }> }
) {
  const p = await params;
  return handleApiMutationWithDetail<AssuranceCase>(
    req,
    p,
    `/assurance-cases/${p.companyId}/cases/${p.caseId}`,
    "PATCH"
  );
}
