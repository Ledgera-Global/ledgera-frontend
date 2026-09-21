"use client";
import type { ReactNode } from "react";

import type {
    GoalStatus,
    IdeaStatus,
    RequestStatus,
    TaskPriority,
} from "@/lib/internal/workforceTypes";

/**
 * Status indicators and small numeric displays.
 *
 * The tone maps live here, next to the components that use them, so "at risk"
 * is the same amber everywhere it appears. A status colour that means something
 * different on two screens is worse than no colour at all.
 */

export type Tone = "neutral" | "brand" | "positive" | "warning" | "danger" | "info";

const TONE_CLASSES: Record<Tone, string> = {
    neutral: "border-white/10 bg-white/5 text-surface-300",
    brand: "border-brand-400/25 bg-brand-400/10 text-brand-200",
    positive: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    danger: "border-red-400/25 bg-red-400/10 text-red-200",
    info: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
        >
            {children}
        </span>
    );
}

// ─── Status vocabularies ─────────────────────────────────────────────────

const TASK_PRIORITY_TONES: Record<TaskPriority, Tone> = {
    now: "danger",
    normal: "neutral",
    later: "neutral",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
    if (priority === "later") return <Badge tone="neutral">Later</Badge>;
    return (
        <Badge tone={TASK_PRIORITY_TONES[priority]}>
            {priority === "now" ? "Now" : "Normal"}
        </Badge>
    );
}

const GOAL_STATUS_TONES: Record<GoalStatus, Tone> = {
    on_track: "positive",
    at_risk: "warning",
    off_track: "danger",
    done: "info",
};

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
    on_track: "On track",
    at_risk: "At risk",
    off_track: "Off track",
    done: "Done",
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
    return <Badge tone={GOAL_STATUS_TONES[status]}>{GOAL_STATUS_LABELS[status]}</Badge>;
}

const REQUEST_STATUS_TONES: Record<RequestStatus, Tone> = {
    submitted: "warning",
    approved: "info",
    fulfilled: "positive",
    declined: "danger",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
    return (
        <Badge tone={REQUEST_STATUS_TONES[status]}>
            <span className="capitalize">{status}</span>
        </Badge>
    );
}

const IDEA_STATUS_TONES: Record<IdeaStatus, Tone> = {
    submitted: "neutral",
    under_review: "warning",
    planned: "info",
    building: "brand",
    shipped: "positive",
    declined: "danger",
};

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
    return (
        <Badge tone={IDEA_STATUS_TONES[status]}>
            {status.replace("_", " ")}
        </Badge>
    );
}

/** An overdue marker. Renders nothing when the item is not late. */
export function OverdueFlag({ show }: { show: boolean }) {
    if (!show) return null;
    return <Badge tone="danger">Overdue</Badge>;
}

// ─── Numbers ─────────────────────────────────────────────────────────────

export function StatTile({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string | number;
    hint?: string;
    tone?: Tone;
}) {
    const valueTone: Record<Tone, string> = {
        neutral: "text-white",
        brand: "text-brand-200",
        positive: "text-emerald-300",
        warning: "text-amber-300",
        danger: "text-red-300",
        info: "text-cyan-300",
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-surface-900/50 px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-surface-400">
                {label}
            </p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueTone[tone]}`}>
                {value}
            </p>
            {hint ? <p className="mt-0.5 text-xs text-surface-500">{hint}</p> : null}
        </div>
    );
}

export function ProgressBar({
    pct,
    tone = "brand",
    label,
}: {
    pct: number;
    tone?: Tone;
    label?: string;
}) {
    const fill: Record<Tone, string> = {
        neutral: "bg-surface-400",
        brand: "bg-brand-400",
        positive: "bg-emerald-400",
        warning: "bg-amber-400",
        danger: "bg-red-400",
        info: "bg-cyan-400",
    };
    const clamped = Math.max(0, Math.min(100, pct));

    return (
        <div>
            {label ? (
                <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-surface-400">{label}</span>
                    <span className="font-medium tabular-nums text-surface-200">{clamped}%</span>
                </div>
            ) : null}
            <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-surface-800"
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div className={`h-full rounded-full ${fill[tone]}`} style={{ width: `${clamped}%` }} />
            </div>
        </div>
    );
}

/** Currency, whole dollars - the workspace never reports cents on these figures. */
export function formatUsd(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

/** A date as a short, unambiguous string; "—" when there is no date at all. */
export function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/** Relative age in days, in words. Used where "3 days ago" reads better than a date. */
export function formatAge(days: number): string {
    if (days <= 0) return "today";
    if (days === 1) return "1 day";
    return `${days} days`;
}
