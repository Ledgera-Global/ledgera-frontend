import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { NETWORK_QUESTIONS_DEMO } from "@/lib/data/networkCoverageDemo";
import type { AnswerableQuestionsResponse } from "@/lib/types/networkCoverage";

/**
 * GET /api/network-coverage/:companyId/questions
 *
 * Returns the same question set as the coverage report, split into what can be
 * answered now and what cannot. Blocked questions come back with the layers
 * they are missing - the backend never answers a question partially, so there
 * is nothing to filter client-side and no risk of a partial answer being shown
 * as if it were complete.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<AnswerableQuestionsResponse>(
    req,
    p,
    `/network-coverage/${p.companyId}/questions`,
    NETWORK_QUESTIONS_DEMO
  );
}
