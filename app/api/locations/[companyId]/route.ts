import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

interface LocationRow {
  id: string;
  name: string;
  address: string | null;
  phone?: string | null;
  active?: boolean;
  _count?: { technicians: number; jobs: number; serviceTypes: number };
}

interface LocationListResponse {
  locations: LocationRow[];
}

/**
 * The unauthenticated preview: no locations, never invented ones.
 *
 * A fabricated branch list is worse than an empty one here - the switcher
 * filters every dashboard page by the selected location, so an invented id
 * would silently narrow a signed-in user's own data to nothing.
 */
const NO_LOCATIONS: LocationListResponse = { locations: [] };

/**
 * GET /api/locations/:companyId
 *
 * The dashboard's location switcher used to fetch the backend origin directly,
 * which `connect-src 'self'` blocks, so the switcher always fell back to
 * "All locations" and multi-branch customers could not scope their view.
 *
 * Routing it through `handleApiGet` rather than a bespoke proxy means it
 * inherits the same rules as every other customer read: the caller's own token
 * is forwarded, the backend's `requireCompanyIdMatch` and `authorize("admin")`
 * still gate it, and a caller asking for another company's locations is
 * refused before any upstream call is made.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet<LocationListResponse>(
    req,
    p,
    `/locations/${p.companyId}`,
    NO_LOCATIONS
  );
}
