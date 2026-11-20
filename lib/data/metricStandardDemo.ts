import type { MetricPolicyResponse } from "@/lib/types/metricStandard";

/**
 * The published metric standard, bundled.
 *
 * This is a copy of the LMS-2026.1 policy the backend serves, not an invented
 * one: identical definitions, formulas, refusal rules and citations. It exists
 * so the screen still explains the standard to a visitor who is not signed in.
 *
 * The policy itself is public on the backend (`GET /metric-standard/policy`
 * needs no session), so showing it is not a disclosure. What a visitor does NOT
 * get is a sealed figure: every quoted value belongs to a company, and
 * borrowing a seeded company's numbers for the preview would present fabricated
 * financials as a worked example. The figure panel says "sign in to read the
 * quote" rather than inventing one.
 *
 * If the backend's policy changes, this copy goes stale - which is why it names
 * itself as a copy in `storage` instead of claiming to describe a live store.
 */
export const METRIC_POLICY_DEMO: MetricPolicyResponse = {
  policy: [
    {
      definition: {
        id: "normalized_ebitda",
        label: "Normalized EBITDA",
        version: "2026.1",
        unit: "usd",
        question:
          "What does this company earn in a year, on a basis an acquirer would accept?",
        formula:
          "reportedOperatingEarnings + sum(measured adjustments), each adjustment carrying its own basis; unmeasured adjustments contribute nothing",
        requiredInputs: ["reportedOperatingEarnings", "totalAdjustment"],
        refusalRule: "when-not-positive",
        earningsBasis: "z",
      },
      citation: "LMS-2026.1#normalized_ebitda",
    },
    {
      definition: {
        id: "enterprise_value",
        label: "Enterprise Value (entry)",
        version: "2026.1",
        unit: "usd",
        question: "What is this company worth today, at a defensible multiple?",
        formula:
          "normalizedEbitda x entryMultiple, with entryMultiple bounded by the model floor and ceiling in force at the time of the quote",
        requiredInputs: [
          "normalizedEbitda",
          "entryMultiple",
          "multipleFloor",
          "multipleCeiling",
        ],
        refusalRule: "when-not-positive",
        earningsBasis: "z",
      },
      citation: "LMS-2026.1#enterprise_value",
    },
    {
      definition: {
        id: "gross_margin",
        label: "Gross Margin",
        version: "2026.1",
        unit: "ratio",
        question:
          "How much of each revenue dollar survives the cost of delivering it?",
        formula: "(revenue - directCost) / revenue",
        requiredInputs: ["revenue", "directCost"],
        refusalRule: "when-not-positive",
        earningsBasis: null,
      },
      citation: "LMS-2026.1#gross_margin",
    },
    {
      definition: {
        id: "revenue",
        label: "Revenue",
        version: "2026.1",
        unit: "usd",
        question: "What did the company collect in the period?",
        formula: "sum of settled job cash in the period",
        requiredInputs: ["settledCash"],
        refusalRule: "never",
        earningsBasis: "z",
      },
      citation: "LMS-2026.1#revenue",
    },
    {
      definition: {
        id: "exit_readiness_score",
        label: "Exit Readiness Score",
        version: "2026.1",
        unit: "score",
        question: "How close is this company to being able to transact?",
        formula:
          "weighted mean of the readiness dimensions in force for this version; each dimension scored 0-100 and weighted per readinessDimensions",
        requiredInputs: ["dimensionScores"],
        refusalRule: "never",
        earningsBasis: null,
      },
      citation: "LMS-2026.1#exit_readiness_score",
    },
  ],
  storage: "this bundled copy of LMS-2026.1",
};
