import AcquisitionHealthPanel from "@/components/analytics/AcquisitionHealthPanel";
import AcquisitionMeasurementWindows from "@/components/analytics/AcquisitionMeasurementWindows";
import AcquisitionValueCreation from "@/components/analytics/AcquisitionValueCreation";
import AcquisitionVarianceTable from "@/components/analytics/AcquisitionVarianceTable";
import type { AcquisitionReport } from "@/lib/types/acquisitionIntelligence";

import {
  bandClasses,
  bandLabel,
  formatDate,
  formatMonthsSettled,
} from "@/lib/acquisitionIntelligenceDisplay";

/**
 * One acquisition in full.
 *
 * Assembled here rather than in the page so the page can stay a portfolio view —
 * which deals exist, which need attention — and this file can stay a single
 * deal's story: what was underwritten, what happened, what it was worth.
 */

interface AcquisitionDealSectionProps {
  report: AcquisitionReport;
}

export default function AcquisitionDealSection({ report }: AcquisitionDealSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{report.targetName}</h2>
          <p className="mt-1 text-sm text-surface-400">
            {[report.industry, report.geography].filter(Boolean).join(" · ") ||
              "Sector not recorded"}
            {" — closed "}
            {formatDate(report.closedAt)}
          </p>
          <p className="mt-1 text-xs text-surface-500">
            {formatMonthsSettled(report.monthsSinceClose)}
          </p>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${bandClasses(report.health.band)}`}
        >
          {bandLabel(report.health.band)}
        </div>
      </div>

      <AcquisitionHealthPanel report={report} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AcquisitionValueCreation valueCreation={report.valueCreation} />
        <AcquisitionMeasurementWindows periods={report.periods} />
      </div>

      <AcquisitionVarianceTable variances={report.variances} />
    </section>
  );
}
