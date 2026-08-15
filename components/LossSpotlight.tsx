"use client";
import { useEffect, useMemo, useState } from "react";

type CashFlowResponse = {
  cashIn: number;
  cashOut: number;
  realCashFlow: number;
};

type LeakageScoreResponse = {
  score: number;
  signal: string;
  totalLeakage: number;
  breakdown: {
    uncollectedRevenue: number;
    underpricedServices: number;
    laborInefficiency: number;
  };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LossSpotlight({
  companyId,
  companyLabel,
  lossThresholdDollars = 10000,
  countdownSeconds = 60,
}: {
  companyId: string;
  companyLabel?: string;
  lossThresholdDollars?: number;
  countdownSeconds?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [leakage, setLeakage] = useState<LeakageScoreResponse | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const netLossDollars = useMemo(() => {
    const n = cashFlow?.realCashFlow ?? 0;
    return n < 0 ? Math.abs(n) : 0;
  }, [cashFlow]);

  const isLossOverThreshold = (cashFlow?.realCashFlow ?? 0) <= -Math.abs(lossThresholdDollars);

  useEffect(() => {
    let cancelled = false;

    async function fetchJsonWithTimeout(url: string) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const text = await res.text();
        let parsed: unknown = undefined;
        if (text) { try { parsed = JSON.parse(text); } catch { /* ignore */ } }
        return { ok: res.ok, json: parsed };
      } finally { clearTimeout(timeout); }
    }

    async function load() {
      setLoading(true);
      setError(null);
      setCashFlow(null);
      setLeakage(null);

      if (!companyId) { setError("No company selected"); setLoading(false); return; }

      try {
        const [cashResult, leakageResult] = await Promise.allSettled([
          fetchJsonWithTimeout(`/api/cash-flow/${encodeURIComponent(companyId)}`),
          fetchJsonWithTimeout(`/api/leakage-score/${encodeURIComponent(companyId)}`),
        ]);

        if (cancelled) return;

        const cashOk = cashResult.status === "fulfilled" && cashResult.value.ok && cashResult.value.json;
        if (cashOk) setCashFlow(cashResult.value.json as CashFlowResponse);
        else setError("Couldn't load cash-flow data.");

        const leakageOk = leakageResult.status === "fulfilled" && leakageResult.value.ok && leakageResult.value.json;
        if (leakageOk) setLeakage(leakageResult.value.json as LeakageScoreResponse);
      } catch {
        if (!cancelled) setError("Failed to load loss spotlight");
      } finally { if (!cancelled) setLoading(false); }
    }

    load();
    return () => { cancelled = true; };
  }, [companyId]);

  useEffect(() => {
    if (loading) return;
    if (!isLossOverThreshold) { setTriggered(false); setSecondsLeft(countdownSeconds); return; }
    setTriggered(true);
    setSecondsLeft(countdownSeconds);
    const startAt = Date.now();
    const tick = () => { setSecondsLeft(Math.max(0, countdownSeconds - Math.floor((Date.now() - startAt) / 1000))); };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [loading, isLossOverThreshold, countdownSeconds]);

  if (loading) return (
    <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-6 shadow-xl shadow-black/20">
      <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Contractor Spotlight</p>
      <p className="mt-2 text-sm text-surface-300">Analyzing loss signals&hellip;</p>
    </div>
  );

  if (error) return (
    <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 shadow-xl shadow-black/20">
      <p className="text-xs uppercase tracking-[0.24em] text-red-200">Contractor Spotlight</p>
      <p className="mt-2 text-sm text-red-200">{error}</p>
    </div>
  );

  if (!isLossOverThreshold) return (
    <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-6 shadow-xl shadow-black/20">
      <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Contractor Spotlight</p>
      <h3 className="mt-2 text-lg font-semibold text-white">No &ge; {formatMoney(lossThresholdDollars)} loss detected</h3>
      <p className="mt-2 text-sm text-surface-400">Net cash flow: {cashFlow ? formatMoney(cashFlow.realCashFlow) : "N/A"}</p>
    </div>
  );

  const showDetail = triggered && secondsLeft === 0;

  return (
    <div className="rounded-3xl border border-surface-800 bg-surface-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-surface-400">Contractor Spotlight</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{companyLabel ?? "Selected Company"} is losing {formatMoney(netLossDollars)}+</h3>
          <p className="mt-1 text-sm text-surface-400">Detected loss signals from cash-flow + leakage model.</p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-950/70 px-4 py-2">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Countdown</p>
          <p className="mt-1 text-2xl font-semibold text-red-200">{showDetail ? "Now" : `${secondsLeft}s`}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-surface-800 bg-surface-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Uncollected revenue</p>
          <p className="mt-2 text-xl font-semibold text-white">{leakage ? formatMoney(leakage.breakdown.uncollectedRevenue) : "N/A"}</p>
          <p className="mt-1 text-sm text-surface-400">{showDetail ? "Collections lag" : "Loading details&hellip;"}</p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Underpriced services</p>
          <p className="mt-2 text-xl font-semibold text-white">{leakage ? formatMoney(leakage.breakdown.underpricedServices) : "N/A"}</p>
          <p className="mt-1 text-sm text-surface-400">{showDetail ? "Margin leakage" : "Loading details&hellip;"}</p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">Labor inefficiency</p>
          <p className="mt-2 text-xl font-semibold text-white">{leakage ? formatMoney(leakage.breakdown.laborInefficiency) : "N/A"}</p>
          <p className="mt-1 text-sm text-surface-400">{showDetail ? "Negative profit jobs" : "Loading details&hellip;"}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-surface-800 bg-surface-950/70 p-4">
        <p className="text-sm text-surface-300">
          Leakage model signal: <span className="font-semibold text-surface-100">{leakage?.signal ?? "N/A"}</span>
          {leakage ? ` (score ${leakage.score})` : ""}
        </p>
        <div className="mt-3 h-px w-full bg-surface-800" />
        <p className="mt-3 text-sm leading-6 text-surface-400">
          {showDetail
            ? "In under a minute, hand your contractor these three levers: collections, pricing, and labor efficiency - then route each lever into a recovery action."
            : "Preparing the contractor handoff&hellip; details will appear when the countdown finishes."}
        </p>
      </div>
    </div>
  );
}
