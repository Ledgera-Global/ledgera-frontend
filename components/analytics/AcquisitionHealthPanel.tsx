import {
  STATUS_CLASSES,
  STATUS_LABEL,
  bandClasses,
  bandLabel,
  formatPercent,
  statusBarClass,
} from "@/lib/acquisitionIntelligenceDisplay";
import type {
  AcquisitionReport,
  HealthDimension,
} from "@/lib/types/acquisitionIntelligence";

/**
 * The verdict on one acquisition: how much of the case could be graded, what it
 * graded as, and — for every dimension that could not be graded — the reason.
 *
 * The refusal is rendered as prominently as the number. A page that showed only
 * a score, and silently omitted the dimensions behind it, would present a
 * partial picture as a complete one.
 */

interface AcquisitionHealthPanelProps {
  report: AcquisitionReport;
}

/** How far up the bar a dimension's value is drawn. Values above this pin at full. */
const BAR_CEILING_PERCENT = 150;

export default function AcquisitionHealthPanel({ report }: AcquisitionHealthPanelProps) {
  const { score, band, coverage, measuredWeight, dimensions } = report.health;
  const ungraded = dimensions.filter((dimension) => dimension.status === "unknown");

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ScoreRing score={score} />

        <div className="flex-1">
          <div
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${bandClasses(band)}`}
          >
            {bandLabel(band)}
          </div>

          <p className="mt-4 text-base leading-relaxed text-surface-200">
            {report.note}
          </p>

          <p className="mt-3 text-xs text-surface-400">
            {formatPercent(coverage * 100)} of the underwriting is measurable
            ({measuredWeight} of 100 weight).
            {ungraded.length > 0
              ? ` ${ungraded.length} dimension${ungraded.length === 1 ? " is" : "s are"} unmeasured, not passing.`
              : " Every dimension of the case has a basis for comparison."}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
        {dimensions.map((dimension) => (
          <DimensionRow key={dimension.key} dimension={dimension} />
        ))}
      </div>
    </div>
  );
}

/**
 * The headline score.
 *
 * Drawn by hand rather than reused from the shared Gauge, because the shared
 * one requires a number and this one frequently has none. Showing a 0 dial for
 * a deal that simply has not been measured would be the most damaging possible
 * rendering of the honest case.
 */
function ScoreRing({ score }: { score: number | null }) {
  const size = 132;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = score === null ? 0 : Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-800"
          />
          {score !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              className={scoreRingClass(score)}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score === null ? (
            <span className="px-3 text-center text-xs font-semibold uppercase tracking-wider text-surface-400">
              Not yet measurable
            </span>
          ) : (
            <>
              <span className="font-mono text-3xl font-bold text-white">{score}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                of 100
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function scoreRingClass(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-teal-400";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}

function DimensionRow({ dimension }: { dimension: HealthDimension }) {
  const graded = dimension.status !== "unknown";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-surface-100">{dimension.label}</span>
          <span className="text-[11px] text-surface-500">{dimension.weight} of 100</span>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASSES[dimension.status]}`}
        >
          {STATUS_LABEL[dimension.status]}
        </span>
      </div>

      {graded && dimension.value !== null ? (
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-800">
            <div
              className={`h-full rounded-full ${statusBarClass(dimension.status)}`}
              style={{
                width: `${Math.min(100, (dimension.value / BAR_CEILING_PERCENT) * 100)}%`,
              }}
            />
          </div>
          <span className="w-16 shrink-0 text-right font-mono text-sm text-surface-200">
            {formatPercent(dimension.value, 0)}
          </span>
        </div>
      ) : null}

      <p className="mt-1.5 text-xs text-surface-400">
        {graded
          ? dimension.statement
          : (dimension.unavailableReason ?? "No basis for comparison was recorded.")}
      </p>
    </div>
  );
}
