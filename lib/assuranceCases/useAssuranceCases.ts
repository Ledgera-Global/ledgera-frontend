"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ASSURANCE_CASES_DEMO,
} from "@/lib/data/assuranceCasesDemo";
import {
  combineDataSources,
  readSourced,
  type DataSource,
} from "@/lib/dataProvenance";
import type {
  AssuranceCase,
  AssuranceCaseListResponse,
  AssuranceSyncResult,
  CaseUpdateInput,
} from "@/lib/types/assuranceCases";
import type {
  InterventionAttribution,
  InterventionListResponse,
} from "@/lib/types/interventions";

/**
 * Data access for the assurance case list.
 *
 * Three things this hook refuses to do:
 *
 * 1. Substitute the fixture for a failed live read. `source` is `unavailable`
 *    when the backend refuses, and the page says so.
 * 2. Keep a closed case looking open. After a successful update the list is
 *    rebuilt from the response, not patched locally, so what is shown is what
 *    was stored.
 * 3. Report a recovery it cannot evidence. The linked intervention's grade is
 *    read here so the detail panel can show "directional only" next to an
 *    amount before the operator tries to credit it.
 */

const COMPANY_ID = "companyA";

export interface AssuranceCasesState {
  list: AssuranceCaseListResponse;
  selectedId: string | null;
  selected: AssuranceCase | null;
  /** Interventions available to link a case to. Empty when unreadable. */
  interventions: InterventionListResponse;
  /** Attribution for the selected case's linked intervention, if any. */
  linkedAttribution: InterventionAttribution | null;
  linkedAttributionLoading: boolean;
  source: DataSource;
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  saveError: string | null;
  syncNote: string | null;
  select: (id: string | null) => void;
  updateCase: (caseId: string, input: CaseUpdateInput) => Promise<boolean>;
  sync: () => Promise<void>;
  clearSaveError: () => void;
  clearSyncNote: () => void;
}

const EMPTY_INTERVENTIONS: InterventionListResponse = {
  companyId: COMPANY_ID,
  interventions: [],
};

export function useAssuranceCases(): AssuranceCasesState {
  const [list, setList] = useState<AssuranceCaseListResponse>(ASSURANCE_CASES_DEMO);
  const [selectedId, setSelectedId] = useState<string | null>(
    ASSURANCE_CASES_DEMO.cases[0]?.id ?? null
  );
  const [interventions, setInterventions] =
    useState<InterventionListResponse>(EMPTY_INTERVENTIONS);
  const [linkedAttribution, setLinkedAttribution] =
    useState<InterventionAttribution | null>(null);
  const [linkedAttributionLoading, setLinkedAttributionLoading] = useState(false);
  const [listSource, setListSource] = useState<DataSource>("demo");
  const [interventionSource, setInterventionSource] = useState<DataSource>("demo");
  const [attributionSource, setAttributionSource] = useState<DataSource>("live");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const loadList = useCallback(async (): Promise<void> => {
    const read = await readSourced<AssuranceCaseListResponse>(
      `/api/assurance-cases/${COMPANY_ID}`
    );
    setListSource(read.source);
    if (read.data !== null) {
      setList(read.data);
      setSelectedId((current) => {
        if (current !== null && read.data!.cases.some((row) => row.id === current)) {
          return current;
        }
        return read.data!.cases[0]?.id ?? null;
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadList();
      if (cancelled) return;
      const read = await readSourced<InterventionListResponse>(
        `/api/interventions/${COMPANY_ID}`
      );
      if (cancelled) return;
      setInterventionSource(read.source);
      if (read.data !== null) setInterventions(read.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  const selected = useMemo(
    () => list.cases.find((row) => row.id === selectedId) ?? null,
    [list.cases, selectedId]
  );

  const linkedInterventionId = selected?.linkedInterventionId ?? null;

  useEffect(() => {
    if (linkedInterventionId === null) {
      setLinkedAttribution(null);
      setAttributionSource("live");
      return;
    }
    let cancelled = false;
    setLinkedAttributionLoading(true);
    (async () => {
      const read = await readSourced<InterventionAttribution>(
        `/api/interventions/${COMPANY_ID}/${linkedInterventionId}/attribution`
      );
      if (cancelled) return;
      setAttributionSource(read.source);
      // Null means "not measured", which the panel states plainly. Never a
      // different intervention's bridge.
      setLinkedAttribution(read.data);
      setLinkedAttributionLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [linkedInterventionId]);

  const select = useCallback((id: string | null) => {
    setSaveError(null);
    setSelectedId(id);
  }, []);

  const updateCase = useCallback(
    async (caseId: string, input: CaseUpdateInput): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      try {
        const response = await fetch(
          `/api/assurance-cases/${COMPANY_ID}/${caseId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string; detail?: string }
            | null;
          setSaveError(
            payload?.detail ??
              payload?.error ??
              `The case was not saved (HTTP ${response.status}).`
          );
          return false;
        }

        const updated = (await response.json()) as AssuranceCase;
        setList((current) => ({
          ...current,
          cases: current.cases.map((row) => (row.id === updated.id ? updated : row)),
          count: current.cases.length,
        }));
        // The list's own totals move when a case closes, so re-read rather than
        // trying to recompute open-at-stake locally.
        await loadList();
        return true;
      } catch {
        setSaveError("The case was not saved. The backend did not respond.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadList]
  );

  const sync = useCallback(async () => {
    setSyncing(true);
    setSyncNote(null);
    try {
      const response = await fetch(`/api/assurance-cases/${COMPANY_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookbackDays: 90 }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        setSyncNote(
          payload?.detail ??
            payload?.error ??
            `The check did not run (HTTP ${response.status}). Nothing changed.`
        );
        return;
      }

      const result = (await response.json()) as AssuranceSyncResult;
      setSyncNote(describeSync(result));
      await loadList();
    } catch {
      setSyncNote("The check did not run. The backend did not respond.");
    } finally {
      setSyncing(false);
    }
  }, [loadList]);

  const clearSaveError = useCallback(() => setSaveError(null), []);
  const clearSyncNote = useCallback(() => setSyncNote(null), []);

  return {
    list,
    selectedId,
    selected,
    interventions,
    linkedAttribution,
    linkedAttributionLoading,
    source: combineDataSources([
      { data: null, source: listSource, status: null },
      { data: null, source: interventionSource, status: null },
      { data: null, source: attributionSource, status: null },
    ]),
    loading,
    saving,
    syncing,
    saveError,
    syncNote,
    select,
    updateCase,
    sync,
    clearSaveError,
    clearSyncNote,
  };
}

/** What a run actually did, in the terms an operator cares about. */
function describeSync(result: AssuranceSyncResult): string {
  const parts = [
    `${result.findingsDetected} finding${result.findingsDetected === 1 ? "" : "s"} across ${result.evaluatedJobs} jobs`,
    `${result.opened} new`,
    `${result.refreshed} seen again`,
    `${result.unchanged} unchanged`,
  ];
  const base = `Checked ${parts.join(", ")}.`;
  return result.truncated
    ? `${base} Only part of the ledger was examined, so this is not the full picture.`
    : base;
}
