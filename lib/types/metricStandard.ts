/**
 * The metric standard, as the backend publishes it.
 *
 * Every field here exists because a figure without it is a number nobody can
 * defend. `question` is the question the metric answers, `formula` is how it is
 * computed, `refusalRule` names the case where the platform is forbidden to
 * publish a figure at all, and `citation` is the string that travels with a
 * sealed snapshot so a reader holding only the snapshot can name its basis.
 *
 * The version is part of the identity, not decoration: two versions of the same
 * metric are different promises, and a snapshot records which one it was sealed
 * under.
 */

export interface MetricDefinition {
  id: string;
  label: string;
  version: string;
  /** "usd" | "ratio" | "score" today; typed as string so an unknown unit renders. */
  unit: string;
  /** The question this metric answers, in the words the standard publishes. */
  question: string;
  formula: string;
  requiredInputs: string[];
  /** "when-not-positive" means a value at or below zero must be refused. */
  refusalRule: string;
  /** The earnings basis, or null for metrics that do not sit on one. */
  earningsBasis: string | null;
}

export interface PolicyEntry {
  definition: MetricDefinition;
  /** e.g. `LMS-2026.1#normalized_ebitda`. */
  citation: string;
}

export interface MetricPolicyResponse {
  policy: PolicyEntry[];
  /** Where revisions live, stated by the server. Never inferred by the client. */
  storage: string;
}

/**
 * A quoted figure, sealed.
 *
 * `value` is null exactly when the platform refused to publish a figure, and
 * `refusalReason` is then non-null. Both states are first class: a refusal on
 * record is a decision, not a gap in the data.
 */
export interface MetricSnapshot {
  snapshotId: string;
  companyId: string;
  metricId: string;
  definitionVersion: string;
  definitionDigest: string;
  citation: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  value: number | null;
  unit: string;
  refusalReason: string | null;
  /** The named inputs the figure was computed from. Arbitrary JSON shape. */
  inputs: Record<string, unknown>;
  inputsDigest: string;
  producedAt: string;
  /** Hash of the body. Any later edit breaks this. */
  digest: string;
}

export interface SnapshotCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface SnapshotVerification {
  ok: boolean;
  checks: SnapshotCheck[];
  /** True when the cited definition is the one this build still publishes. */
  definitionIsCurrent: boolean;
}

/** GET /:companyId/metrics/:metricId — the latest quote, with verification. */
export interface LatestMetricResponse {
  companyId: string;
  metricId: string;
  storage: string;
  snapshot: MetricSnapshot;
  verification: SnapshotVerification;
}

/**
 * What the proxy returns once the backend's 404 has been understood.
 *
 * A 404 from this endpoint is not a failure: it says nothing has been quoted as
 * this metric for this company. That is a product state the screen must be able
 * to show, so it is carried here rather than collapsed into a read error.
 */
export interface LatestMetricRead {
  found: boolean;
  detail: string | null;
  data: LatestMetricResponse | null;
}
