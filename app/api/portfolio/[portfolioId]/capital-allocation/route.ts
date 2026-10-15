import { NextRequest } from "next/server";
import { handlePortfolioGet } from "@/lib/portfolioProxy";

/**
 * GET /api/portfolio/:portfolioId/capital-allocation
 *
 * Companies ranked by the absolute dollar EBITDA opportunity available to them,
 * with the enterprise-value creation each one implies at the portfolio's
 * multiple. Ranked by dollars, not by margin gap: a large company two points
 * below median is worth more attention than a small one ten points below.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  const { portfolioId } = await params;
  return handlePortfolioGet(
    req,
    `/portfolio/${encodeURIComponent(portfolioId)}/capital-allocation`
  );
}
