import { RISK_BADGE_CLASSES } from "@/lib/constants/styling";
import type { RiskLevel } from "@/lib/types/acquisition";

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${RISK_BADGE_CLASSES[level]}`}>
      {level}
    </span>
  );
}
