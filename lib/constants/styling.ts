import type { RiskLevel, ValuationReadiness } from "@/lib/types/acquisition";

// ─── Design System Constants ──────────────────────────────────────────
// Institutional-grade design tokens for the Ledgera platform

// ─── Risk Level Colors ──────────────────────────────────────────────────

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  MODERATE: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  HIGH: "bg-red-400/10 text-red-200 border-red-400/20",
  CRITICAL: "bg-rose-400/10 text-rose-200 border-rose-400/20",
};

// ─── Score Thresholds ───────────────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  HIGH: 70,
  MODERATE: 40,
} as const;

export const GAUGE_COLORS = {
  HIGH: "#c4956a",
  MODERATE: "#d97706",
  LOW: "#ef4444",
} as const;

export function gaugeColor(score: number): string {
  return score >= SCORE_THRESHOLDS.HIGH
    ? GAUGE_COLORS.HIGH
    : score >= SCORE_THRESHOLDS.MODERATE
    ? GAUGE_COLORS.MODERATE
    : GAUGE_COLORS.LOW;
}

// ─── Text Colors ────────────────────────────────────────────────────────

export function scoreTextColor(score: number): string {
  return score >= SCORE_THRESHOLDS.HIGH
    ? "text-brand-400"
    : score >= SCORE_THRESHOLDS.MODERATE
    ? "text-amber-400"
    : "text-red-400";
}

export function signalDotColor(type: "strength" | "concern" | "neutral"): string {
  switch (type) {
    case "strength": return "bg-brand-400";
    case "concern": return "bg-red-400";
    case "neutral": return "bg-amber-400";
  }
}

export function magnitudeColor(magnitude: number): string {
  return magnitude > 0 ? "text-brand-400" : magnitude < 0 ? "text-red-400" : "text-amber-400";
}

// ─── Readiness Labels ───────────────────────────────────────────────────

export function readinessLabel(level: ValuationReadiness): string {
  switch (level) {
    case "high": return "High Readiness";
    case "medium": return "Medium Readiness";
    case "low": return "Low Readiness";
  }
}

export function acquisitionScoreLabel(score: number): string {
  return score >= 70 ? "Investor Ready" : "Needs Improvement";
}

export function acquisitionScoreColor(score: number): string {
  return score >= 70
    ? "bg-brand-400/10 text-brand-200 border-brand-400/20"
    : "bg-amber-400/10 text-amber-200 border-amber-400/20";
}

// ─── Navigation ─────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Analytics", href: "/analytics" },
  { label: "Executive", href: "/analytics/executive" },
  { label: "Institutional Risk", href: "/analytics/institutional-risk" },
  { label: "Lender Readiness", href: "/analytics/lender-readiness" },
  { label: "Value Growth", href: "/analytics/value-growth" },
  { label: "Missed Calls", href: "/analytics/missed-calls" },
  { label: "Acquisition", href: "/analytics/acquisition" },
  { label: "Engines", href: "/analytics/engines" },
];
