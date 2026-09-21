"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { GoalStatusBadge, ProgressBar } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePatch, workforcePost } from "@/lib/internal/workforceClient";
import type { GoalView } from "@/lib/internal/workforceTypes";

import {
    Card,
    EmptyState,
    ErrorState,
    Field,
    LoadingBlock,
    Notice,
    PageHeader,
    PrimaryButton,
    TextInput,
} from "@/components/internal/ui";

/**
 * My goals.
 *
 * Goals are shown separately from tasks on purpose. A task is something you
 * finish; a goal is something you are judged on at the end of a quarter. The
 * urgent task always wins a shared list, which is why goal tracking usually
 * disappears until review week.
 *
 * Progress is recorded as a measured number, and the status follows from it -
 * so a goal cannot read "on track" while its own figures say otherwise.
 */

const PROGRESS_TONES = {
    on_track: "positive",
    at_risk: "warning",
    off_track: "danger",
    done: "info",
} as const;

function GoalCard({ goal, onChanged }: { goal: GoalView; onChanged: () => void }) {
    const [current, setCurrent] = useState(String(goal.current));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function record(event: FormEvent) {
        event.preventDefault();
        const value = Number(current);
        if (!Number.isFinite(value) || value < 0 || busy) return;

        setBusy(true);
        setError(null);
        try {
            await workforcePatch(`goals/${goal.id}/progress`, { current: value });
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not record progress.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <li className="rounded-2xl border border-white/10 bg-surface-900/50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{goal.objective}</p>
                    {goal.keyResult ? (
                        <p className="mt-1 text-xs text-surface-400">{goal.keyResult}</p>
                    ) : null}
                </div>
                <GoalStatusBadge status={goal.status} />
            </div>

            <div className="mt-4">
                <ProgressBar
                    pct={goal.progressPct}
                    tone={PROGRESS_TONES[goal.status]}
                    label={`${goal.current}${goal.unit} of ${goal.target}${goal.unit}`}
                />
            </div>

            <form onSubmit={record} className="mt-4 flex flex-wrap items-end gap-2">
                <label className="flex-1 basis-40">
                    <span className="mb-1 block text-xs text-surface-400">
                        Record measured progress
                    </span>
                    <TextInput
                        type="number"
                        min="0"
                        step="any"
                        value={current}
                        onChange={(event) => setCurrent(event.target.value)}
                    />
                </label>
                <PrimaryButton type="submit" disabled={busy}>
                    {busy ? "Saving\u2026" : "Update"}
                </PrimaryButton>
                <span className="text-xs text-surface-500">
                    {goal.quarter} · status follows the number
                </span>
            </form>

            {error ? (
                <div className="mt-3">
                    <Notice tone="error">{error}</Notice>
                </div>
            ) : null}
        </li>
    );
}

export default function GoalsPage() {
    const { data, error, loading, reload } = useWorkforce<{
        current: GoalView[];
        history: GoalView[];
    }>("goals");

    const [objective, setObjective] = useState("");
    const [keyResult, setKeyResult] = useState("");
    const [target, setTarget] = useState("");
    const [unit, setUnit] = useState("%");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    async function create(event: FormEvent) {
        event.preventDefault();
        const targetValue = Number(target);
        if (!objective.trim() || !Number.isFinite(targetValue) || targetValue <= 0) return;

        setCreating(true);
        setCreateError(null);
        try {
            await workforcePost("goals", {
                objective: objective.trim(),
                keyResult: keyResult.trim() || null,
                target: targetValue,
                unit: unit.trim() || "%",
            });
            setObjective("");
            setKeyResult("");
            setTarget("");
            reload();
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Could not create the goal.");
        } finally {
            setCreating(false);
        }
    }

    const current = data?.current ?? [];
    const history = (data?.history ?? []).filter(
        (goal) => !current.some((entry) => entry.id === goal.id)
    );

    return (
        <div>
            <PageHeader
                title="My goals"
                subtitle="What you are measured on this quarter, and the numbers behind it."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <Card
                    title="This quarter"
                    subtitle={`${current.length} goal${current.length === 1 ? "" : "s"}`}
                >
                    {loading ? <LoadingBlock rows={3} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && current.length === 0 ? (
                        <EmptyState
                            title="No goals set for this quarter"
                            body="A quarter with no stated goal is one you cannot be measured against."
                        />
                    ) : null}
                    {current.length > 0 ? (
                        <ul className="space-y-4">
                            {current.map((goal) => (
                                <GoalCard key={goal.id} goal={goal} onChanged={reload} />
                            ))}
                        </ul>
                    ) : null}
                </Card>

                <div className="space-y-6">
                    <Card title="Set a goal" subtitle="For the current quarter.">
                        <form onSubmit={create} className="space-y-3">
                            <Field label="Objective">
                                <TextInput
                                    value={objective}
                                    onChange={(event) => setObjective(event.target.value)}
                                    placeholder="Cut average days-to-collect to 28"
                                    required
                                />
                            </Field>
                            <Field label="Key result" hint="How you will know it worked.">
                                <TextInput
                                    value={keyResult}
                                    onChange={(event) => setKeyResult(event.target.value)}
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Target">
                                    <TextInput
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={target}
                                        onChange={(event) => setTarget(event.target.value)}
                                        required
                                    />
                                </Field>
                                <Field label="Unit">
                                    <TextInput
                                        value={unit}
                                        onChange={(event) => setUnit(event.target.value)}
                                        placeholder="% or count"
                                    />
                                </Field>
                            </div>

                            {createError ? <Notice tone="error">{createError}</Notice> : null}

                            <PrimaryButton
                                type="submit"
                                disabled={creating || !objective.trim() || !target}
                            >
                                {creating ? "Saving\u2026" : "Add goal"}
                            </PrimaryButton>
                        </form>
                    </Card>

                    {history.length > 0 ? (
                        <Card title="Earlier quarters" subtitle="Kept, so progress is comparable.">
                            <ul className="space-y-3">
                                {history.map((goal) => (
                                    <li key={goal.id} className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm text-surface-200">
                                                {goal.objective}
                                            </p>
                                            <p className="text-xs text-surface-500">{goal.quarter}</p>
                                        </div>
                                        <GoalStatusBadge status={goal.status} />
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
