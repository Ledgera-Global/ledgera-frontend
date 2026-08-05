import { NextRequest } from "next/server";
import { handleApiGet } from "@/lib/backendProxy";

const demoData = {
  recommendations: [
    {
      type: "PRICING", priority: 1,
      title: "Raise diagnostic fee by $15",
      detail: "Your diagnostic fee of $79 is below the $94 market average in your region.",
      action: "Increase diagnostic fee to $94 effective next month.",
      estimatedImpact: "$45K annual EBITDA increase",
    },
    {
      type: "MAINTENANCE", priority: 2,
      title: "Increase maintenance agreement renewal outreach",
      detail: "Renewal rate at 82% vs 90% target. 900 agreements expire next quarter.",
      action: "Launch automated reminder campaign 60/30/15 days before expiration.",
      estimatedImpact: "$90K annual EBITDA",
    },
    {
      type: "EFFICIENCY", priority: 3,
      title: "Reduce overtime on weekends",
      detail: "Weekend overtime labor cost $12K over budget last month.",
      action: "Reschedule non-urgent weekday work. Cap weekend OT at 2 techs.",
      estimatedImpact: "$8K/month savings",
    },
    {
      type: "COLLECTIONS", priority: 4,
      title: "Escalate AR collections on 60+ day invoices",
      detail: "$11K in AR is 61-90 days past due. 5 invoices at risk.",
      action: "Send final notice to 5 clients. Place on credit hold pending payment.",
      estimatedImpact: "$11K cash recovery",
    },
    {
      type: "CAPACITY", priority: 5,
      title: "Delay hiring until collections improve",
      detail: "Cash runway at 3.2 months. New hire would reduce to 2.1 months.",
      action: "Hold open req until AR over 45 days drops below $15K.",
      estimatedImpact: "Preserves $8K/month cash burn",
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;
  return handleApiGet(req, p, `/executive-recommendations/${p.companyId}`, demoData);
}
