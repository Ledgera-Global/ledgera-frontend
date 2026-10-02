/**
 * Live visibility types (frontend).
 *
 * Mirrors `ledgera-backend/src/live/types.ts` and
 * `ledgera-backend/src/live/identity/identityTypes.ts`. Declared separately
 * rather than imported, for the same reason as every other mirrored contract in
 * this app: the frontend must never pull a module that reaches into the
 * database client.
 *
 * The idea these types exist to carry: "we synced recently" and "we may present
 * this as current" are different claims. `FreshnessState` is the first,
 * `mayPresentAsCurrent` is the second, and no screen may conflate them.
 */

// ── Connections ─────────────────────────────────────────────────────────────

export type SyncCadence =
  | "realtime"
  | "five_minutes"
  | "fifteen_minutes"
  | "hourly"
  | "daily"
  | "manual";

export type ConnectionStatus = "connected" | "degraded" | "disconnected";

export type FreshnessState =
  | "live"
  | "current"
  | "overdue"
  | "stale"
  | "failing"
  | "never";

export interface ConnectionHealth {
  provider: string;
  providerName: string;
  category: string;
  status: ConnectionStatus;
  cadence: SyncCadence;
  freshness: FreshnessState;
  lastSyncAt: string | null;
  /** Seconds since the last successful sync. Null when there never was one. */
  ageSeconds: number | null;
  nextSyncDueAt: string | null;
  dueNow: boolean;
  lastSyncOk: boolean;
  lastError: string | null;
  consecutiveFailures: number;
  recordsIngested: number;
  totalSyncs: number;
  connectedAt: string;
  /** The field the UI branches on. Not `status`. */
  mayPresentAsCurrent: boolean;
  note: string;
}

// ── Economic events ─────────────────────────────────────────────────────────

export type EconomicEventKind =
  | "revenue_booked"
  | "cost_incurred"
  | "cash_moved"
  | "job_completed"
  | "call_received"
  | "policy_renewed"
  | "sync_completed"
  | "sync_failed"
  | "connection_established"
  | "connection_lost"
  | "signal_raised";

export type ImpactClass = "revenue" | "cost" | "cash" | "risk" | "operational";

export interface EconomicEvent {
  id: string;
  companyId: string;
  kind: EconomicEventKind;
  source: string;
  title: string;
  detail: string | null;
  /** Signed, in cents. Null when the event has no monetary dimension. */
  amountCents: number | null;
  impactClass: ImpactClass;
  occurredAt: string;
  payload?: unknown;
}

// ── Institutional Economic Identity ─────────────────────────────────────────

export type DimensionStatus = "strong" | "adequate" | "weak" | "unknown";

export type DimensionUnit = "cents" | "percent" | "ratio" | "count" | "days";

export interface IdentityDimension {
  key: string;
  label: string;
  status: DimensionStatus;
  /** Null exactly when status is "unknown". Never a sentinel. */
  value: number | null;
  unit: DimensionUnit;
  statement: string;
  /** Present when status is "unknown": why it cannot be measured. */
  unavailableReason?: string;
  sources: string[];
  priorValue: number | null;
  changePct: number | null;
}

export interface IdentitySourceSummary {
  provider: string;
  providerName: string;
  freshness: string;
  mayPresentAsCurrent: boolean;
}

export interface IdentityHeadline {
  /** 0-100, or null when too few dimensions are measurable for an average. */
  institutionalScore: number | null;
  band: string;
  /** Share of dimensions that produced a number, 0-1. */
  coverage: number;
  measured: number;
  total: number;
}

export interface InstitutionalIdentity {
  companyId: string;
  computedAt: string;
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  headline: IdentityHeadline;
  dimensions: IdentityDimension[];
  sources: IdentitySourceSummary[];
  /** False when any contributing source is stale or failing. */
  mayPresentAsCurrent: boolean;
  note: string;
}

// ── Route payloads ──────────────────────────────────────────────────────────

export interface IdentityResponse extends InstitutionalIdentity {
  /**
   * Present on the identity read. The overdue figure assumes 30-day terms where
   * the source records none, and a customer reading "past due" is entitled to
   * know that.
   */
  receivablesTermsNote?: string;
}

export interface EventsResponse {
  companyId: string;
  events: EconomicEvent[];
}

export interface ConnectionsResponse {
  companyId: string;
  connections: ConnectionHealth[];
}

// ── Stream frames ───────────────────────────────────────────────────────────

export interface LiveSnapshot {
  identity: InstitutionalIdentity;
  events: EconomicEvent[];
  connections: ConnectionHealth[];
  generatedAt: string;
}

export type LiveStreamFrame =
  | { event: "snapshot"; data: LiveSnapshot }
  | { event: "event"; data: EconomicEvent }
  | { event: "identity"; data: InstitutionalIdentity }
  | { event: "connection"; data: ConnectionHealth }
  | { event: "heartbeat"; data: { at: string } };

/** What the client-side stream hook reports about its own connection. */
export type LiveStreamStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";
