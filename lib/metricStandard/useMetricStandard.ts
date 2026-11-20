"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  combineDataSources,
  readSourced,
  type DataSource,
  type SourcedRead,
} from "@/lib/dataProvenance";
import type {
  LatestMetricRead,
  LatestMetricResponse,
  MetricPolicyResponse,
  MetricSnapshot,
  SnapshotVerification,
} from "@/lib/types/metricStandard";

/**
 * Data access for the metric standard screen.
 *
 * The distinction this hook exists to preserve: a metric with no quote on
 * record is a different thing from a metric whose quote could not be read.
 * The first means the platform has published nothing for this company and the
 * screen should say so plainly. The second means the screen does not know, and
 * printing "nothing on record" there would be a false statement about the
 * customer's own books. They are separate states, not one null.
 */

/** The company this screen reads. One place, so a selector has one place to change. */
const COMPANY_ID = "companyA";

export type QuoteState =
  /** No quote on record for this metric; `detail` carries the reason given. */
  | "none"
  /** A sealed snapshot was returned. */
  | "quoted"
  /** The read failed, so nothing is known either way. */
  | "unreadable";

export interface MetricStandardState {
  policy: MetricPolicyResponse;
  selectedId: string | null;
  selected: MetricPolicyResponse["policy"][number] | null;
  snapshot: MetricSnapshot | null;
  verification: SnapshotVerification | null;
  quoteState: QuoteState;
  quoteDetail: string | null;
  storage: string;
  source: DataSource;
  loading: boolean;
  loadingQuote: boolean;
  select: (metricId: string) => void;
}

const EMPTY_POLICY: MetricPolicyResponse = { policy: [], storage: "" };

export function useMetricStandard(): MetricStandardState {
  const [policy, setPolicy] = useState<MetricPolicyResponse>(EMPTY_POLICY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<MetricSnapshot | null>(null);
  const [verification, setVerification] = useState<SnapshotVerification | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>("none");
  const [quoteDetail, setQuoteDetail] = useState<string | null>(null);
  const [storage, setStorage] = useState("");
  const [policyRead, setPolicyRead] = useState<SourcedRead<unknown>>({
    data: null,
    source: "unavailable",
    status: null,
  });
  const [quoteRead, setQuoteRead] = useState<SourcedRead<unknown>>({
    data: null,
    source: "unavailable",
    status: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const read = await readSourced<MetricPolicyResponse>(
        "/api/metric-standard/policy"
      );
      if (cancelled) return;

      setPolicyRead({ data: null, source: read.source, status: read.status });
      if (read.data !== null) {
        setPolicy(read.data);
        setStorage(read.data.storage);
        setSelectedId(read.data.policy[0]?.definition.id ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadQuote = useCallback(async (metricId: string): Promise<void> => {
    setLoadingQuote(true);

    const read = await readSourced<LatestMetricResponse | LatestMetricRead>(
      `/api/metric-standard/${COMPANY_ID}/metrics/${encodeURIComponent(metricId)}`
    );

    setQuoteRead({ data: null, source: read.source, status: read.status });

    if (read.data === null) {
      // Unknown, not empty. The previous metric's figure is cleared first:
      // leaving it on screen beneath a new heading would show one metric's
      // number as another's.
      setSnapshot(null);
      setVerification(null);
      setQuoteState("unreadable");
      setQuoteDetail(null);
      setLoadingQuote(false);
      return;
    }

    if (isAbsent(read.data)) {
      setSnapshot(null);
      setVerification(null);
      setQuoteState("none");
      setQuoteDetail(read.data.detail);
      setLoadingQuote(false);
      return;
    }

    setSnapshot(read.data.snapshot);
    setVerification(read.data.verification);
    setStorage(read.data.storage);
    setQuoteState("quoted");
    setQuoteDetail(null);
    setLoadingQuote(false);
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    void loadQuote(selectedId);
  }, [selectedId, loadQuote]);

  const selected = useMemo(
    () => policy.policy.find((entry) => entry.definition.id === selectedId) ?? null,
    [policy.policy, selectedId]
  );

  const select = useCallback((metricId: string) => {
    setSelectedId(metricId);
  }, []);

  const source = combineDataSources([policyRead, quoteRead]);

  return {
    policy,
    selectedId,
    selected,
    snapshot,
    verification,
    quoteState,
    quoteDetail,
    storage,
    source,
    loading,
    loadingQuote,
    select,
  };
}

/** Narrows the union: a payload carrying `found: false` is a stated absence. */
function isAbsent(
  payload: LatestMetricResponse | LatestMetricRead
): payload is LatestMetricRead {
  return "found" in payload && payload.found === false;
}
