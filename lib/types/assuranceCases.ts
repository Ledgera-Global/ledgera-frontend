/**
 * Assurance cases — client-side vocabulary.
 *
 * Mirrors the backend contract in finance/assuranceCaseService.ts. Money is
 * integer cents. `status` is the whole point: a finding that carries an owner,
 * a due date and a close-out note is something someone is accountable for,
 * which a fresh "finding" recomputed on every report refresh never was.
 *
 * `needsAttention` is computed from timestamps, not stored. It is true for open
 * cases and for cases that were closed and then detected again — the second is
 * the most useful signal on the screen, because it means the fix did not hold.
 */

export type AssuranceCaseStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "recovered"
  | "written_off"
  | "dismissed";

/** The three states that take a case off the working list. */
export const CLOSED_CASE_STATUSES: readonly AssuranceCaseStatus[] = [
  "recovered",
  "written_off",
  "dismissed",
];

export interface AssuranceCase {
  id: string;
  findingId: string;
  kind: string;
  severity: string;
  amountCents: number;
  jobId: string | null;
  invoiceId: string | null;
  paymentId: string | null;
  title: string;
  detail: string;
  recommendedAction: string;
  status: AssuranceCaseStatus;
  ownerUserId: string | null;
  dueAt: string | null;
  recoveredCents: number;
  resolutionNote: string | null;
  resolvedAt: string | null;
  linkedInterventionId: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  detectionCount: number;
  needsAttention: boolean;
  daysOpen: number;
  ageLabel: string;
}

export interface AssuranceCaseListResponse {
  companyId: string;
  evaluatedAt: string;
  count: number;
  openAtStakeCents: number;
  cases: AssuranceCase[];
}

/** What a sync run reports back. */
export interface AssuranceSyncResult {
  companyId: string;
  evaluatedAt: string;
  findingsDetected: number;
  evaluatedJobs: number;
  atRiskCents: number;
  opened: number;
  refreshed: number;
  unchanged: number;
  truncated: boolean;
}

/**
 * What an operator may send. A status alone is not a closure: a closure needs a
 * note, and a recovery needs an amount. The backend refuses the combinations
 * that would let "closed" mean "handled" without saying what happened.
 */
export interface CaseUpdateInput {
  status?: AssuranceCaseStatus;
  ownerUserId?: string | null;
  dueAt?: string | null;
  recoveredCents?: number;
  resolutionNote?: string | null;
  linkedInterventionId?: string | null;
}
