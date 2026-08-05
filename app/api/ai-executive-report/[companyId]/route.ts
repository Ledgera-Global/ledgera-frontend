import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  report: `## Executive Summary

### Financial Position
Revenue is trending positively at $420K for the trailing period with a gross margin of 22%. 
EBITDA stands at $185K yielding a 16% margin.

### Key Areas of Concern
1. **Labor Efficiency**: Technician utilization at 74% is below the 85% target. 
   This represents approximately $38K in potential unrealized margin.
2. **AR Aging**: 22% of outstanding receivables sit beyond 60 days.
   At-risk amount totals $19K.
3. **Pricing Inconsistency**: 12% of jobs show margin compression below 25%.

### Recommended Actions
- Implement dynamic pricing for emergency service calls
- Automate collection workflows for 60+ day invoices
- Review dispatch routing to reduce technician travel time

### Recovery Potential
With targeted interventions, estimated EBITDA lift of 30.8% ($57K) is achievable within 90 days.`,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/ai/executive-report/${p.companyId}`, demoData);
}
