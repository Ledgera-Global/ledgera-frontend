"use client";
import { useState } from "react";
import { RequestStatusBadge } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePatch } from "@/lib/internal/workforceClient";
import { REQUEST_CATEGORY_LABELS } from "@/lib/internal/workforceTypes";
import type { RequestStatus, RequestView } from "@/lib/internal/workforceTypes";

import {
    Card,
    EmptyState,
    ErrorState,
    LoadingBlock,
    Notice,
    PageHeader,
    PrimaryButton,
    TextInput,
} from "@/components/internal/ui";

/**
 * The decision queue.
 *
 * Every request in here is still waiting on someone. Two outcomes are offered
 * rather than one: approving everything quickly looks like good service and is
 * actually an unreviewed spend queue, so declining is a first-class button, not
 * a hidden one.
 */

interface QueuePayload {
    requests: RequestView[];
    byCategory: { category: RequestView["category"]; count: number }[];
}

function money(amount: number | null): string {
    if (amount === null) return "no amount";
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function QueueItem({ request, onDecided }: { request: RequestView; onDecided: () => void }) {
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState<RequestStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function decide(status: RequestStatus) {
        setBusy(status);
        setError(null);
        try {
            await workforcePatch(`requests/${request.id}`, {
                status,
                decisionNote: note.trim() || null,
            });
            onDecided();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not record the decision.");
        } finally {
            setBusy(null);
        }
    }

    return (
        <article className="rounded-2xl border border-white/10 bg-surface-900/40 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white">{request.title}</h3>
                    <p className="mt-1 text-xs text-surface-400">
                        {REQUEST_CATEGORY_LABELS[request.category]} · {request.requesterName} ·{" "}
                        {request.ageDays} day{request.ageDays === 1 ? "" : "s"} old
                    </p>
                </div>
                <RequestStatusBadge status={request.status} />
            </header>

            {request.detail ? (
                <p className="mt-3 text-sm leading-relaxed text-surface-300">{request.detail}</p>
            ) : null}

            <p className="mt-3 text-xs text-surface-400">Amount: {money(request.amount)}</p>

            <div className="mt-4 space-y-3">
                <TextInput
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Why this decision (optional)"
                    aria-label="Decision note"
                />

                {error ? <Notice tone="error">{error}</Notice> : null}

                <div className="flex flex-wrap gap-2">
                    <PrimaryButton
                        type="button"
                        onClick={() => void decide("approved")}
                        disabled={busy !== null}
                    >
                        {busy === "approved" ? "Approving\u2026" : "Approve"}
                    </PrimaryButton>
                    <PrimaryButton
                        type="button"
                        onClick={() => void decide("fulfilled")}
                        disabled={busy !== null}
                    >
                        {busy === "fulfilled" ? "Closing\u2026" : "Mark fulfilled"}
                    </PrimaryButton>
                    <button
                        type="button"
                        onClick={() => void decide("declined")}
                        disabled={busy !== null}
                        className="rounded-xl border border-white/15 px-4 py-2 text-sm text-surface-200 transition-colors hover:border-red-400/40 hover:text-white disabled:opacity-50"
                    >
                        {busy === "declined" ? "Declining\u2026" : "Decline"}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function QueuePage() {
    const { data, error, loading, reload } = useWorkforce<QueuePayload>("requests/open");

    const requests = data?.requests ?? [];
    const byCategory = data?.byCategory ?? [];

    return (
        <div>
            <PageHeader
                title="Decision queue"
                subtitle="Everything waiting on a decision, oldest first. Anyone internal can decide; the decision carries your name."
            />

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && byCategory.length > 0 ? (
                <div className="mb-6 flex flex-wrap gap-2">
                    {byCategory.map((entry) => (
                        <span
                            key={entry.category}
                            className="rounded-full border border-white/10 px-3 py-1 text-xs text-surface-300"
                        >
                            {REQUEST_CATEGORY_LABELS[entry.category]}
                            <span className="ml-2 text-surface-500">{entry.count}</span>
                        </span>
                    ))}
                </div>
            ) : null}

            {!loading && !error && requests.length === 0 ? (
                <EmptyState
                    title="Nothing is waiting"
                    body="No request is outstanding. When one arrives it stops being quiet."
                />
            ) : null}

            <div className="space-y-4">
                {requests.map((request) => (
                    <QueueItem key={request.id} request={request} onDecided={reload} />
                ))}
            </div>

            {!loading && !error && requests.length > 0 ? (
                <div className="mt-6">
                    <Card title="Why decline is here" subtitle="A note on the shape of this queue.">
                        <p className="text-sm leading-relaxed text-surface-400">
                            A queue that only approves will grow until someone stops reading it. Declining
                            with a note is how the person who asked learns the constraint instead of
                            asking again next month.
                        </p>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
