"use client";
import CopilotPanel from "@/components/internal/CopilotPanel";
import Link from "next/link";
import { Badge, StatTile } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import type { DailyBriefing } from "@/lib/internal/workforceTypes";

import {
    Card,
    EmptyState,
    ErrorState,
    LoadingBlock,
    PageHeader,
    SectionHeading,
} from "@/components/internal/ui";

/**
 * The command center: what needs you today, and one place to ask about it.
 *
 * The briefing is short by construction - it holds only "now" priority work,
 * already-overdue items, commitments this person made, and pinned notices. That
 * is a deliberate ceiling, not a missing feature: a brief that lists everything
 * is a second inbox, and nobody reads a second inbox.
 */

const KIND_LABELS: Record<DailyBriefing["items"][number]["kind"], string> = {
    task: "Task",
    goal: "Goal",
    learning: "Training",
    request: "Request",
    announcement: "Notice",
};

const JUMP_LINKS = [
    { label: "Tasks", href: "/internal/workforce/tasks" },
    { label: "Goals", href: "/internal/workforce/goals" },
    { label: "Company brain", href: "/internal/workforce/brain" },
    { label: "Announcements", href: "/internal/workforce/announcements" },
    { label: "Request something", href: "/internal/workforce/requests" },
    { label: "Directory", href: "/internal/workforce/directory" },
];

export default function CommandCenterPage() {
    const { data, error, loading, reload } = useWorkforce<DailyBriefing>("briefing");

    return (
        <div>
            <PageHeader
                title={
                    data
                        ? `Good to see you, ${data.employeeName.split(" ")[0]}`
                        : "Command center"
                }
                subtitle={
                    data?.headline ??
                    "Your short daily read: what is due, what is late, and what you committed to."
                }
            />

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {data ? (
                <div className="space-y-8">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <StatTile label="Open tasks" value={data.counts.tasksTotal} hint="Assigned to you" />
                        <StatTile
                            label="Due now"
                            value={data.counts.tasksDueNow}
                            tone={data.counts.tasksDueNow > 0 ? "warning" : "neutral"}
                            hint="Marked urgent"
                        />
                        <StatTile
                            label="Overdue"
                            value={data.counts.tasksOverdue}
                            tone={data.counts.tasksOverdue > 0 ? "danger" : "positive"}
                            hint={data.counts.tasksOverdue > 0 ? "Past due date" : "Nothing late"}
                        />
                        <StatTile
                            label="Goals at risk"
                            value={data.counts.goalsAtRisk}
                            tone={data.counts.goalsAtRisk > 0 ? "warning" : "positive"}
                            hint="This quarter"
                        />
                        <StatTile
                            label="Required training"
                            value={data.counts.requiredTrainingOutstanding}
                            tone={data.counts.requiredTrainingOutstanding > 0 ? "warning" : "positive"}
                            hint="Still outstanding"
                        />
                        <StatTile
                            label="My requests"
                            value={data.counts.myOpenRequests}
                            hint="Awaiting a decision"
                        />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                        <Card
                            title="Today"
                            subtitle="Late items first. Nothing here is on the list just for existing."
                        >
                            {data.items.length === 0 ? (
                                <EmptyState
                                    title="Nothing is on fire"
                                    body="No overdue work, no urgent tasks, and no required training outstanding."
                                />
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {data.items.map((item, index) => (
                                        <li key={`${item.kind}-${index}`}>
                                            <Link
                                                href={item.href}
                                                className="flex items-start justify-between gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-white/5"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge tone={item.isLate ? "danger" : "neutral"}>
                                                            {KIND_LABELS[item.kind]}
                                                        </Badge>
                                                        <p className="truncate text-sm font-medium text-white">
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-xs text-surface-400">
                                                        {item.detail}
                                                    </p>
                                                </div>
                                                <span className="mt-1 shrink-0 text-xs text-surface-500">
                                                    Open
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        <div className="space-y-6">
                            <Card
                                title="Ask about your work"
                                subtitle="Answers are read from this workspace, with the source shown."
                            >
                                <CopilotPanel compact />
                            </Card>

                            <div>
                                <SectionHeading>Jump to</SectionHeading>
                                <div className="flex flex-wrap gap-2">
                                    {JUMP_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-surface-300 transition-colors hover:border-brand-400/30 hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-surface-500">
                        Briefing generated {new Date(data.generatedAt).toLocaleString("en-US")}.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
