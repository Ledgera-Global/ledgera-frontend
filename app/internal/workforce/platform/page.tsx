"use client";
import { StatTile } from "@/components/internal/indicators";
import { Card, ErrorState, LoadingBlock, PageHeader } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { REQUEST_CATEGORY_LABELS } from "@/lib/internal/workforceTypes";

import type {
    PlatformOverview,
    RequestCategory,
    WorkforceOpsSnapshot,
} from "@/lib/internal/workforceTypes";

/**
 * The operating picture.
 *
 * Internal headcount is shown as a share of all accounts rather than a raw
 * count. A raw internal number next to a raw customer number invites the wrong
 * conclusion - that we are small - when what matters is whether the ratio is
 * drifting.
 */

interface PlatformPayload {
    overview: PlatformOverview;
    operations: WorkforceOpsSnapshot;
    requestQueues: { category: RequestCategory; count: number }[];
}

export default function PlatformPage() {
    const { data, error, loading, reload } = useWorkforce<PlatformPayload>("platform");

    const overview = data?.overview;
    const operations = data?.operations;
    const queues = data?.requestQueues ?? [];

    return (
        <div>
            <PageHeader
                title="Platform"
                subtitle="Everything the workspace is carrying, and how much of the company is internal."
            />

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {overview ? (
                <section className="mb-8">
                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-500">
                        Accounts
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile label="Companies" value={String(overview.companies)} />
                        <StatTile label="Customer users" value={String(overview.customerUsers)} />
                        <StatTile label="Employees here" value={String(overview.employees)} />
                        <StatTile
                            label="Internal share"
                            value={`${overview.internalSharePct}%`}
                            tone="brand"
                        />
                    </div>
                </section>
            ) : null}

            {operations ? (
                <section className="mb-8">
                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-500">
                        Work in flight
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatTile
                            label="Open tasks"
                            value={String(operations.openTasks)}
                            tone={operations.overdueTasks > 0 ? "warning" : "neutral"}
                        />
                        <StatTile
                            label="Overdue tasks"
                            value={String(operations.overdueTasks)}
                            tone={operations.overdueTasks > 0 ? "danger" : "positive"}
                        />
                        <StatTile label="Open requests" value={String(operations.openRequests)} />
                        <StatTile
                            label="Oldest request"
                            value={
                                operations.oldestRequestDays === 0
                                    ? "None waiting"
                                    : `${operations.oldestRequestDays} days`
                            }
                            tone={operations.oldestRequestDays > 7 ? "warning" : "neutral"}
                        />
                        <StatTile
                            label="Announcements, 30 days"
                            value={String(operations.announcementsLast30Days)}
                        />
                        <StatTile
                            label="Ideas shipped"
                            value={`${operations.ideasShipped} of ${operations.ideasSubmitted}`}
                            tone="brand"
                        />
                    </div>
                </section>
            ) : null}

            <Card
                title="Request queues"
                subtitle="Open by category, largest first. Categories with nothing waiting are absent, not zero."
            >
                {queues.length === 0 ? (
                    <p className="text-sm text-surface-400">No category has anything waiting.</p>
                ) : (
                    <ul className="divide-y divide-white/5">
                        {queues.map((entry) => (
                            <li
                                key={entry.category}
                                className="flex items-center justify-between py-3"
                            >
                                <span className="text-sm text-surface-200">
                                    {REQUEST_CATEGORY_LABELS[entry.category]}
                                </span>
                                <span className="text-sm text-white">{entry.count}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
}
