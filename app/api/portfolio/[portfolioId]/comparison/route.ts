import { NextRequest } from "next/server";
import { handlePortfolioGet } from "@/lib/portfolioProxy";

/**
 * GET /api/portfolio/:portfolioId/comparison
 *
 * The cross-company comparison grid: every company as a row, every comparable
 * metric as a column, plus the portfolio median for each column so a row can be
 * read against the portfolio rather than in isolation.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  const { portfolioId } = await params;
  return handlePortfolioGet(req, `/portfolio/${encodeURIComponent(portfolioId)}/comparison`);
}
