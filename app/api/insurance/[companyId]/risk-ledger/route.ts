import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";
import { RISK_LEDGER_DEMO } from "@/lib/data/riskLedgerDemo";
import type { CorporateRiskLedger } from "@/lib/types/riskLedger";

/**
 * GET /api/insurance/:companyId/risk-ledger
 *
 * Proxies to the backend's /insurance/:companyId/risk-ledger. Authenticated
 * callers get live data or a loud 502 — never the fixture. The fixture is only
 * served to unauthenticated previews, labelled with X-Ledgera-Data-Source: demo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<CorporateRiskLedger>(
    req,
    p,
    `/insurance/${p.companyId}/risk-ledger`,
    RISK_LEDGER_DEMO
  );
}
