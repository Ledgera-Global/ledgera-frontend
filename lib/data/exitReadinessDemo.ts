import type { ExitReadiness } from "@/lib/types/exitReadiness";

/**
 * Exit readiness demo fixture.
 *
 * Served only to unauthenticated previews. Every number reconciles with the
 * valuation model by hand: a $1M earnings base, the Lower Mid-Market base
 * multiple of 4.5x, and -2.30 points of driver adjustments give 2.20x today.
 * Closing the six measured gaps is worth 5.70 points, which lands at 7.90x.
 *
 * The score is 46 across all ten dimensions, which grades "needs_work": the
 * earnings are solid, but owner dependency and customer concentration would be
 * priced against the seller in diligence.
 */
export const EXIT_READINESS_DEMO: ExitReadiness = {
  companyId: "demo",
  generatedAt: "2026-09-25T00:00:00.000Z",

  score: 46,
  scoreBasis: {
    dimensionsMeasured: 10,
    dimensionsTotal: 10,
    coverage: 1,
    note: "10 of 10 readiness dimensions could be measured from connected data. Unmeasured dimensions are excluded from the score rather than counted as failures.",
  },
  grade: "needs_work",
  headline:
    "A deal is possible, but several gaps would be priced against the owner. Fixing them is worth more than negotiating them.",

  dimensions: [
    {
      key: "earnings_base",
      label: "Positive Operating Earnings",
      state: "ready",
      score: 100,
      weight: 4,
      observed: "Operating earnings of $1,000,000 support a multiple-based value.",
      exitStandard: "At least one full year of positive, collected operating earnings.",
      whyItMatters:
        "Every acquisition is priced off earnings. Without positive earnings there is no value to apply a multiple to, regardless of how good the other numbers look.",
    },
    {
      key: "earnings_verifiability",
      label: "Earnings Can Be Verified",
      state: "watch",
      score: 75,
      weight: 3,
      observed:
        "1 reconciliation problem would be raised in diligence: Job records carry a labour cost and payroll records also exist for this period. If they describe the same wages, labour is counted twice and earnings are understated.",
      exitStandard: "Books that reconcile, with labour and payroll not double-counted.",
      whyItMatters:
        "An acquirer re-cuts earnings during quality of earnings. Anything that does not hold up is discounted, and double-counted labour is the most common way a small contractor's earnings shrinks in diligence.",
    },
    {
      key: "growth",
      label: "Revenue Growth (YoY)",
      state: "watch",
      score: 55,
      weight: 2,
      observed: "0.0% (Revenue roughly flat year over year)",
      exitStandard:
        "Grow revenue more than 15% year over year to reach the top growth band.",
      whyItMatters: "This driver moves the multiple by +0.00 points today.",
    },
    {
      key: "margin_level",
      label: "Gross Margin",
      state: "watch",
      score: 55,
      weight: 2,
      observed: "30.0% (Gross margin 25-35% is near the low end of the range)",
      exitStandard:
        "Raise gross margin above 45% through pricing or job-cost discipline.",
      whyItMatters: "This driver moves the multiple by +0.00 points today.",
    },
    {
      key: "margin_stability",
      label: "Margin Stability",
      state: "gap",
      score: 0,
      weight: 2,
      observed:
        "8.0 pt std dev (Monthly margin varies more than 5 points, so earnings are volatile)",
      exitStandard:
        "Hold monthly gross margin within 2 points to reach the top stability band.",
      whyItMatters: "This driver moves the multiple by -0.50 points today.",
    },
    {
      key: "recurring_revenue",
      label: "Recurring Revenue",
      state: "gap",
      score: 0,
      weight: 3,
      observed: "3.0% (Almost no recurring revenue)",
      exitStandard:
        "Build recurring service agreements past 30% of revenue, which is the single largest multiple lever.",
      whyItMatters: "This driver moves the multiple by +0.00 points today.",
    },
    {
      key: "customer_concentration",
      label: "Customer Concentration",
      state: "gap",
      score: 0,
      weight: 3,
      observed:
        "25.0% (A single customer exceeds 20% of revenue, so a concentration discount applies)",
      exitStandard: "Reduce reliance on any single customer below 10% of revenue.",
      whyItMatters: "This driver moves the multiple by -0.80 points today.",
    },
    {
      key: "owner_dependency",
      label: "Owner Dependency",
      state: "gap",
      score: 0,
      weight: 4,
      observed:
        "High (Owner is the business, so key relationships and approvals depend on them)",
      exitStandard:
        "Delegating customer relationships and approvals is worth roughly 1.5 multiple points.",
      whyItMatters: "This driver moves the multiple by -1.00 points today.",
    },
    {
      key: "cash_collection",
      label: "Invoiced Work Is Collected",
      state: "ready",
      score: 100,
      weight: 2,
      observed:
        "0.2% of collected revenue is invoiced work that was never paid.",
      exitStandard: "Under 1% of invoiced work never collected.",
      whyItMatters:
        "A buyer nets uncollected invoices straight off the price, and treats a weak collection habit as evidence the reported revenue is soft.",
    },
    {
      key: "records_completeness",
      label: "Records Support the Valuation",
      state: "ready",
      score: 100,
      weight: 2,
      observed:
        "6 of 6 valuation drivers can be measured from connected data.",
      exitStandard:
        "All drivers measurable without asking the owner for spreadsheets.",
      whyItMatters:
        "Every driver a buyer cannot verify from system data becomes an assumption they make conservatively, which lowers the offer rather than the reported earnings.",
    },
  ],

  valueOnTheTable: {
    earningsAmount: 1_000_000,
    currentMultiple: 2.2,
    multipleIfGapsClosed: 7.9,
    valueToday: 2_200_000,
    valueIfGapsClosed: 7_900_000,
    capturableUplift: 5_700_000,
    unpricedDrivers: [],
    note: "Closing the 6 priced gaps would move the multiple from 2.20x to 7.90x, adding about $5,700,000 at today's earnings. This is what the gaps are worth, not a forecast of the sale price.",
  },

  actions: [
    {
      driver: "owner_dependency",
      label: "Owner Dependency",
      currentDisplay: "High",
      targetDisplay:
        "Delegating customer relationships and approvals is worth roughly 1.5 multiple points. Worth +0.50 multiple points at the top band.",
      multipleUplift: 1.5,
      valueUplift: 1_500_000,
      whatToDo:
        "Delegating customer relationships and approvals is worth roughly 1.5 multiple points.",
      rationale:
        "Owner is the business, so key relationships and approvals depend on them",
    },
    {
      driver: "customer_concentration",
      label: "Customer Concentration",
      currentDisplay: "25.0%",
      targetDisplay:
        "Reduce reliance on any single customer below 10% of revenue. Worth +0.30 multiple points at the top band.",
      multipleUplift: 1.1,
      valueUplift: 1_100_000,
      whatToDo: "Reduce reliance on any single customer below 10% of revenue.",
      rationale:
        "A single customer exceeds 20% of revenue, so a concentration discount applies",
    },
    {
      driver: "recurring_revenue",
      label: "Recurring Revenue",
      currentDisplay: "3.0%",
      targetDisplay:
        "Build recurring service agreements past 30% of revenue, which is the single largest multiple lever. Worth +1.00 multiple points at the top band.",
      multipleUplift: 1,
      valueUplift: 1_000_000,
      whatToDo:
        "Build recurring service agreements past 30% of revenue, which is the single largest multiple lever.",
      rationale: "Almost no recurring revenue",
    },
    {
      driver: "margin_stability",
      label: "Margin Stability",
      currentDisplay: "8.0 pt std dev",
      targetDisplay:
        "Hold monthly gross margin within 2 points to reach the top stability band. Worth +0.35 multiple points at the top band.",
      multipleUplift: 0.85,
      valueUplift: 850_000,
      whatToDo:
        "Hold monthly gross margin within 2 points to reach the top stability band.",
      rationale:
        "Monthly margin varies more than 5 points, so earnings are volatile",
    },
    {
      driver: "growth",
      label: "Revenue Growth (YoY)",
      currentDisplay: "0.0%",
      targetDisplay:
        "Grow revenue more than 15% year over year to reach the top growth band. Worth +0.75 multiple points at the top band.",
      multipleUplift: 0.75,
      valueUplift: 750_000,
      whatToDo:
        "Grow revenue more than 15% year over year to reach the top growth band.",
      rationale: "Revenue roughly flat year over year",
    },
    {
      driver: "margin_level",
      label: "Gross Margin",
      currentDisplay: "30.0%",
      targetDisplay:
        "Raise gross margin above 45% through pricing or job-cost discipline. Worth +0.50 multiple points at the top band.",
      multipleUplift: 0.5,
      valueUplift: 500_000,
      whatToDo:
        "Raise gross margin above 45% through pricing or job-cost discipline.",
      rationale: "Gross margin 25-35% is near the low end of the range",
    },
  ],

  diligenceFindings: [
    "Job records carry a labour cost and payroll records also exist for this period. If they describe the same wages, labour is counted twice and earnings are understated.",
    "Invoiced work that was never collected totals $25,000. A buyer nets this straight off the purchase price and will ask how much of it is still collectible.",
  ],

  methodology: [
    "Readiness is scored 0-100 across the dimensions a buyer actually tests in diligence, weighted by how much each moves a sale price for a home-services business.",
    "Every driver score is derived from the same band tables used to price the multiple, so the readiness view and the valuation view cannot disagree.",
    "Dollar figures are the valuation model's own earnings multiplied by the multiple points a gap is worth. They are what the gaps cost at today's earnings, not a forecast of the sale price.",
    "Dimensions that cannot be measured from connected data are reported and excluded from the score. They are never counted as zero, and they are never estimated.",
    "Below half the dimensions measured, no grade is issued at all.",
  ],
};
