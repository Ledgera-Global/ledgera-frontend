"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/api/client";

type StressSignal = {
  key: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
};

type StressIndexData = {
  companyId: string;
  generatedAt: string;
  score: number;
  level: "CALM" | "MODERATE" | "ELEVATED" | "CRITICAL";
  headline: string;
  signals: StressSignal[];
  drivers: StressSignal[];
};

const FALLBACK: StressIndexData = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  score: 42,
  level: "MODERATE",
  headline:
    "Moderate pressure. A few operational areas deserve attention this week.",
  signals: [
    { key: "cashRunway", label: "Cash Runway", score: 75, weight: 0.28, detail: "3.2 months of cash runway" },
    { key: "payrollCoverage", label: "Payroll Coverage", score: 45, weight: 0.28, detail: "Cash covers payroll 1.9x" },
    { key: "arPressure", label: "Receivables Pressure", score: 70, weight: 0.16, detail: "26% of receivables at risk" },
    { key: "techEfficiency", label: "Team Efficiency", score: 25, weight: 0.12, detail: "Average tech efficiency 78/100" },
    { key: "profitVariability", label: "Profit Variability", score: 15, weight: 0.1, detail: "11% of recent jobs below 25% margin" },
    { key: "marginPressure", label: "Margin Pressure", score: 30, weight: 0.06, detail: "EBITDA margin 16.4%" },
  ],
  drivers: [
    { key: "cashRunway", label: "Cash Runway", score: 75, weight: 0.28, detail: "3.2 months of cash runway" },
    { key: "arPressure", label: "Receivables Pressure", score: 70, weight: 0.16, detail: "26% of receivables at risk" },
    { key: "payrollCoverage", label: "Payroll Coverage", score: 45, weight: 0.28, detail: "Cash covers payroll 1.9x" },
  ],
};

const LEVEL_STYLES: Record<StressIndexData["level"], { badge: string; accent: string }> = {
  CALM: { badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/20", accent: "text-emerald-400" },
  MODERATE: { badge: "bg-amber-400/20 text-amber-300 border-amber-400/20", accent: "text-amber-400" },
  ELEVATED: { badge: "bg-orange-400/20 text-orange-300 border-orange-400/20", accent: "text-orange-400" },
  CRITICAL: { badge: "bg-red-400/20 text-red-300 border-red-400/20", accent: "text-red-400" },
};

function scoreColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 25) return "#eab308";
  return "#22c55e";
}

function Gauge({ score, size = 150 }: { score: number; size?: number }) {
  const s = 10;
  const r = (size - s) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={s} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={s}
        strokeDasharray={`${filled} ${c - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="40" fontWeight="700">
        {score}
      </text>
      <text x="50%" y="68%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="12">
        / 100
      </text>
    </svg>
  );
}

type Props = { companyId: string };

export default function FounderStressIndexCard({ companyId }: Props) {
  const [data, setData] = useState<StressIndexData | null>(null);
  const [loading, setLoading] = useState(true);

  const url = useMemo(
    () => `/api/stress-index/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchJson<StressIndexData>(url, FALLBACK);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  const d = data ?? FALLBACK;
  const levelStyle = LEVEL_STYLES[d.level] ?? LEVEL_STYLES.MODERATE;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          Founder Stress Index
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Founder Stress Index
        </h2>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-3/4 rounded bg-surface-800" />
            <div className="h-4 w-full rounded bg-surface-800" />
            <div className="h-32 w-full rounded bg-surface-800" />
          </div>
        ) : (
          <>
            {/* Score + headline */}
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <Gauge score={d.score} />
              <div>
                <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${levelStyle.badge}`}>
                  {d.level}
                </span>
                <p className="mt-3 text-sm leading-6 text-surface-300">{d.headline}</p>
                <p className="mt-2 text-xs text-surface-500">
                  0 = calm &middot; 100 = crisis &middot; generated {new Date(d.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Signal breakdown */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-surface-400">
                What is driving the number
              </h4>
              <div className="space-y-3">
                {d.signals.map((signal) => (
                  <div key={signal.key} className="rounded-xl border border-white/5 bg-surface-900/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-surface-200">{signal.label}</p>
                        <p className="mt-0.5 truncate text-xs text-surface-500">{signal.detail}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-white">{signal.score}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-surface-800">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${signal.score}%`, backgroundColor: scoreColor(signal.score) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top drivers */}
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-surface-400">
                Top pressure points
              </h4>
              <div className="flex flex-wrap gap-2">
                {d.drivers.map((driver) => (
                  <span key={driver.key} className="rounded-full bg-surface-900/60 px-3 py-1 text-xs text-surface-300">
                    {driver.label} <span className={levelStyle.accent}>{driver.score}</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
