import { NextRequest } from "next/server";
import { handlePortfolioGet } from "@/lib/portfolioProxy";

/**
 * GET /api/portfolio
 *
 * The portfolios the signed-in user belongs to. This is the only endpoint here
 * that serves no financial figures, and it is what every other portfolio screen
 * depends on to know which id to ask about.
 *
 * No company parameter and no fixture fallback: the list is resolved from
 * membership on the backend, and an unauthenticated caller has no membership.
 */
export async function GET(req: NextRequest) {
  return handlePortfolioGet(req, "/portfolio");
}
