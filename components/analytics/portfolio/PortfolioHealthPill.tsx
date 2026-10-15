import { HEALTH_CLASSES, HEALTH_LABELS } from "@/lib/portfolioOsDisplay";
import type { PortfolioHealth } from "@/lib/types/portfolioOs";

/**
 * The health badge for one company.
 *
 * A pill rather than a coloured number, because health is a band the backend
 * assigned from a named rule ("strong" is top third by margin, within five
 * points of median is watch), not a number the reader should try to infer from
 * colour alone. The label is always written out.
 */
export default function PortfolioHealthPill({
  health,
}: {
  health: PortfolioHealth;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${HEALTH_CLASSES[health]}`}
    >
      {HEALTH_LABELS[health]}
    </span>
  );
}
