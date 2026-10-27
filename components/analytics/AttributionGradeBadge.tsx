import { GRADE_CLASSES, GRADE_LABEL } from "@/lib/interventionDisplay";
import type { AttributionGrade } from "@/lib/types/interventions";

/**
 * The grade, and nothing else. It is rendered next to every bridge because the
 * bridge on its own reads as a result. The badge carries the word; the page
 * carries the caveats.
 */
export default function AttributionGradeBadge({
  grade,
}: {
  grade: AttributionGrade;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${GRADE_CLASSES[grade]}`}
      title="What this measurement can and cannot support"
    >
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.5a.75.75 0 10-1.5 0v4.25c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6.5z"
          clipRule="evenodd"
        />
      </svg>
      {GRADE_LABEL[grade]}
    </span>
  );
}
