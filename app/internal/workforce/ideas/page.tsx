"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { Badge, IdeaStatusBadge } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePatch, workforcePost } from "@/lib/internal/workforceClient";
import { IDEA_AREAS, IDEA_AREA_LABELS, IDEA_STATUSES } from "@/lib/internal/workforceTypes";
import type { IdeaArea, IdeaStatus, IdeaView } from "@/lib/internal/workforceTypes";

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

/**
 * The idea board.
 *
 * A problem and a proposal are both required. A title alone is a complaint; a
 * proposal alone hides the problem it was designed for, so nobody reading it
 * later can tell whether it still applies.
 *
 * Sorting is explicit - most-voted or newest, never a silent blend.
 */

type SortMode = "votes" | "recent";

function IdeaCard({ idea, onChanged }: { idea: IdeaView; onChanged: () => void }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function vote() {
        setBusy(true);
        setError(null);
        try {
            await workforcePost(`ideas/${idea.id}/vote`, {});
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not record the vote.");
        } finally {
            setBusy(false);
        }
    }

    async function move(status: IdeaStatus) {
        setBusy(true);
        setError(null);
        try {
            await workforcePatch(`ideas/${idea.id}`, { status });
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not move the idea.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <article className="rounded-2xl border border-white/10 bg-surface-900/40 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white">{idea.title}</h3>
                    <p className="mt-1 text-xs text-surface-500">
                        {idea.authorName} ·{" "}
                        {new Date(idea.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{IDEA_AREA_LABELS[idea.area]}</Badge>
                    <IdeaStatusBadge status={idea.status} />
                </div>
            </header>

            <div className="mt-4 space-y-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-500">
                        Problem
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-surface-300">{idea.problem}</p>
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                        Proposal
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-surface-300">{idea.proposal}</p>
                </div>
            </div>

            {error ? (
                <div className="mt-3">
                    <Notice tone="error">{error}</Notice>
                </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                <PrimaryButton type="button" onClick={() => void vote()} disabled={busy}>
                    Support · {idea.votes}
                </PrimaryButton>

                <label className="flex items-center gap-2 text-xs text-surface-400">
                    Move to
                    <Select
                        value={idea.status}
                        onChange={(event) => void move(event.target.value as IdeaStatus)}
                        disabled={busy}
                    >
                        {IDEA_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                            </option>
                        ))}
                    </Select>
                </label>
            </div>
        </article>
    );
}

export default function IdeasPage() {
    const [sort, setSort] = useState<SortMode>("votes");
    const { data, error, loading, reload } = useWorkforce<{ ideas: IdeaView[]; sort: SortMode }>(
        `ideas?sort=${sort}`
    );

    const [title, setTitle] = useState("");
    const [problem, setProblem] = useState("");
    const [proposal, setProposal] = useState("");
    const [area, setArea] = useState<IdeaArea>("product");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [raised, setRaised] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!title.trim() || !problem.trim() || !proposal.trim() || saving) return;

        setSaving(true);
        setSaveError(null);
        setRaised(false);
        try {
            await workforcePost("ideas", {
                title: title.trim(),
                problem: problem.trim(),
                proposal: proposal.trim(),
                area,
            });
            setTitle("");
            setProblem("");
            setProposal("");
            setRaised(true);
            reload();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Could not raise the idea.");
        } finally {
            setSaving(false);
        }
    }

    const ideas = data?.ideas ?? [];

    return (
        <div>
            <PageHeader
                title="Idea board"
                subtitle="Every idea states the problem it solves and what it proposes. Both, or it is not reviewable."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {(["votes", "recent"] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setSort(mode)}
                                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                    sort === mode
                                        ? "border-brand-400/40 bg-brand-400/10 text-white"
                                        : "border-white/10 text-surface-400 hover:text-white"
                                }`}
                            >
                                {mode === "votes" ? "Most supported" : "Newest"}
                            </button>
                        ))}
                    </div>

                    {loading ? <LoadingBlock rows={3} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && ideas.length === 0 ? (
                        <EmptyState
                            title="No ideas yet"
                            body="Nothing has been raised. The board is where a problem someone keeps working around becomes someone else's problem to fix."
                        />
                    ) : null}

                    <div className="space-y-4">
                        {ideas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} onChanged={reload} />
                        ))}
                    </div>
                </div>

                <Card title="Raise an idea" subtitle="Problem and proposal are both required.">
                    <form onSubmit={submit} className="space-y-3">
                        <Field label="Title">
                            <TextInput
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Problem" hint="What is actually going wrong today.">
                            <TextArea
                                rows={4}
                                value={problem}
                                onChange={(event) => setProblem(event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Proposal" hint="What you would do about it.">
                            <TextArea
                                rows={4}
                                value={proposal}
                                onChange={(event) => setProposal(event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Area">
                            <Select
                                value={area}
                                onChange={(event) => setArea(event.target.value as IdeaArea)}
                            >
                                {IDEA_AREAS.map((option) => (
                                    <option key={option} value={option}>
                                        {IDEA_AREA_LABELS[option]}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        {saveError ? <Notice tone="error">{saveError}</Notice> : null}
                        {raised ? <Notice tone="success">Idea raised.</Notice> : null}

                        <PrimaryButton
                            type="submit"
                            disabled={saving || !title.trim() || !problem.trim() || !proposal.trim()}
                        >
                            {saving ? "Raising\u2026" : "Raise idea"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
