"use client";
import { useState } from "react";
import { Badge, ProgressBar } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePost } from "@/lib/internal/workforceClient";
import { LEARNING_TRACK_LABELS } from "@/lib/internal/workforceTypes";
import type { LearningModuleView, LearningTrack, LearningTrackView } from "@/lib/internal/workforceTypes";

import {
    Card,
    EmptyState,
    ErrorState,
    LoadingBlock,
    Notice,
    PageHeader,
    PrimaryButton,
} from "@/components/internal/ui";

/**
 * Learning.
 *
 * Completed modules stay visible. A catalogue that hides what you have finished
 * makes progress invisible, and progress is the only reason to open this screen.
 */

function ModuleRow({
    module,
    onCompleted,
}: {
    module: LearningModuleView;
    onCompleted: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function complete() {
        setBusy(true);
        setError(null);
        try {
            await workforcePost(`learning/${module.id}/complete`, {});
            onCompleted();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not record completion.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <li className="flex flex-col gap-2 border-b border-white/5 px-1 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{module.title}</p>
                    {module.required ? <Badge tone="warning">Required</Badge> : null}
                    {module.completed ? <Badge tone="positive">Done</Badge> : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-surface-400">{module.summary}</p>
                <p className="mt-1 text-xs text-surface-500">{module.minutes} min</p>
                {error ? (
                    <div className="mt-2">
                        <Notice tone="error">{error}</Notice>
                    </div>
                ) : null}
            </div>

            {!module.completed ? (
                <PrimaryButton type="button" onClick={() => void complete()} disabled={busy}>
                    {busy ? "\u2026" : "Mark complete"}
                </PrimaryButton>
            ) : null}
        </li>
    );
}

export default function LearningPage() {
    const { data, error, loading, reload } = useWorkforce<{
        tracks: LearningTrackView[];
        outstandingRequired: LearningModuleView[];
    }>("learning");

    const tracks = data?.tracks ?? [];
    const outstanding = data?.outstandingRequired ?? [];
    const totalMinutes = tracks.reduce((sum, track) => sum + track.minutesRemaining, 0);

    return (
        <div>
            <PageHeader
                title="Learning"
                subtitle={
                    outstanding.length > 0
                        ? `${outstanding.length} required module${
                              outstanding.length === 1 ? "" : "s"
                          } still outstanding - about ${totalMinutes} minutes remaining in total.`
                        : "Nothing required is outstanding. Everything here counts toward the same record."
                }
            />

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && tracks.length === 0 ? (
                <EmptyState
                    title="No training published"
                    body="When the catalogue is seeded, your tracks and progress appear here."
                />
            ) : null}

            <div className="space-y-6">
                {tracks.map((track) => {
                    const pct =
                        track.totalCount === 0
                            ? 0
                            : Math.round((track.completedCount / track.totalCount) * 100);

                    return (
                        <Card
                            key={track.track}
                            title={LEARNING_TRACK_LABELS[track.track as LearningTrack]}
                            subtitle={`${track.completedCount} of ${track.totalCount} complete`}
                        >
                            <ProgressBar
                                pct={pct}
                                tone={pct === 100 ? "positive" : "brand"}
                                label={pct === 100 ? "Complete" : `${pct}% complete`}
                            />
                            <ul className="mt-4">
                                {track.modules.map((module) => (
                                    <ModuleRow
                                        key={module.id}
                                        module={module}
                                        onCompleted={reload}
                                    />
                                ))}
                            </ul>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
