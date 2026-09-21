"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { RequestStatusBadge } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePost } from "@/lib/internal/workforceClient";
import type { RequestCategory, RequestView } from "@/lib/internal/workforceTypes";

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
    REQUEST_CATEGORIES,
    REQUEST_CATEGORY_LABELS,
    SPEND_REQUEST_CATEGORIES,
} from "@/lib/internal/workforceTypes";

/**
 * My requests.
 *
 * An amount is only asked for where the category actually involves spending.
 * Prompting for a figure on "software access" produces either a blank or a
 * guess, and a guessed number in a spend queue is worse than no number.
 */

const SPEND_CATEGORIES: readonly RequestCategory[] = SPEND_REQUEST_CATEGORIES;

function money(amount: number | null): string {
    if (amount === null) return "No amount";
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function RequestsPage() {
    const { data, error, loading, reload } = useWorkforce<{ requests: RequestView[] }>("requests");

    const [category, setCategory] = useState<RequestCategory>("it_equipment");
    const [title, setTitle] = useState("");
    const [detail, setDetail] = useState("");
    const [amount, setAmount] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [raised, setRaised] = useState(false);

    const needsAmount = SPEND_CATEGORIES.includes(category);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!title.trim() || sending) return;

        setSending(true);
        setSendError(null);
        setRaised(false);
        try {
            await workforcePost("requests", {
                category,
                title: title.trim(),
                detail: detail.trim() || null,
                amount: needsAmount && amount ? Number(amount) : null,
            });
            setTitle("");
            setDetail("");
            setAmount("");
            setRaised(true);
            reload();
        } catch (err) {
            setSendError(err instanceof Error ? err.message : "Could not raise the request.");
        } finally {
            setSending(false);
        }
    }

    const requests = data?.requests ?? [];

    return (
        <div>
            <PageHeader
                title="My requests"
                subtitle="Equipment, access, spend, and travel - one queue, wherever you happen to be."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    {loading ? <LoadingBlock rows={3} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && requests.length === 0 ? (
                        <EmptyState
                            title="You have raised nothing"
                            body="Requests you raise appear here with the decision once someone makes it."
                        />
                    ) : null}

                    {requests.map((request) => (
                        <Card
                            key={request.id}
                            title={request.title}
                            subtitle={`${REQUEST_CATEGORY_LABELS[request.category]} · raised ${request.ageDays} day${
                                request.ageDays === 1 ? "" : "s"
                            } ago`}
                            actions={<RequestStatusBadge status={request.status} />}
                        >
                            {request.detail ? (
                                <p className="text-sm leading-relaxed text-surface-300">
                                    {request.detail}
                                </p>
                            ) : null}

                            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                                <div className="flex gap-2">
                                    <dt className="text-surface-500">Amount</dt>
                                    <dd className="text-surface-300">{money(request.amount)}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="text-surface-500">Decided by</dt>
                                    <dd className="text-surface-300">
                                        {request.decidedByName ?? "Awaiting a decision"}
                                    </dd>
                                </div>
                            </dl>

                            {request.decisionNote ? (
                                <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-surface-300">
                                    {request.decisionNote}
                                </p>
                            ) : null}
                        </Card>
                    ))}
                </div>

                <Card title="Raise a request" subtitle="Names the category so it reaches the right queue.">
                    <form onSubmit={submit} className="space-y-3">
                        <Field label="Category">
                            <Select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value as RequestCategory)
                                }
                            >
                                {REQUEST_CATEGORIES.map((option) => (
                                    <option key={option} value={option}>
                                        {REQUEST_CATEGORY_LABELS[option]}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="What you need">
                            <TextInput
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Replacement laptop charger"
                                required
                            />
                        </Field>

                        <Field label="Detail" hint="Why it is needed, and anything the decider will ask.">
                            <TextArea
                                rows={4}
                                value={detail}
                                onChange={(event) => setDetail(event.target.value)}
                            />
                        </Field>

                        {needsAmount ? (
                            <Field label="Amount (USD)">
                                <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) => setAmount(event.target.value)}
                                />
                            </Field>
                        ) : null}

                        {sendError ? <Notice tone="error">{sendError}</Notice> : null}
                        {raised ? <Notice tone="success">Request raised.</Notice> : null}

                        <PrimaryButton type="submit" disabled={sending || !title.trim()}>
                            {sending ? "Raising\u2026" : "Raise request"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
