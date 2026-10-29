import type { AssuranceCaseListResponse } from "@/lib/types/assuranceCases";

/**
 * The worked example shown to visitors who are not signed in.
 *
 * Three cases, chosen to demonstrate the three ways a case leaves the list and
 * the one way it refuses to: one open, one recovered after a collection, one
 * written off. Every figure is invented, and the proxy labels the response
 * `demo` so no page can present these as a customer's own control failures.
 */

const NOW = "2026-10-27T14:00:00.000Z";

export const ASSURANCE_CASES_DEMO: AssuranceCaseListResponse = {
  companyId: "companyA",
  evaluatedAt: NOW,
  count: 3,
  openAtStakeCents: 268_400,
  cases: [
    {
      id: "case_demo_1",
      findingId: "invoice_unpaid_after_completion:job_1041:inv_7741:",
      kind: "invoice_unpaid_after_completion",
      severity: "high",
      amountCents: 168_400,
      jobId: "job_1041",
      invoiceId: "inv_7741",
      paymentId: null,
      title: "Completed work never invoiced to the customer",
      detail:
        "Job 1041 was closed as complete on 12 September and no invoice exists for it. Billed revenue for the period is short by the job's contract value.",
      recommendedAction:
        "Raise the invoice against job 1041 today. Work completed nine weeks ago is at the edge of the customer's patience and of the lien window.",
      status: "open",
      ownerUserId: null,
      dueAt: "2026-10-31T00:00:00.000Z",
      recoveredCents: 0,
      resolutionNote: null,
      resolvedAt: null,
      linkedInterventionId: null,
      firstSeenAt: "2026-09-14T09:00:00.000Z",
      lastSeenAt: NOW,
      detectionCount: 43,
      needsAttention: true,
      daysOpen: 43,
      ageLabel: "Open for 43 days",
    },
    {
      id: "case_demo_2",
      findingId: "payment_unapplied:job_1033:inv_7690:pay_5512",
      kind: "payment_unapplied",
      severity: "medium",
      amountCents: 100_000,
      jobId: "job_1033",
      invoiceId: "inv_7690",
      paymentId: "pay_5512",
      title: "Payment received but never applied to the invoice",
      detail:
        "A card payment of $1,000.00 settled on 3 October and is still unapplied, so the invoice reads as overdue and the customer is being chased for money already received.",
      recommendedAction:
        "Apply the payment to invoice 7690. Continuing to dun a customer who has already paid is the fastest way to lose them.",
      status: "recovered",
      ownerUserId: "user_maria",
      dueAt: null,
      recoveredCents: 100_000,
      resolutionNote:
        "Payment 5512 applied to invoice 7690 on 8 October. Dunning sequence stopped the same day.",
      resolvedAt: "2026-10-08T16:20:00.000Z",
      linkedInterventionId: null,
      firstSeenAt: "2026-10-04T09:00:00.000Z",
      lastSeenAt: "2026-10-07T09:00:00.000Z",
      detectionCount: 4,
      needsAttention: false,
      daysOpen: 4,
      ageLabel: "Open for 4 days",
    },
    {
      id: "case_demo_3",
      findingId: "invoice_underbilled:job_1019:inv_7602:",
      kind: "invoice_underbilled",
      severity: "low",
      amountCents: 42_300,
      jobId: "job_1019",
      invoiceId: "inv_7602",
      paymentId: null,
      title: "Invoice billed below the quoted price",
      detail:
        "Invoice 7602 was billed at $1,180.00 against a quoted $1,603.00. No change order explains the difference.",
      recommendedAction:
        "Confirm whether a discount was authorised. If not, rebill the difference.",
      status: "written_off",
      ownerUserId: "user_dan",
      dueAt: null,
      recoveredCents: 0,
      resolutionNote:
        "Owner confirmed a verbal discount was given at the site visit. No rebill; written off with the price book left unchanged.",
      resolvedAt: "2026-10-15T11:05:00.000Z",
      linkedInterventionId: null,
      firstSeenAt: "2026-09-29T09:00:00.000Z",
      lastSeenAt: "2026-10-14T09:00:00.000Z",
      detectionCount: 15,
      needsAttention: false,
      daysOpen: 15,
      ageLabel: "Open for 15 days",
    },
  ],
};
