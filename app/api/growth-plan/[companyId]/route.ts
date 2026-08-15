import { NextRequest, NextResponse } from "next/server";
import type { EnterpriseValueGrowthPlan } from "@/lib/types/acquisition";

const demoGrowthPlan: EnterpriseValueGrowthPlan = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  currentEnterpriseValue: 925000,
  currentEbitda: 185000,
  currentMultiple: 5.0,
  potentialEnterpriseValue: 4940000,
  valueCreationGap: 4015000,
  priorities: [
    {
      rank: 1,
      title: "Capture lost call revenue",
      category: "calls",
      currentMetric: "417 missed calls",
      targetMetric: "Reduce missed calls by 30%",
      expectedEbitdaImpact: 768000,
      expectedEnterpriseValueImpact: 5376000,
      effort: "low",
      timeframe: "30 days",
      diagnosis: "417 missed calls at 78% booking rate = $157.5K revenue lost, $78.8K gross profit lost.",
      prescription: "Review call recordings of unbooked calls. Retrain lowest-performing CSRs. Add after-hours call coverage. Reduce hold times during peak periods.",
    },
    {
      rank: 2,
      title: "Recover install gross margin",
      category: "install_margin",
      currentMetric: "35% install margin",
      targetMetric: "38% install margin",
      expectedEbitdaImpact: 210000,
      expectedEnterpriseValueImpact: 1470000,
      effort: "medium",
      timeframe: "60 days",
      diagnosis: "Install margin dropped from 42% to 35%. At $5M install revenue, each percentage point = $50K gross profit. Three points = $150K recovered.",
      prescription: "Audit discounted jobs. Compare install crew labor hours against estimates. Review material cost increases. Identify lowest-margin equipment packages and adjust pricing.",
    },
    {
      rank: 3,
      title: "Increase technician billable utilization",
      category: "technician",
      currentMetric: "60% billable utilization",
      targetMetric: "75% billable utilization",
      expectedEbitdaImpact: 180000,
      expectedEnterpriseValueImpact: 1260000,
      effort: "medium",
      timeframe: "60 days",
      diagnosis: "Technicians billable 6 hours of 10-hour day. 2 hours driving + 1 hour idle. 10 techs × $2K/day × 15% utilization gain = $3K/day additional revenue.",
      prescription: "Optimize dispatch routing. Batch jobs geographically. Reduce idle time between calls. Implement morning huddles with clear daily routing.",
    },
    {
      rank: 4,
      title: "Improve call booking rate to industry benchmark",
      category: "calls",
      currentMetric: "78% booking rate",
      targetMetric: "85% booking rate",
      expectedEbitdaImpact: 120000,
      expectedEnterpriseValueImpact: 840000,
      effort: "low",
      timeframe: "30 days",
      diagnosis: "Booking rate of 78% is below the 82% industry average. Every 1% improvement = approximately $15K additional annual EBITDA.",
      prescription: "Implement call scripts for common objections. Train CSRs on consultative booking. Add call-back capability for hang-ups. Monitor CSR-level booking rates and coach bottom performers weekly.",
    },
    {
      rank: 5,
      title: "Increase maintenance agreement renewals",
      category: "maintenance",
      currentMetric: "82% renewal rate",
      targetMetric: "90% renewal rate",
      expectedEbitdaImpact: 90000,
      expectedEnterpriseValueImpact: 630000,
      effort: "medium",
      timeframe: "90 days",
      diagnosis: "5,000 agreements at 82% renewal = 900 lost annually. Each lost agreement = $240/year recurring revenue. Plus 3x higher lifetime value from members.",
      prescription: "Implement automated renewal reminders 60/30/15 days before expiration. Add technician incentives for membership renewals during service calls. Offer loyalty pricing for auto-renew customers.",
    },
  ],
  summary: "By executing the top 5 priorities, companyA can increase enterprise value from $0.9M to $4.9M - a $4.0M value creation opportunity.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  (await params);
  return NextResponse.json(demoGrowthPlan);
}
