import type { CoverageState, DataLayer } from "@/lib/types/networkCoverage";

/**
 * Presentation for the data-network coverage screen.
 *
 * The layer labels describe economic function, not vendor category. An owner
 * does not care that "payments" is connected; they care that money movement is
 * visible. Naming the layer by what it proves is what makes a coverage gap
 * legible as a decision rather than an integration checklist.
 */

export const LAYER_LABEL: Record<DataLayer, string> = {
  demand: "Demand",
  operating: "Operating",
  financial: "Financial",
  money: "Money",
  people: "People",
  risk: "Risk",
  infrastructure: "Infrastructure",
};

/** What a connected layer lets the product see. */
export const LAYER_CARRIES: Record<DataLayer, string> = {
  demand: "Where leads come from and what they cost",
  operating: "Jobs, tickets, labour and materials per job",
  financial: "Period expenses, accruals and the real bottom line",
  money: "Cash actually received, refunds and timing",
  people: "Payroll, headcount and hours worked",
  risk: "Insurance, claims and open exposures",
  infrastructure: "Systems of record that make the books auditable",
};

/** What goes unanswered while a layer is missing. */
export const LAYER_BLOCKS: Record<DataLayer, string> = {
  demand: "Lead economics, campaign margin and cost per booked job",
  operating: "Everything about job-level profit",
  financial: "Period profitability, vendor economics and campaign margin",
  money: "Billed versus collected, and how long work takes to become cash",
  people: "Whether payroll is sized against the work coming in",
  risk: "Value after open exposures, and whether limits are right",
  infrastructure: "Whether the numbers would survive an accountant's review",
};

export const STATE_LABEL: Record<CoverageState, string> = {
  complete: "Complete coverage",
  partial: "Partial coverage",
  blind: "Blind",
};

export const STATE_CLASSES: Record<CoverageState, string> = {
  complete: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  partial: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  blind: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

export const STATE_SUMMARY: Record<CoverageState, string> = {
  complete:
    "Every economic layer has at least one live connection. Answers below still depend on the quality of those systems.",
  partial:
    "Some layers are connected and some are not. The questions below are answered only where every layer they need is present.",
  blind:
    "No economic layer is connected, so nothing on this page can be answered from data yet.",
};

/** "demand, operating" rather than a bare array in prose. */
export function formatLayers(layers: DataLayer[]): string {
  return layers.map((layer) => LAYER_LABEL[layer].toLowerCase()).join(", ");
}
