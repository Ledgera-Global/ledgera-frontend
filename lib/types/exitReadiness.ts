/**
 * Exit Readiness Types (frontend)
 *
 * Mirrors `ledgera-backend/src/services/exit/exitTypes.ts`. Kept as a separate
 * declaration rather than imported because the frontend must never pull a
 * module that reaches into the database client.
 *
 * Every field is either measured from the valuation model or explicitly marked
 * not measured. There is no third state, so a readiness score can never treat
 * missing data as good news.
 */

/** How an individual readiness dimension reads. */
export type ReadinessState = "ready" | "watch" | "gap" | "not_measured";

/** The overall verdict, which also reflects how much could be assessed. */
export type ReadinessGrade =
  | "exit_ready"
  | "nearly_ready"
  | "needs_work"
  | "not_ready"
  | "insufficient_data";

export interface ReadinessDimension {
  key: string;
  label: string;
  state: ReadinessState;
  /** 0-100 within this dimension, or null when the data does not exist. */
  score: number | null;
  /** Relative importance in the overall score. Only counted when measured. */
  weight: number;
  observed: string;
  exitStandard: string;
  whyItMatters: string;
}

export interface ExitAction {
  driver: string;
  label: string;
  currentDisplay: string;
  targetDisplay: string;
  /** Multiple points gained by moving this driver to its best band. */
  multipleUplift: number;
  /** Dollars of enterprise value that uplift represents, or null. */
  valueUplift: number | null;
  whatToDo: string;
  rationale: string;
}

export interface ExitValueOnTheTable {
  earningsAmount: number;
  currentMultiple: number;
  multipleIfGapsClosed: number;
  valueToday: number;
  valueIfGapsClosed: number | null;
  capturableUplift: number | null;
  /** Drivers nobody can currently price. */
  unpricedDrivers: string[];
  note: string;
}

export interface ExitReadiness {
  companyId: string;
  generatedAt: string;

  score: number;
  scoreBasis: {
    dimensionsMeasured: number;
    dimensionsTotal: number;
    coverage: number;
    note: string;
  };
  grade: ReadinessGrade;
  headline: string;

  dimensions: ReadinessDimension[];
  valueOnTheTable: ExitValueOnTheTable;
  actions: ExitAction[];
  diligenceFindings: string[];
  methodology: string[];
}
