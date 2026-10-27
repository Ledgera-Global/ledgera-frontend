/**
 * Operational intervention attribution — client-side vocabulary.
 *
 * Mirrors the backend contract in services/attribution/attributionTypes.ts.
 * Every money field is integer cents; nothing here is a float and nothing is
 * pre-formatted, because formatting belongs to the display layer.
 *
 * The type that carries the product's discipline is `Grade`. "supported" does
 * not mean proven — it means the effect survived an untreated comparison. The
 * UI must never render the bridge without it.
 */

export type AttributionGrade = "not_enough_data" | "directional" | "supported";

export interface WindowMetrics {
  startIso: string;
  endIso: string;
  days: number;
  completedJobs: number;
  revenueCents: number;
  laborCostCents: number;
  materialCostCents: number;
  grossProfitCents: number;
}

export type EffectComponentKey = "volume" | "price" | "margin" | "interaction";

export interface EffectComponent {
  key: EffectComponentKey;
  label: string;
  amountCents: number;
  interpretation: string;
}

export interface GrossProfitBridge {
  preGrossProfitCents: number;
  postGrossProfitCents: number;
  changeCents: number;
  changePct: number | null;
  components: EffectComponent[];
  reconciles: boolean;
}

export interface EbitdaBridge {
  grossProfitChangeCents: number;
  dispatcherCostChangeCents: number;
  vendorCostCents: number;
  netEbitdaEffectCents: number;
  annualisedNetEffectCents: number;
  verdict: string;
}

export interface AttributionCaveat {
  code: string;
  message: string;
}

export interface InterventionAttribution {
  companyId: string;
  providerId: string;
  label: string;
  evaluatedAt: string;
  grade: AttributionGrade;
  baseline: WindowMetrics;
  treatment: WindowMetrics;
  control: { baseline: WindowMetrics; treatment: WindowMetrics } | null;
  grossProfit: GrossProfitBridge;
  ebitda: EbitdaBridge;
  caveats: AttributionCaveat[];
  headline: string;
}

/** One intervention, flattened for the list view. */
export interface InterventionSummary {
  id: string;
  providerId: string;
  providerName: string;
  label: string;
  activatedAt: string;
  treatmentEnd: string | null;
  monthlyVendorCostCents: number;
  hasControl: boolean;
}

export interface InterventionListResponse {
  companyId: string;
  interventions: InterventionSummary[];
}
