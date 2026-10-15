import { NextRequest } from "next/server";
import { handlePortfolioGet } from "@/lib/portfolioProxy";

/**
 * GET /api/portfolio/:portfolioId/overview
 *
 * Aggregated EBITDA, enterprise value, cash position and leakage across the
 * portfolio, plus the coverage block that says which companies contributed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  const { portfolioId } = await params;
  return handlePortfolioGet(req, `/portfolio/${encodeURIComponent(portfolioId)}/overview`);
}
