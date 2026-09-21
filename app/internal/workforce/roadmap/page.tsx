"use client";
import { IdeaStatusBadge } from "@/components/internal/indicators";
import { Card, EmptyState, ErrorState, LoadingBlock, PageHeader } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { IDEA_AREA_LABELS } from "@/lib/internal/workforceTypes";
import type { IdeaStatus, IdeaView } from "@/lib/internal/workforceTypes";

/**
 * The roadmap.
 *
 * Only committed ideas appear - accepted, planned, building, shipped. Submitted
 * ones stay on the idea board. A roadmap that lists everything anyone thought of
 * is a wish list, and reading it as a plan is how trust in the roadmap is lost.
 *
 * Empty stages are omitted by the backend for the same reason.
 */

interface RoadmapColumn {
    status: IdeaStatus;
    ideas: IdeaView[];
}

interface RoadmapPayload {
    columns: RoadmapColumn[];
}

function stageLabel(status: IdeaStatus): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RoadmapPage() {
    const { data, error, loading, reload } = useWorkforce<RoadmapPayload>("roadmap");

    const columns = data?.columns ?? [];

    return (
        <div>
            <PageHeader
                title="Roadmap"
                subtitle="Accepted ideas, grouped by the stage they have actually reached. Submitted ones stay on the idea board."
            />

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && columns.length === 0 ? (
                <EmptyState
                    title="Nothing is committed"
                    body="No idea has been accepted yet. This page stays empty until something is genuinely agreed, rather than showing stages with nothing in them."
                />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {columns.map((column) => (
                    <Card
                        key={column.status}
                        title={stageLabel(column.status)}
                        actions={<IdeaStatusBadge status={column.status} />}
                    >
                        <ul className="space-y-4">
                            {column.ideas.map((idea) => (
                                <li key={idea.id} className="border-t border-white/5 pt-3 first:border-0 first:pt-0">
                                    <p className="text-sm font-medium text-white">{idea.title}</p>
                                    <p className="mt-1 text-xs text-surface-500">
                                        {IDEA_AREA_LABELS[idea.area]} · {idea.authorName} ·{" "}
                                        {idea.votes} supporting
                                    </p>
                                    <p className="mt-2 text-xs leading-relaxed text-surface-400">
                                        {idea.proposal}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
        </div>
    );
}
