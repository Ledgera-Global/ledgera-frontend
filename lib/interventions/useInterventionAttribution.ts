"use client";
import { useCallback, useEffect, useState } from "react";

import {
  INTERVENTIONS_DEMO_LIST,
  demoAttributionFor,
} from "@/lib/data/interventionsDemo";
import {
  combineDataSources,
  readSourced,
  type DataSource,
} from "@/lib/dataProvenance";
import type {
  InterventionAttribution,
  InterventionListResponse,
  InterventionSummary,
} from "@/lib/types/interventions";

/**
 * Data access for the intervention attribution screen.
 *
 * Selection lives here so the page never renders an attribution for a window it
 * is not displaying. A saved date reloads both the row and the attribution,
 * because changing a treatment end changes every number derived from it.
 *
 * `source` is not decoration. The attributed figures are the most confidently
 * misread numbers in the product - a reader who believes a lift is theirs will
 * act on it - so the page is told whether the data behind it is the customer's
 * own, the bundled example, or unreadable. Fixtures are only ever rendered
 * under a `demo` label, never as a silent substitute.
 */
export interface InterventionAttributionState {
  list: InterventionListResponse;
  selectedId: string | null;
  /**
   * Null when the selected intervention has no attribution available. The page
   * must render that as "nothing recorded", never by keeping the previous
   * intervention's numbers on screen.
   */
  attribution: InterventionAttribution | null;
  source: DataSource;
  loading: boolean;
  saving: boolean;
  saveError: string | null;
  select: (id: string) => void;
  saveTreatmentEnd: (treatmentEnd: string | null) => Promise<void>;
  clearSaveError: () => void;
}

const COMPANY_ID = "companyA";
const FIRST_DEMO_ID = INTERVENTIONS_DEMO_LIST.interventions[0]?.id ?? "";

export function useInterventionAttribution(): InterventionAttributionState {
  const [list, setList] = useState<InterventionListResponse>(INTERVENTIONS_DEMO_LIST);
  const [selectedId, setSelectedId] = useState<string | null>(
    INTERVENTIONS_DEMO_LIST.interventions[0]?.id ?? null
  );
  const [attribution, setAttribution] = useState<InterventionAttribution | null>(
    () => demoAttributionFor(FIRST_DEMO_ID)
  );
  const [listSource, setListSource] = useState<DataSource>("demo");
  const [attributionSource, setAttributionSource] = useState<DataSource>("demo");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const read = await readSourced<InterventionListResponse>(
        `/api/interventions/${COMPANY_ID}`
      );
      if (cancelled) return;
      setListSource(read.source);
      if (read.data !== null) {
        setList(read.data);
        const firstId = read.data.interventions[0]?.id ?? null;
        setSelectedId((current) => current ?? firstId);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    let cancelled = false;
    (async () => {
      const read = await readSourced<InterventionAttribution>(
        `/api/interventions/${COMPANY_ID}/${selectedId}/attribution`
      );
      if (cancelled) return;
      setAttributionSource(read.source);
      if (read.data !== null) {
        setAttribution(read.data);
        return;
      }
      // Unreadable: fall back to this intervention's own example if there is
      // one, and otherwise to nothing. Never another intervention's bridge.
      setAttribution(demoAttributionFor(selectedId));
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const select = useCallback((id: string) => {
    setSaveError(null);
    setSelectedId(id);
  }, []);

  const saveTreatmentEnd = useCallback(
    async (treatmentEnd: string | null) => {
      if (selectedId === null) return;
      setSaving(true);
      setSaveError(null);
      try {
        const response = await fetch(
          `/api/interventions/${COMPANY_ID}/${selectedId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ treatmentEnd }),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string; detail?: string }
            | null;
          setSaveError(
            payload?.detail ??
              payload?.error ??
              `The window was not saved (HTTP ${response.status}).`
          );
          return;
        }

        const updated = (await response.json()) as InterventionSummary;
        setList((current) => ({
          ...current,
          interventions: current.interventions.map((row) =>
            row.id === updated.id ? updated : row
          ),
        }));

        const refreshed = await readSourced<InterventionAttribution>(
          `/api/interventions/${COMPANY_ID}/${selectedId}/attribution`
        );
        setAttributionSource(refreshed.source);
        setAttribution(refreshed.data ?? demoAttributionFor(selectedId));
      } catch {
        setSaveError("The window was not saved. The backend did not respond.");
      } finally {
        setSaving(false);
      }
    },
    [selectedId]
  );

  const clearSaveError = useCallback(() => setSaveError(null), []);

  return {
    list,
    selectedId,
    attribution,
    source: combineDataSources([
      { data: null, source: listSource, status: null },
      { data: null, source: attributionSource, status: null },
    ]),
    loading,
    saving,
    saveError,
    select,
    saveTreatmentEnd,
    clearSaveError,
  };
}
