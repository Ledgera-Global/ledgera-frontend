import type {
  InterventionAttribution,
  InterventionListResponse,
} from "@/lib/types/interventions";

/**
 * Preview fixtures.
 *
 * These exist only so an unauthenticated visitor can see what the screen does.
 * They are served with X-Ledgera-Data-Source: demo, and an authenticated caller
 * never receives them — the proxy returns a loud 502 instead, because showing a
 * signed-in owner a fabricated profit bridge is worse than showing an error.
 *
 * Both fixtures are internally consistent: the four bridge components sum
 * exactly to the gross profit change, and each window's revenue minus labour
 * minus materials equals its stated gross profit. A fixture that does not add up
 * teaches the reader to distrust the real one.
 */

export const INTERVENTIONS_DEMO_LIST: InterventionListResponse = {
  companyId: "companyA",
  interventions: [
    {
      id: "intv-probook-dispatch",
      providerId: "probook",
      providerName: "Probook",
      label: "Dispatch copilot — Phoenix metro",
      activatedAt: "2026-03-01T00:00:00.000Z",
      treatmentEnd: "2026-04-30T00:00:00.000Z",
      monthlyVendorCostCents: 500_000,
      hasControl: true,
    },
    {
      id: "intv-firma-contracts",
      providerId: "firma",
      providerName: "Firma",
      label: "E-signature rollout on service agreements",
      activatedAt: "2026-04-06T00:00:00.000Z",
      treatmentEnd: null,
      monthlyVendorCostCents: 500_000,
      hasControl: false,
    },
  ],
};

const PROBOOK_ATTRIBUTION: InterventionAttribution = {
  companyId: "companyA",
  providerId: "probook",
  label: "Dispatch copilot — Phoenix metro",
  evaluatedAt: "2026-05-01T12:00:00.000Z",
  grade: "supported",
  baseline: {
    startIso: "2026-01-01T00:00:00.000Z",
    endIso: "2026-02-28T00:00:00.000Z",
    days: 58,
    completedJobs: 400,
    revenueCents: 50_000_000,
    laborCostCents: 20_000_000,
    materialCostCents: 8_000_000,
    grossProfitCents: 22_000_000,
  },
  treatment: {
    startIso: "2026-03-01T00:00:00.000Z",
    endIso: "2026-04-30T00:00:00.000Z",
    days: 60,
    completedJobs: 420,
    revenueCents: 59_200_000,
    laborCostCents: 22_800_000,
    materialCostCents: 9_237_100,
    grossProfitCents: 27_162_900,
  },
  control: {
    baseline: {
      startIso: "2026-01-01T00:00:00.000Z",
      endIso: "2026-02-28T00:00:00.000Z",
      days: 58,
      completedJobs: 300,
      revenueCents: 36_000_000,
      laborCostCents: 14_400_000,
      materialCostCents: 5_600_000,
      grossProfitCents: 16_000_000,
    },
    treatment: {
      startIso: "2026-03-01T00:00:00.000Z",
      endIso: "2026-04-30T00:00:00.000Z",
      days: 60,
      completedJobs: 305,
      revenueCents: 36_900_000,
      laborCostCents: 14_700_000,
      materialCostCents: 5_730_000,
      grossProfitCents: 16_470_000,
    },
  },
  grossProfit: {
    preGrossProfitCents: 22_000_000,
    postGrossProfitCents: 27_162_900,
    changeCents: 5_162_900,
    changePct: 23.5,
    components: [
      {
        key: "volume",
        label: "More jobs",
        amountCents: 1_100_000,
        interpretation:
          "20 extra completed jobs at the old ticket and old margin, so the volume itself is worth this much and no more",
      },
      {
        key: "price",
        label: "Higher ticket",
        amountCents: 2_772_000,
        interpretation:
          "Average ticket rose $150 on the new volume, the largest single driver and the one most likely to have another cause",
      },
      {
        key: "margin",
        label: "Better margin rate",
        amountCents: 1_008_000,
        interpretation:
          "Gross margin rate improved 1.7 points, consistent with fewer dispatch errors and less rework",
      },
      {
        key: "interaction",
        label: "Volume and ticket together",
        amountCents: 282_900,
        interpretation:
          "The part of the change that only exists because volume and ticket moved at the same time",
      },
    ],
    reconciles: true,
  },
  ebitda: {
    grossProfitChangeCents: 5_162_900,
    dispatcherCostChangeCents: 1_400_000,
    vendorCostCents: -1_000_000,
    netEbitdaEffectCents: 5_562_900,
    annualisedNetEffectCents: 33_286_200,
    verdict:
      "Net EBITDA rose by $55,629 across the measured window and the vendor was paid $10,000 for it. Annualised, that is $332,862 against $60,000 a year.",
  },
  caveats: [
    {
      code: "dispatcher_cost_self_reported",
      message:
        "The dispatcher saving is owner-reported. Nothing in the connected systems proves the hours came out, so it is carried as a declared input rather than a measured one.",
    },
    {
      code: "ticket_drift",
      message:
        "Most of the gross profit change came from ticket and margin rate rather than job count. A pricing change in the same period would produce the same shape, and the control branch does not rule that out.",
    },
  ],
  headline:
    "Against an untreated comparison, this moved gross profit further than the comparison did. Probook: gross profit went from $220,000 to $271,629 (+$51,629, +23.5%), across 400 jobs before and 420 after. The largest single driver was higher ticket (+$27,720). Net EBITDA rose by $55,629 across the measured window and the vendor was paid $10,000 for it. This is still observational: it rules out a company-wide trend, not every other explanation.",
};
const FIRMA_ATTRIBUTION: InterventionAttribution = {
  companyId: "companyA",
  providerId: "firma",
  label: "E-signature rollout on service agreements",
  evaluatedAt: "2026-05-01T12:00:00.000Z",
  grade: "not_enough_data",
  baseline: {
    startIso: "2026-01-06T00:00:00.000Z",
    endIso: "2026-03-05T00:00:00.000Z",
    days: 58,
    completedJobs: 41,
    revenueCents: 5_200_000,
    laborCostCents: 2_020_000,
    materialCostCents: 1_192_000,
    grossProfitCents: 1_988_000,
  },
  treatment: {
    startIso: "2026-04-06T00:00:00.000Z",
    endIso: "2026-05-01T00:00:00.000Z",
    days: 25,
    completedJobs: 18,
    revenueCents: 2_480_000,
    laborCostCents: 963_000,
    materialCostCents: 300_600,
    grossProfitCents: 1_216_400,
  },
  control: null,
  grossProfit: {
    preGrossProfitCents: 1_988_000,
    postGrossProfitCents: 1_216_400,
    changeCents: -771_600,
    changePct: -38.8,
    components: [
      {
        key: "volume",
        label: "Fewer jobs",
        amountCents: -1_115_200,
        interpretation:
          "23 fewer completed jobs at the old ticket and old margin, which is the whole of the decline",
      },
      {
        key: "price",
        label: "Higher ticket",
        amountCents: 75_340,
        interpretation:
          "Ticket was higher, but it is measured across 18 jobs, so a single large job moves it",
      },
      {
        key: "margin",
        label: "Better margin rate",
        amountCents: 268_340,
        interpretation:
          "Margin rate rose 10.8 points on 18 jobs, which is more likely to be job mix than a signature tool",
      },
      {
        key: "interaction",
        label: "Offsetting effects",
        amountCents: -80,
        interpretation:
          "The remaining cross-term, immaterial at this job count",
      },
    ],
    reconciles: true,
  },
  ebitda: {
    grossProfitChangeCents: -771_600,
    dispatcherCostChangeCents: 0,
    vendorCostCents: -433_300,
    netEbitdaEffectCents: -1_204_900,
    annualisedNetEffectCents: -17_591_540,
    verdict:
      "Net EBITDA fell by $12,049 across the measured window, against $4,333 paid to the vendor over the same span. At 18 completed jobs that is not a result in either direction.",
  },
  caveats: [
    {
      code: "insufficient_jobs",
      message:
        "18 completed jobs in the treated window is below the 20-job floor. A single large job moves every ratio on this page.",
    },
    {
      code: "short_treatment_window",
      message:
        "The treated window is 25 days. Adoption and learning effects still dominate it, so any movement is more likely to be the rollout than the tool.",
    },
    {
      code: "no_control",
      message:
        "No untreated comparison branch was recorded. Without one, a company-wide trend and this vendor are indistinguishable.",
    },
  ],
  headline:
    "There is not yet enough completed work in these windows to say whether this changed anything. Firma: gross profit went from $19,880 to $12,164 (-$7,716, -38.8%), across 41 jobs before and 18 after. Net EBITDA fell by $12,049 across the measured window, against $4,333 paid to the vendor over the same span. No conclusion is offered until each window carries enough work to compare.",
};

const ATTRIBUTION_BY_ID: Record<string, InterventionAttribution> = {
  "intv-probook-dispatch": PROBOOK_ATTRIBUTION,
  "intv-firma-contracts": FIRMA_ATTRIBUTION,
};

/**
 * The attribution a preview shows for a given intervention.
 *
 * Returns null when this id has no fixture. It must not fall back to another
 * intervention's bridge: the request names one intervention, and answering with
 * a different one's profit numbers is a fabricated identity binding even under
 * a demo header. A preview that asks about an id it does not have gets a 404.
 */
export function demoAttributionFor(interventionId: string): InterventionAttribution | null {
  return ATTRIBUTION_BY_ID[interventionId] ?? null;
}
