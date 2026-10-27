/**
 * Data-network coverage — client-side vocabulary.
 *
 * Mirrors the backend contract in integrations/network/networkTypes.ts.
 *
 * The load-bearing idea is `requiresAll`. A question is answerable only when
 * every layer it needs is connected. Partial coverage produces a stated blocker,
 * never a best-effort number, because an owner acts on whatever the screen shows
 * them. The blocker is the product.
 */

export type DataLayer =
  | "demand"
  | "operating"
  | "financial"
  | "money"
  | "people"
  | "risk"
  | "infrastructure";

export type CoverageState = "complete" | "partial" | "blind";

export interface LayerCoverage {
  layer: DataLayer;
  connectedProviderIds: string[];
  covered: boolean;
  /** Display names joined in by the API route; mirrors connectedProviderIds. */
  connectedProviderNames?: string[];
}

export interface EconomicQuestion {
  id: string;
  question: string;
  requiresAll: DataLayer[];
  maturity: 1 | 2 | 3 | 4 | 5;
  decision: string;
}

export interface QuestionAnswerability {
  question: EconomicQuestion;
  answerable: boolean;
  satisfiedLayers: DataLayer[];
  missingLayers: DataLayer[];
  blocker: string | null;
}

export interface NextBestConnection {
  layer: DataLayer;
  providerIds: string[];
  unlocks: number;
}

export interface NetworkCoverageReport {
  companyId: string;
  evaluatedAt: string;
  layers: LayerCoverage[];
  state: CoverageState;
  questions: QuestionAnswerability[];
  answerableCount: number;
  totalQuestions: number;
  nextBestConnection: NextBestConnection | null;
  headline: string;
}

export interface AnswerableQuestionsResponse {
  companyId: string;
  answerableCount: number;
  blockedCount: number;
  headline: string;
  answerable: QuestionAnswerability[];
  blocked: QuestionAnswerability[];
}
