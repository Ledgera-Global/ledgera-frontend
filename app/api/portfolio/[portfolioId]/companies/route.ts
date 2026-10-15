import { NextRequest } from "next/server";
import { handlePortfolioGet } from "@/lib/portfolioProxy";

/**
 * GET /api/portfolio/:portfolioId/companies
 *
 * The operating companies, ranked by EBITDA margin, with each one's diagnosed
 * top issue. Powers the dashboard's company list.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  const { portfolioId } = await params;
  return handlePortfolioGet(req, `/portfolio/${encodeURIComponent(portfolioId)}/companies`);
}
