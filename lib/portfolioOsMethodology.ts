import type { PortfolioHealth } from "@/lib/types/portfolioOs";

/**
 * Portfolio OS methodology, as published.
 *
 * This module is the single written record of the rules behind every number on
 * the Portfolio OS screens. It exists because the screens are read by people who
 * make capital decisions from them, and a figure whose derivation is only
 * visible in backend source is a figure that has to be taken on trust.
 *
 * The rules below are mirrored from the backend engines that implement them
 * (portfolioIntelligenceEngine, portfolioComparison, portfolioCapitalAllocation).
 * Where the backend also returns a value on the response - the EV multiple and
 * the band note on the capital-allocation payload - the screens render the value
 * from the API rather than the constant here, so a change on the backend shows
 * up in the product on the next request instead of waiting for a redeploy here.
 */

export type MetricUnit = "usd" | "percent" | "count";

export interface MetricDefinition {
  key: string;
  label: string;
  unit: MetricUnit;
  basis: string;
}

/**
 * The measured quantities, in the order a reader meets them: size, then the
 * margin that decides whether the size is worth anything, then dollars.
 */
export const PORTFOLIO_METRICS: readonly MetricDefinition[] = [
  {
    key: "revenue",
    label: "Revenue",
    unit: "usd",
    basis: "Invoiced work in the analyzed window.",
  },
  {
    key: "grossProfit",
    label: "Gross Profit",
    unit: "usd",
    basis: "Revenue less labor and material cost.",
  },
  {
    key: "grossMarginPct",
    label: "Gross Margin",
    unit: "percent",
    basis: "Gross profit over revenue.",
  },
  {
    key: "ebitda",
    label: "EBITDA",
    unit: "usd",
    basis:
      "Operating earnings before interest, tax, depreciation and amortization.",
  },
  {
    key: "ebitdaMarginPct",
    label: "EBITDA Margin",
    unit: "percent",
    basis:
      "EBITDA over revenue. The ranking column: the only figure comparable across companies of different size.",
  },
  {
    key: "jobsAnalyzed",
    label: "Jobs Analyzed",
    unit: "count",
    basis:
      "Completed jobs the figures were computed from. A thin count weakens every other column.",
  },
];

export interface HealthBandRule {
  band: PortfolioHealth;
  rule: string;
  meaning: string;
}

/**
 * The health band is a portfolio-relative verdict, not an absolute score. It is
 * stated here with its exact rule so "underperforming" cannot be read as a
 * judgement the engine never made: a company can be profitable and still sit in
 * that band, because the band measures distance from this portfolio's median.
 */
export const HEALTH_BAND_RULES: readonly HealthBandRule[] = [
  {
    band: "strong",
    rule: "Ranks in the top third by EBITDA margin among companies with measured data. For n companies with data, that is rank 1 to ceil(n / 3).",
    meaning:
      "The best margins in this portfolio. Relative to these peers, not to any external standard.",
  },
  {
    band: "watch",
    rule: "Has measured data, is not in the top third by margin, and its EBITDA margin is at most 5 points below the portfolio median.",
    meaning:
      "Within normal spread of the portfolio. No margin gap large enough to single out.",
  },
  {
    band: "underperforming",
    rule: "Has measured data, is not in the top third by margin, and its EBITDA margin is more than 5 points below the portfolio median.",
    meaning:
      "A margin gap wide enough to matter. This is the band that generates capital-allocation targets.",
  },
  {
    band: "no_data",
    rule: "No completed jobs in the analyzed window, so no figure can be computed.",
    meaning:
      "Absence of measurement, not a measurement of zero. Excluded from every median and from every ranking, and shown as blank rather than as zero.",
  },
];

export interface MethodStatement {
  title: string;
  body: string;
}

/** How companies are ordered on each screen, and why. */
export const RANKING_RULES: readonly MethodStatement[] = [
  {
    title: "Companies are ranked by EBITDA margin",
    body: "The companies table and the comparison matrix both rank on EBITDA margin, highest first. It is the only figure comparable across companies of different size: ranking on revenue would simply reproduce the acquisition list in descending order, and ranking on absolute EBITDA would reward scale rather than performance.",
  },
  {
    title: "Margin rank counts only companies with data",
    body: "A company with no measured data holds no rank. It is listed after the ranked companies rather than dropped, so a company that has never synced is visibly present and visibly unranked instead of quietly absent.",
  },
  {
    title: "Gap to median is stated in dollars as well as points",
    body: "For each company the engine states how far its EBITDA margin sits from the portfolio median, in percentage points, and what that gap is worth in annual EBITDA against its own revenue. The point figure shows the size of the problem; the dollar figure shows whether it is worth acting on.",
  },
  {
    title: "Top issue is diagnosed from a ranked rule, not generated prose",
    body: "The top issue is selected by the first rule that matches: a gross margin below 40 percent, which is the service-industry floor, is reported as a pricing or material cost problem; otherwise a positive gap to the portfolio median is reported with its dollar value; otherwise there is no issue to report and the field is empty.",
  },
];

/**
 * The published constants of the capital-allocation view.
 *
 * These mirror EV_MULTIPLE, EV_BAND_LOW and EV_BAND_HIGH in the backend capital
 * allocation engine. The backend deliberately repeats them rather than importing
 * them across a boundary, and returns them on every payload, so the screens
 * quote the API's values and these constants only describe the published band.
 */
export const EV_MULTIPLE = 6;
export const EV_BAND_LOW = 0.75;
export const EV_BAND_HIGH = 1.25;

/** How a dollar figure of opportunity is derived, and what it is not. */
export const CAPITAL_ALLOCATION_RULES: readonly MethodStatement[] = [
  {
    title: "The portfolio median margin is the benchmark",
    body: "The engine takes the median EBITDA margin across every company with measured data. Median rather than mean, so one very large or very small company cannot move the benchmark every other company is judged against.",
  },
  {
    title: "Opportunity is the margin gap applied to that company's own revenue",
    body: "For a company below the median, the gap in percentage points is applied to its own revenue to give an annual EBITDA figure. A company 3 points below the median on 40m of revenue is a larger prize than one 12 points below on 2m, and the ranking reflects that: targets are ordered by absolute dollar opportunity, not by margin gap.",
  },
  {
    title: "Opportunity is valued at the same 6x multiple as the rest of the product",
    body: `Annual EBITDA opportunity is converted to enterprise value at ${EV_MULTIPLE}x, with a band of ${EV_MULTIPLE * EV_BAND_LOW}x to ${EV_MULTIPLE * EV_BAND_HIGH}x. The band is expressed on the payload as ${EV_BAND_LOW} to ${EV_BAND_HIGH} of the mid case. The same multiple is used everywhere else in the product, so a figure here can be compared with an enterprise value on any other screen.`,
  },
  {
    title: "A company at or above the median produces no target",
    body: "There is no margin gap to close, so the company contributes nothing to the ranking and its opportunity is zero rather than negative. Zero opportunity is a real result here and is not confused with unmeasured: an unmeasured company is listed separately with its reason.",
  },
  {
    title: "Share of opportunity is each target's portion of the total",
    body: "Each target's mid-case opportunity is divided by the portfolio total, giving the fraction of the whole that rests on that one company. It is a share of the identified gap, not of any budget.",
  },
];

/**
 * The limits of the capital-allocation view, stated on the screen itself. These
 * are the sentences that stop an opportunity figure being read as a forecast:
 * without them, a dollar value next to a company name reads as an expected
 * return.
 */
export const WHAT_IS_NOT_CLAIMED: readonly string[] = [
  "The opportunity figure is the size of the margin gap. It is not a forecast that the gap can be closed.",
  "No timeline is implied. Closing a margin gap is an operational project, not a transfer of money.",
  "No probability of success is attached. The figure is a range of outcomes at a stated multiple, not a weighted expectation.",
  "The cost of the operational work required to close the gap is not deducted. The figure is gross opportunity.",
  "The band around the mid case is a valuation band, not a confidence interval around a prediction.",
  "An unmeasured company is not an opportunity of zero. It is a company whose opportunity cannot be sized yet.",
];

/** The rule that governs missing figures on every Portfolio OS screen. */
export const DATA_COMPLETENESS_RULES: readonly string[] = [
  "A figure that could not be computed is shown as Not measured. It is never shown as zero and never as a bare dash.",
  "Companies without measured data are excluded from every median, so a company that has never synced cannot pull a portfolio benchmark toward zero.",
  "Companies without measured data hold no rank, so a rank always belongs to a company that reported the figure being ranked.",
  "Every column of the comparison matrix states its own basis, so no number on the screen is ever presented without the definition it was measured against.",
  "Comparison is computed from the same per-company report the company's own page is built from, so a figure in the matrix cannot disagree with that company's dashboard.",
];

/** The authorization model, in the terms the screens enforce it. */
export const ACCESS_MODEL: readonly string[] = [
  "Every portfolio request is checked against the caller's membership of that portfolio. A viewer reads, an operator acts inside a company, a GP manages the portfolio itself.",
  "Portfolio access is checked per portfolio on every request, so a token that is valid for one portfolio grants nothing on another.",
];
