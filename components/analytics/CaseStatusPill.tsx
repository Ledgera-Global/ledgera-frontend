import { STATUS_CLASSES, STATUS_LABEL } from "@/lib/assuranceCaseDisplay";
import type { AssuranceCaseStatus } from "@/lib/types/assuranceCases";

/**
 * A case's state, named rather than implied.
 *
 * It says "Recovered", never "Closed". A reader skimming a board pack reads
 * "closed" as "handled", and two of the three closed states mean the money was
 * not collected.
 */
export default function CaseStatusPill({
  status,
}: {
  status: AssuranceCaseStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
