import { NextRequest, NextResponse } from "next/server";
import { handleApiMutation } from "@/lib/backendProxy";

const demoData = {
  companyId: "companyA",
  question: "",
  answer:
    "Based on your demo data: real cash flow is positive and stress is MODERATE (42/100). " +
    "You have room to evaluate a new technician, but I'd first confirm utilization is above 75% " +
    "and that payroll coverage stays above 1.5x after the hire.",
  grounded: false,
  generatedAt: new Date().toISOString(),
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const p = await params;

  let body: { question?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }

  if (!body.question?.trim()) {
    return NextResponse.json(
      { error: "question is required" },
      { status: 400 }
    );
  }

  // We need a custom handler since handleApiMutation doesn't pass a body to demo data.
  // Use the standard mutation path; the demoData is replaced at runtime by the backend
  // when JWT_SECRET is configured. When not configured, return the demo answer
  // rewritten with the actual question.
  const withQuestion = {
    ...demoData,
    companyId: p.companyId,
    question: body.question.trim(),
  };

  const fallback = () => NextResponse.json(withQuestion);

  // If JWT_SECRET is not set, we can't reach a real backend - return demo data directly.
  if (!process.env.JWT_SECRET) {
    return fallback();
  }

  // Proxy the request to the real backend. If the backend is unreachable
  // (502/timeout surfaces as 500 from handleApiMutation), fall back to the
  // demo answer so the AI Business Advisor never dead-ends for the owner.
  const result = await handleApiMutation(
    req,
    p,
    `/advisor/${p.companyId}`,
    "POST"
  );

  if (result.status === 500) {
    return fallback();
  }

  return result;
}
