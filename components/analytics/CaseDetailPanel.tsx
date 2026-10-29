import CaseCloseOutForm from "@/components/analytics/CaseCloseOutForm";
import CaseStatusPill from "@/components/analytics/CaseStatusPill";
import { GRADE_CLASSES, GRADE_EXPLANATION, GRADE_LABEL } from "@/lib/interventionDisplay";

import {
  STATUS_EXPLANATION,
  describeDue,
  formatDate,
  formatUsd,
  reopenedAfterClosure,
  severityClasses,
  severityLabel,
} from "@/lib/assuranceCaseDisplay";
import type {
  AssuranceCase,
  CaseUpdateInput,
} from "@/lib/types/assuranceCases";
import type {
  InterventionAttribution,
  InterventionSummary,
} from "@/lib/types/interventions";

/**
 * One case, in full: what was found, what it is worth, who owns it, and what has
 * been decided.
 *
 * The evidence links are shown as identifiers rather than as links, because this
 * screen does not own those records. Showing the ids keeps a reader able to go
 * and check the job or the payment without this panel pretending to be the place
 * where those records live.
 */

interface CaseDetailPanelProps {
  caseRow: AssuranceCase;
  interventions: readonly InterventionSummary[];
  linkedAttribution: InterventionAttribution | null;
  linkedAttributionLoading: boolean;
  nowIso: string;
  saving: boolean;
  error: string | null;
  onSubmit: (input: CaseUpdateInput) => Promise<boolean>;
  onDismissError: () => void;
}

export default function CaseDetailPanel({
  caseRow,
  interventions,
  linkedAttribution,
  linkedAttributionLoading,
  nowIso,
  saving,
  error,
  onSubmit,
  onDismissError,
}: CaseDetailPanelProps) {
  const reopened = reopenedAfterClosure(
    caseRow.status,
    caseRow.lastSeenAt,
    caseRow.resolvedAt
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${severityClasses(
                caseRow.severity
              )}`}
            >
              {severityLabel(caseRow.severity)}
            </span>
            <CaseStatusPill status={caseRow.status} />
            <span className="text-xs text-surface-500">{caseRow.ageLabel}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
              At stake
            </div>
            <div className="font-mono text-xl font-bold text-white">
              {formatUsd(caseRow.amountCents)}
            </div>
          </div>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-white">{caseRow.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-surface-300">
          {caseRow.detail}
        </p>

        <div className="mt-5 rounded-xl border border-brand-400/20 bg-brand-500/[0.06] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-brand-300">
            Recommended action
          </div>
          <p className="mt-2 text-sm leading-relaxed text-surface-200">
            {caseRow.recommendedAction}
          </p>
        </div>

        <p className="mt-4 text-sm text-surface-400">
          {STATUS_EXPLANATION[caseRow.status]}
        </p>

        {reopened && (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">
            This case was closed on {formatDate(caseRow.resolvedAt ?? "")} and the
            condition has been detected again since. The closure did not hold.
          </p>
        )}

        <dl className="mt-5 grid gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          <Field label="First seen" value={formatDate(caseRow.firstSeenAt)} />
          <Field label="Last seen" value={formatDate(caseRow.lastSeenAt)} />
          <Field
            label="Detections"
            value={`${caseRow.detectionCount} time${
              caseRow.detectionCount === 1 ? "" : "s"
            }`}
          />
          <Field label="Due" value={describeDue(caseRow.dueAt, nowIso)} />
          <Field
            label="Owner"
            value={caseRow.ownerUserId ?? "Unassigned"}
          />
          <Field
            label="Recovered"
            value={formatUsd(caseRow.recoveredCents)}
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          <EvidenceChip label="Job" id={caseRow.jobId} />
          <EvidenceChip label="Invoice" id={caseRow.invoiceId} />
          <EvidenceChip label="Payment" id={caseRow.paymentId} />
        </div>
      </div>

      <LinkedInterventionPanel
        linkedInterventionId={caseRow.linkedInterventionId}
        interventions={interventions}
        attribution={linkedAttribution}
        loading={linkedAttributionLoading}
      />

      {caseRow.resolutionNote !== null && (
        <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
            Resolution
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-surface-200">
            {caseRow.resolutionNote}
          </p>
          {caseRow.resolvedAt !== null && (
            <p className="mt-2 text-xs text-surface-500">
              Recorded {formatDate(caseRow.resolvedAt)}
            </p>
          )}
        </div>
      )}

      <CaseCloseOutForm
        caseRow={caseRow}
        interventions={interventions}
        saving={saving}
        error={error}
        onSubmit={onSubmit}
        onDismissError={onDismissError}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </dt>
      <dd className="mt-1 text-surface-100">{value}</dd>
    </div>
  );
}

function EvidenceChip({ label, id }: { label: string; id: string | null }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-950/50 px-3 py-1.5 text-xs">
      <span className="font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </span>
      <span className="font-mono text-surface-200">{id ?? "none"}</span>
    </span>
  );
}

interface LinkedInterventionPanelProps {
  linkedInterventionId: string | null;
  interventions: readonly InterventionSummary[];
  attribution: InterventionAttribution | null;
  loading: boolean;
}

/**
 * The recovery's evidence trail.
 *
 * A case linked to an intervention shows that intervention's grade right beside
 * the money. "Directional only" next to a recovery amount is the honest reading:
 * something moved, and nothing here proves the intervention moved it.
 */
function LinkedInterventionPanel({
  linkedInterventionId,
  interventions,
  attribution,
  loading,
}: LinkedInterventionPanelProps) {
  if (linkedInterventionId === null) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
          Linked intervention
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-surface-300">
          Not linked. This case was collected directly, so no vendor or process
          change is being credited with it.
        </p>
      </div>
    );
  }

  const summary = interventions.find((row) => row.id === linkedInterventionId);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Linked intervention
      </h3>
      <p className="mt-3 text-sm text-surface-200">
        {summary ? `${summary.providerName} - ${summary.label}` : linkedInterventionId}
      </p>

      {loading ? (
        <p className="mt-3 text-xs text-surface-500">
          Reading that intervention's measurement.
        </p>
      ) : attribution === null ? (
        <p className="mt-3 text-sm leading-relaxed text-surface-300">
          This intervention has not been measured, so the recovery cannot carry an
          attribution grade. Nothing here claims the change caused the collection.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${GRADE_CLASSES[attribution.grade]}`}
          >
            {GRADE_LABEL[attribution.grade]}
          </span>
          <p className="text-sm leading-relaxed text-surface-300">
{GRADE_EXPLANATION[attribution.grade]}
          </p>
          <p className="text-sm leading-relaxed text-surface-400">
            {attribution.headline}
          </p>
        </div>
      )}
    </div>
  );
}
