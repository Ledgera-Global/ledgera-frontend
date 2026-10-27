import type {
  AnswerableQuestionsResponse,
  DataLayer,
  EconomicQuestion,
  NetworkCoverageReport,
  QuestionAnswerability,
} from "@/lib/types/networkCoverage";

/**
 * Preview fixture for the coverage screen.
 *
 * Served only with X-Ledgera-Data-Source: demo. A signed-in owner gets the real
 * report or an error, never this — a fabricated coverage map would tell them to
 * stop buying an integration they actually need.
 *
 * The fixture is coherent: every blocked question lists a layer that is genuinely
 * uncovered, and the "next best connection" unlocks exactly the questions whose
 * only missing layer is the financial system.
 */

const QUESTIONS: EconomicQuestion[] = [
  {
    id: "job-gross-profit",
    question: "What does each completed job actually earn?",
    requiresAll: ["operating"],
    maturity: 1,
    decision: "Whether to keep taking this kind of work",
  },
  {
    id: "technician-margin",
    question: "Which technicians make money and which consume it?",
    requiresAll: ["operating"],
    maturity: 2,
    decision: "Coaching, routing and pay structure",
  },
  {
    id: "growth-decomposition",
    question: "Is growth coming from more work or better work?",
    requiresAll: ["operating"],
    maturity: 2,
    decision: "Whether to hire or to raise prices",
  },
  {
    id: "lead-economics",
    question: "Which lead sources turn into profitable jobs?",
    requiresAll: ["demand", "operating"],
    maturity: 3,
    decision: "Where the next marketing dollar goes",
  },
  {
    id: "billed-vs-collected",
    question: "What was billed and what actually arrived?",
    requiresAll: ["operating", "money"],
    maturity: 3,
    decision: "Whether to chase receivables or fix billing",
  },
  {
    id: "cash-conversion",
    question: "How long does a completed job take to become cash?",
    requiresAll: ["operating", "money"],
    maturity: 3,
    decision: "Whether working capital is the binding constraint",
  },
  {
    id: "period-ebitda",
    question: "What did the business earn this period after every cost?",
    requiresAll: ["financial"],
    maturity: 2,
    decision: "Whether the month was actually profitable",
  },
  {
    id: "intervention-economics",
    question: "Did a paid vendor move gross profit enough to cover its fee?",
    requiresAll: ["operating", "financial"],
    maturity: 4,
    decision: "Whether to renew or cancel the subscription",
  },
  {
    id: "marketing-to-margin",
    question: "Which campaigns produce gross profit rather than revenue?",
    requiresAll: ["demand", "operating", "financial"],
    maturity: 4,
    decision: "Budget reallocation across channels",
  },
  {
    id: "labor-margin",
    question: "Is payroll sized correctly against the work coming in?",
    requiresAll: ["operating", "people"],
    maturity: 4,
    decision: "Hiring and scheduling decisions",
  },
  {
    id: "risk-adjusted-value",
    question: "What is the business worth after its open exposures?",
    requiresAll: ["financial", "risk"],
    maturity: 5,
    decision: "Exit timing and insurance limits",
  },
  {
    id: "independent-verification",
    question: "Would an outside accountant reach the same numbers?",
    requiresAll: ["financial", "infrastructure"],
    maturity: 5,
    decision: "Whether the books can survive diligence",
  },
];

const COVERED: Record<DataLayer, string[]> = {
  demand: ["google-ads", "callrail"],
  operating: ["servicetitan"],
  money: ["stripe"],
  financial: [],
  people: [],
  risk: [],
  infrastructure: [],
};

const PROVIDER_NAMES: Record<string, string> = {
  "google-ads": "Google Ads",
  callrail: "CallRail",
  servicetitan: "ServiceTitan",
  stripe: "Stripe",
};

const LAYER_ORDER: DataLayer[] = [
  "demand",
  "operating",
  "financial",
  "money",
  "people",
  "risk",
  "infrastructure",
];

function toAnswerability(question: EconomicQuestion): QuestionAnswerability {
  const missing = question.requiresAll.filter(
    (layer) => COVERED[layer].length === 0,
  );
  const answerable = missing.length === 0;
  return {
    question,
    answerable,
    satisfiedLayers: question.requiresAll.filter((layer) => !missing.includes(layer)),
    missingLayers: missing,
    blocker: answerable
      ? null
      : `Needs ${missing.join(" and ")} data, which is not connected.`,
  };
}

const QUESTIONS_WITH_ANSWERS = QUESTIONS.map(toAnswerability);
const ANSWERABLE = QUESTIONS_WITH_ANSWERS.filter((q) => q.answerable);
const BLOCKED = QUESTIONS_WITH_ANSWERS.filter((q) => !q.answerable);

const HEADLINE = `${ANSWERABLE.length} of ${QUESTIONS.length} economic questions are answerable. A financial system would complete 3 more.`;

export const NETWORK_COVERAGE_DEMO: NetworkCoverageReport = {
  companyId: "companyA",
  evaluatedAt: "2026-05-01T12:00:00.000Z",
  layers: LAYER_ORDER.map((layer) => ({
    layer,
    connectedProviderIds: COVERED[layer],
    connectedProviderNames: COVERED[layer].map((id) => PROVIDER_NAMES[id] ?? id),
    covered: COVERED[layer].length > 0,
  })),
  state: "partial",
  questions: QUESTIONS_WITH_ANSWERS,
  answerableCount: ANSWERABLE.length,
  totalQuestions: QUESTIONS.length,
  nextBestConnection: {
    layer: "financial",
    providerIds: ["quickbooks", "netsuite"],
    unlocks: 3,
  },
  headline: HEADLINE,
};

export const NETWORK_QUESTIONS_DEMO: AnswerableQuestionsResponse = {
  companyId: "companyA",
  answerableCount: ANSWERABLE.length,
  blockedCount: BLOCKED.length,
  headline: HEADLINE,
  answerable: ANSWERABLE,
  blocked: BLOCKED,
};
