"use client";
import { useState } from "react";
import { closeOutHint, formatUsd } from "@/lib/assuranceCaseDisplay";
import type { InterventionSummary } from "@/lib/types/interventions";

import type {
  AssuranceCase,
  AssuranceCaseStatus,
  CaseUpdateInput,
} from "@/lib/types/assuranceCases";

/**
 * The form that turns a finding into a decision.
 *
 * The shape of this form is the policy. A note is mandatory for every closure
 * because "closed" without a sentence is indistinguishable from "ignored". A
 * recovery needs an amount and cannot exceed what was at stake. Written-off and
 * dismissed cannot carry a recovery at all, because a case that says both
 * "we got nothing" and "we got $400" is not a record anyone can rely on.
 *
 * These rules are restated here as guidance, but the backend is the authority
 * and its refusal is displayed verbatim rather than reformatted.
 */

const MIN_NOTE_LENGTH = 12;

interface CaseCloseOutFormProps {
  caseRow: AssuranceCase;
  interventions: readonly InterventionSummary[];
  saving: boolean;
  error: string | null;
  onSubmit: (input: CaseUpdateInput) => Promise<boolean>;
  onDismissError: () => void;
}

export default function CaseCloseOutForm({
  caseRow,
  interventions,
  saving,
  error,
  onSubmit,
  onDismissError,
}: CaseCloseOutFormProps) {
  const [status, setStatus] = useState<AssuranceCaseStatus>(caseRow.status);
  const [note, setNote] = useState(caseRow.resolutionNote ?? "");
  const [recoveredDollars, setRecoveredDollars] = useState(
    caseRow.recoveredCents > 0 ? String(caseRow.recoveredCents / 100) : ""
  );
  const [linkedInterventionId, setLinkedInterventionId] = useState(
    caseRow.linkedInterventionId ?? ""
  );

  const closes = status === "recovered" || status === "written_off" || status === "dismissed";
  const noteTooShort = closes && note.trim().length < MIN_NOTE_LENGTH;
  const recoveredCents = parseDollarsToCents(recoveredDollars);
  const needsAmount = status === "recovered";
  const amountMissing = needsAmount && recoveredCents <= 0;
  const amountTooLarge =
    needsAmount && recoveredCents > caseRow.amountCents && caseRow.amountCents > 0;

  const blocked = saving || noteTooShort || amountMissing || amountTooLarge;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: CaseUpdateInput = {
      status,
      resolutionNote: note.trim() === "" ? null : note.trim(),
      recoveredCents: needsAmount ? recoveredCents : 0,
      linkedInterventionId:
        linkedInterventionId === "" ? null : linkedInterventionId,
    };
    await onSubmit(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-surface-900/40 p-6"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
        Record a decision
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-surface-300">
        At stake: <span className="font-mono text-white">{formatUsd(caseRow.amountCents)}</span>.
        Nothing leaves the working list until a state is chosen and the note says
        what happened.
      </p>

      <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-surface-400">
        State
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as AssuranceCaseStatus)
          }
          className="mt-2 w-full rounded-xl border border-white/15 bg-surface-950 px-3 py-2 text-sm text-surface-100 focus:border-brand-400/60 focus:outline-none"
        >
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In progress</option>
          <option value="recovered">Recovered</option>
          <option value="written_off">Written off</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </label>

      {needsAmount && (
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-surface-400">
          Amount recovered (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={recoveredDollars}
            onChange={(event) => setRecoveredDollars(event.target.value)}
            placeholder="0.00"
            className="mt-2 w-full rounded-xl border border-white/15 bg-surface-950 px-3 py-2 font-mono text-sm text-surface-100 focus:border-brand-400/60 focus:outline-none"
          />
        </label>
      )}

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-surface-400">
        What happened
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Applied payment 5512 to invoice 7690 on 8 October."
          className="mt-2 w-full rounded-xl border border-white/15 bg-surface-950 px-3 py-2 text-sm leading-relaxed text-surface-100 focus:border-brand-400/60 focus:outline-none"
        />
      </label>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-surface-400">
        Linked intervention
        <select
          value={linkedInterventionId}
          onChange={(event) => setLinkedInterventionId(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-surface-950 px-3 py-2 text-sm text-surface-100 focus:border-brand-400/60 focus:outline-none"
        >
          <option value="">Not linked to an intervention</option>
          {interventions.map((row) => (
            <option key={row.id} value={row.id}>
              {row.providerName} - {row.label}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs leading-relaxed text-surface-500">
        Link an intervention when the recovery came from a vendor or process
        change. The credit then carries that intervention's attribution
        grade, so a directional observation cannot be presented as a measured
        result.
      </p>

      {closes && (
        <p className="mt-3 rounded-xl border border-white/10 bg-surface-950/50 p-3 text-xs leading-relaxed text-surface-300">
          {closeOutHint(status)}
        </p>
      )}

      {noteTooShort && (
        <p className="mt-3 text-xs text-amber-300">
          A note of at least {MIN_NOTE_LENGTH} characters is required to close a
          case.
        </p>
      )}
      {amountMissing && (
        <p className="mt-3 text-xs text-amber-300">
          Record how much was actually recovered, or choose a different state.
        </p>
      )}
      {amountTooLarge && (
        <p className="mt-3 text-xs text-rose-300">
          The recovered amount cannot exceed the {formatUsd(caseRow.amountCents)}{" "}
          at stake.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={blocked}
          className="rounded-xl border border-brand-400/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving" : "Save case"}
        </button>
        {error && (
          <button
            type="button"
            onClick={onDismissError}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-surface-300 transition-colors hover:border-white/30"
          >
            Dismiss
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-relaxed text-rose-100"
        >
          {error}
        </p>
      )}
    </form>
  );
}

/** Dollars typed by a human, converted to the integer cents the API takes. */
function parseDollarsToCents(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}
