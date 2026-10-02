import type {
  ConnectionHealth,
  EconomicEvent,
  IdentityResponse,
  InstitutionalIdentity,
} from "@/lib/types/live";

/**
 * Preview fixture for the live visibility page.
 *
 * Served only to unauthenticated callers, and labelled
 * `X-Ledgera-Data-Source: demo` by the proxy. A signed-in customer never sees
 * any of this: they get their own numbers or a loud 502.
 *
 * The shape here is deliberately *not* uniformly rosy, because the point of the
 * page is honesty about data quality and a fixture where everything is perfect
 * would demonstrate the opposite:
 *
 *  - Three sources connected, all currently healthy, so the identity may be
 *    presented as current.
 *  - No bank feed, so cash runway is genuinely unmeasurable - and it says so
 *    rather than showing a zero.
 *  - A payroll source connected, which is why operating margin *is* measurable:
 *    with no spend source behind it the backend reports that unknown too.
 *
 * Timestamps are anchored to a fixed instant so the preview reads the same on
 * every load rather than ageing into nonsense.
 */

const GENERATED_AT = "2026-10-01T12:40:00.000Z";
const GEN_MS = Date.parse(GENERATED_AT);
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** An instant `minutes` before the anchor, as an ISO string. */
function minutesBefore(minutes: number): string {
  return new Date(GEN_MS - minutes * MINUTE_MS).toISOString();
}

/** An instant `ms` after the anchor, as an ISO string. */
function msAfter(ms: number): string {
  return new Date(GEN_MS + ms).toISOString();
}

export const LIVE_CONNECTIONS_DEMO: ConnectionHealth[] = [
  {
    provider: "servicetitan",
    providerName: "ServiceTitan",
    category: "field-service",
    status: "connected",
    cadence: "fifteen_minutes",
    freshness: "current",
    lastSyncAt: minutesBefore(7),
    ageSeconds: 7 * 60,
    nextSyncDueAt: msAfter(8 * MINUTE_MS),
    dueNow: false,
    lastSyncOk: true,
    lastError: null,
    consecutiveFailures: 0,
    recordsIngested: 148,
    totalSyncs: 2_914,
    connectedAt: "2025-11-04T09:12:00.000Z",
    mayPresentAsCurrent: true,
    note: "ServiceTitan synced 7 minutes ago, inside its fifteen-minute window.",
  },
  {
    provider: "quickbooks",
    providerName: "QuickBooks Online",
    category: "accounting",
    status: "connected",
    cadence: "hourly",
    freshness: "current",
    lastSyncAt: minutesBefore(22),
    ageSeconds: 22 * 60,
    nextSyncDueAt: msAfter(38 * MINUTE_MS),
    dueNow: false,
    lastSyncOk: true,
    lastError: null,
    consecutiveFailures: 0,
    recordsIngested: 61,
    totalSyncs: 1_208,
    connectedAt: "2025-11-04T09:20:00.000Z",
    mayPresentAsCurrent: true,
    note: "QuickBooks Online synced 22 minutes ago, inside its hourly window.",
  },
  {
    provider: "gusto",
    providerName: "Gusto",
    category: "payroll",
    status: "connected",
    cadence: "daily",
    freshness: "current",
    lastSyncAt: minutesBefore(6 * 60 + 14),
    ageSeconds: 6 * 60 * 60 + 14 * 60,
    nextSyncDueAt: msAfter(17 * HOUR_MS + 46 * MINUTE_MS),
    dueNow: false,
    lastSyncOk: true,
    lastError: null,
    consecutiveFailures: 0,
    recordsIngested: 38,
    totalSyncs: 231,
    connectedAt: "2026-02-18T14:05:00.000Z",
    mayPresentAsCurrent: true,
    note: "Gusto synced 6 hours ago, inside its daily window.",
  },
];

export const LIVE_IDENTITY_DEMO: InstitutionalIdentity = {
  companyId: "companyA",
  computedAt: GENERATED_AT,
  windowDays: 30,
  windowStart: "2026-09-01T12:40:00.000Z",
  windowEnd: GENERATED_AT,
  headline: {
    institutionalScore: 86,
    band: "institutionally strong",
    coverage: 10 / 11,
    measured: 10,
    total: 11,
  },
  dimensions: [
    {
      key: "revenue",
      label: "Revenue",
      status: "strong",
      value: 35_120_000,
      unit: "cents",
      statement:
        "$351,200 booked over the last 30 days, up 8.2% on the prior 30 days.",
      sources: ["servicetitan"],
      priorValue: 32_460_000,
      changePct: 8.2,
    },
    {
      key: "revenue_quality",
      label: "Revenue quality",
      status: "strong",
      value: 96,
      unit: "percent",
      statement:
        "96% of booked work is backed by a completed job record; the rest is unverified.",
      sources: ["servicetitan"],
      priorValue: 94,
      changePct: 2.1,
    },
    {
      key: "gross_margin",
      label: "Gross margin",
      status: "strong",
      value: 52,
      unit: "percent",
      statement:
        "52% after labour and materials, measured from the cost records attached to each job.",
      sources: ["servicetitan", "quickbooks"],
      priorValue: 49,
      changePct: 6.1,
    },
    {
      key: "operating_margin",
      label: "Operating margin",
      status: "adequate",
      value: 17,
      unit: "percent",
      statement: "17% after labour, materials, overhead and payroll.",
      sources: ["servicetitan", "quickbooks", "gusto"],
      priorValue: 16,
      changePct: 6.3,
    },
    {
      key: "technician_productivity",
      label: "Technician productivity",
      status: "adequate",
      value: 2_930_000,
      unit: "cents",
      statement: "$29,300 of revenue per active technician over the window.",
      sources: ["servicetitan"],
      priorValue: 2_780_000,
      changePct: 5.4,
    },
    {
      key: "recurring_revenue",
      label: "Recurring revenue",
      status: "adequate",
      value: 34,
      unit: "percent",
      statement:
        "34% of revenue comes from maintenance agreements rather than one-off work.",
      sources: ["servicetitan"],
      priorValue: 31,
      changePct: 9.7,
    },
    {
      key: "concentration",
      label: "Concentration",
      status: "strong",
      value: 24,
      unit: "percent",
      statement:
        "No single location, service line or technician exceeds 24% of revenue. Customer concentration is not measured: no customer identifier is recorded.",
      sources: ["servicetitan"],
      priorValue: 27,
      changePct: -11.1,
    },
    {
      key: "receivables_quality",
      label: "Receivables quality",
      status: "strong",
      value: 88,
      unit: "percent",
      statement:
        "88% of open receivables are within terms; $28,400 is past due.",
      sources: ["quickbooks"],
      priorValue: 84,
      changePct: 4.8,
    },
    {
      key: "cash_conversion",
      label: "Cash conversion",
      status: "strong",
      value: 94,
      unit: "percent",
      statement: "94% of the work booked in this window has been collected.",
      sources: ["servicetitan", "quickbooks"],
      priorValue: 91,
      changePct: 3.3,
    },
    {
      key: "cash_runway",
      label: "Cash runway",
      status: "unknown",
      value: null,
      unit: "days",
      statement: "Runway cannot be measured from the sources currently connected.",
      unavailableReason:
        "No bank feed is connected, so available cash is unknown. Runway is left unmeasured rather than inferred from receivables.",
      sources: [],
      priorValue: null,
      changePct: null,
    },
    {
      key: "data_trust",
      label: "Data trust",
      status: "strong",
      value: 100,
      unit: "percent",
      statement:
        "All 3 connected sources are current. Nothing on this page is being presented from stale data.",
      sources: ["servicetitan", "quickbooks", "gusto"],
      priorValue: 100,
      changePct: 0,
    },
  ],
  sources: [
    {
      provider: "servicetitan",
      providerName: "ServiceTitan",
      freshness: "current",
      mayPresentAsCurrent: true,
    },
    {
      provider: "quickbooks",
      providerName: "QuickBooks Online",
      freshness: "current",
      mayPresentAsCurrent: true,
    },
    {
      provider: "gusto",
      providerName: "Gusto",
      freshness: "current",
      mayPresentAsCurrent: true,
    },
  ],
  mayPresentAsCurrent: true,
  note: "Every source behind this identity is current, so it is presented as live.",
};

export const LIVE_IDENTITY_RESPONSE_DEMO: IdentityResponse = {
  ...LIVE_IDENTITY_DEMO,
  receivablesTermsNote:
    "An invoice with no recorded terms is treated as due in 30 days.",
};

export const LIVE_EVENTS_DEMO: EconomicEvent[] = [
  {
    id: "demo-evt-1",
    companyId: "companyA",
    kind: "job_completed",
    source: "servicetitan",
    title: "Job 41822 completed",
    detail:
      "No-cooling diagnostic and capacitor replacement, resolved on the first visit.",
    amountCents: 68_400,
    impactClass: "operational",
    occurredAt: minutesBefore(11),
  },
  {
    id: "demo-evt-2",
    companyId: "companyA",
    kind: "revenue_booked",
    source: "quickbooks",
    title: "Invoice 10428 issued",
    detail: "North Ridge Property Group, commercial rooftop unit replacement.",
    amountCents: 1_284_000,
    impactClass: "revenue",
    occurredAt: minutesBefore(38),
  },
  {
    id: "demo-evt-3",
    companyId: "companyA",
    kind: "cash_moved",
    source: "quickbooks",
    title: "Payment received from North Ridge Property Group",
    detail: "Applied to invoices 10391 and 10397.",
    amountCents: 742_500,
    impactClass: "cash",
    occurredAt: minutesBefore(52),
  },
  {
    id: "demo-evt-4",
    companyId: "companyA",
    kind: "cost_incurred",
    source: "quickbooks",
    title: "Supplier bill from Ferguson HVAC",
    detail: "Compressors and line sets for three scheduled installs.",
    amountCents: -413_750,
    impactClass: "cost",
    occurredAt: minutesBefore(96),
  },
  {
    id: "demo-evt-5",
    companyId: "companyA",
    kind: "policy_renewed",
    source: "ledgera",
    title: "General liability policy renewed",
    detail:
      "Coverage continued with the same carrier at a 4% increase in premium.",
    amountCents: -1_860_000,
    impactClass: "risk",
    occurredAt: minutesBefore(140),
  },
  {
    id: "demo-evt-6",
    companyId: "companyA",
    kind: "sync_completed",
    source: "servicetitan",
    title: "ServiceTitan synced",
    detail: "Moved 148 records into the ledger.",
    amountCents: null,
    impactClass: "operational",
    occurredAt: minutesBefore(7),
  },
  {
    id: "demo-evt-7",
    companyId: "companyA",
    kind: "signal_raised",
    source: "ledgera",
    title: "Receivables ageing on two commercial accounts",
    detail: "Two invoices crossed 45 days with no partial payment recorded.",
    amountCents: -2_840_000,
    impactClass: "risk",
    occurredAt: minutesBefore(215),
  },
  {
    id: "demo-evt-8",
    companyId: "companyA",
    kind: "call_received",
    source: "servicetitan",
    title: "18 inbound calls booked",
    detail: "Three after-hours calls went to voicemail and were not called back.",
    amountCents: null,
    impactClass: "operational",
    occurredAt: minutesBefore(268),
  },
];
