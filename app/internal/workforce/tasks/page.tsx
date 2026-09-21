"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { OverdueFlag, TaskPriorityBadge } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePatch, workforcePost } from "@/lib/internal/workforceClient";

import {
    Card,
    EmptyState,
    ErrorState,
    Field,
    LoadingBlock,
    Notice,
    PageHeader,
    PrimaryButton,
    Select,
    TextArea,
    TextInput,
} from "@/components/internal/ui";
import {
    TASK_PRIORITIES,
    WORK_AREAS,
    WORK_AREA_LABELS,
} from "@/lib/internal/workforceTypes";
import type {
    TaskPriority,
    TaskStatus,
    TaskView,
    WorkArea,
} from "@/lib/internal/workforceTypes";

/**
 * My tasks.
 *
 * Every task here is the caller's own, and the backend scopes each status change
 * by owner as well as id - so nothing on this screen can move a colleague's work.
 *
 * "Later" exists as a first-class priority rather than as "no priority": work
 * that is genuinely not urgent should be sayable, or everything drifts to normal
 * and the list stops distinguishing anything.
 */

const NEXT_STATUS: Record<TaskStatus, { label: string; next: TaskStatus } | null> = {
    open: { label: "Start", next: "in_progress" },
    in_progress: { label: "Mark done", next: "done" },
    done: null,
};

function TaskRow({ task, onChanged }: { task: TaskView; onChanged: () => void }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const transition = NEXT_STATUS[task.status];

    async function move(status: TaskStatus) {
        setBusy(true);
        setError(null);
        try {
            await workforcePatch(`tasks/${task.id}`, { status });
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the task.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <li className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <TaskPriorityBadge priority={task.priority} />
                    <OverdueFlag show={task.isOverdue} />
                    <span className="text-xs text-surface-500">
                        {WORK_AREA_LABELS[task.area]}
                    </span>
                </div>
                {task.detail ? (
                    <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-surface-300">
                        {task.detail}
                    </p>
                ) : null}
                <p className="mt-1.5 text-xs text-surface-500">
                    {task.dueAt
                        ? `Due ${new Date(task.dueAt).toDateString()}`
                        : "No due date"}
                    {task.status === "in_progress" ? " \u00b7 In progress" : ""}
                    {task.status === "done" ? " \u00b7 Done" : ""}
                </p>
                {error ? (
                    <div className="mt-2">
                        <Notice tone="error">{error}</Notice>
                    </div>
                ) : null}
            </div>

            {transition ? (
                <PrimaryButton
                    type="button"
                    disabled={busy}
                    onClick={() => void move(transition.next)}
                    className="shrink-0"
                >
                    {busy ? "\u2026" : transition.label}
                </PrimaryButton>
            ) : null}
        </li>
    );
}

export default function TasksPage() {
    const [includeDone, setIncludeDone] = useState(false);
    const { data, error, loading, reload } = useWorkforce<{ tasks: TaskView[] }>(
        includeDone ? "tasks?includeDone=true" : "tasks"
    );

    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [area, setArea] = useState<WorkArea>("product");
    const [priority, setPriority] = useState<TaskPriority>("normal");
    const [dueAt, setDueAt] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    async function create(event: FormEvent) {
        event.preventDefault();
        if (!title.trim() || creating) return;

        setCreating(true);
        setCreateError(null);
        try {
            await workforcePost("tasks", {
                title: title.trim(),
                detail: detail.trim() || null,
                area,
                priority,
                dueAt: dueAt ? new Date(dueAt).toISOString() : null,
            });
            setTitle("");
            setDetail("");
            setDueAt("");
            setPriority("normal");
            reload();
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Could not create the task.");
        } finally {
            setCreating(false);
        }
    }

    const tasks = data?.tasks ?? [];

    return (
        <div>
            <PageHeader
                title="My tasks"
                subtitle="What you owe, most urgent first. Urgent work without a date still outranks later work with one."
                actions={
                    <label className="flex items-center gap-2 text-xs text-surface-300">
                        <input
                            type="checkbox"
                            checked={includeDone}
                            onChange={(event) => setIncludeDone(event.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-surface-900"
                        />
                        Show completed
                    </label>
                }
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <Card title="Open work" subtitle={`${tasks.length} task${tasks.length === 1 ? "" : "s"}`}>
                    {loading ? <LoadingBlock rows={4} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && tasks.length === 0 ? (
                        <EmptyState
                            title="Nothing open"
                            body="Either you are genuinely clear, or nothing has been written down yet."
                        />
                    ) : null}
                    {tasks.length > 0 ? (
                        <ul className="divide-y divide-white/5">
                            {tasks.map((task) => (
                                <TaskRow key={task.id} task={task} onChanged={reload} />
                            ))}
                        </ul>
                    ) : null}
                </Card>

                <Card title="Add a task" subtitle="Visible only to you.">
                    <form onSubmit={create} className="space-y-3">
                        <Field label="What needs doing">
                            <TextInput
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Chase the Q3 invoice reconciliation"
                                required
                            />
                        </Field>
                        <Field label="Detail" hint="Optional, but a week from now this is what you will want.">
                            <TextArea
                                rows={3}
                                value={detail}
                                onChange={(event) => setDetail(event.target.value)}
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Area">
                                <Select
                                    value={area}
                                    onChange={(event) => setArea(event.target.value as WorkArea)}
                                >
                                    {WORK_AREAS.map((value) => (
                                        <option key={value} value={value}>
                                            {WORK_AREA_LABELS[value]}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Priority">
                                <Select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(event.target.value as TaskPriority)
                                    }
                                >
                                    {TASK_PRIORITIES.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </div>
                        <Field label="Due date" hint="Leave empty if there is no real date.">
                            <TextInput
                                type="date"
                                value={dueAt}
                                onChange={(event) => setDueAt(event.target.value)}
                            />
                        </Field>

                        {createError ? <Notice tone="error">{createError}</Notice> : null}

                        <PrimaryButton type="submit" disabled={creating || !title.trim()}>
                            {creating ? "Adding\u2026" : "Add task"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
