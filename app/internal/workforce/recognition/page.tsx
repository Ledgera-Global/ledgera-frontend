"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePost } from "@/lib/internal/workforceClient";
import { COMPANY_VALUES, COMPANY_VALUE_LABELS } from "@/lib/internal/workforceTypes";
import type { CompanyValue, EmployeeSummary, RecognitionView } from "@/lib/internal/workforceTypes";

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
} from "@/components/internal/ui";

/**
 * Recognition.
 *
 * A note must name a company value, and must go to someone else. Both rules
 * exist for the same reason: recognition with no stated reason is a popularity
 * contest, and being able to recognise yourself makes the whole thing unserious.
 * The backend enforces both, so a crafted request cannot bypass them.
 */

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function RecognitionPage() {
    const { data, error, loading, reload } = useWorkforce<{ recognition: RecognitionView[] }>(
        "recognition"
    );
    const directory = useWorkforce<{ employees: EmployeeSummary[] }>("directory");

    const [toUserId, setToUserId] = useState("");
    const [message, setMessage] = useState("");
    const [value, setValue] = useState<CompanyValue>("ownership");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!toUserId || !message.trim() || sending) return;

        setSending(true);
        setSendError(null);
        setSentTo(null);
        try {
            await workforcePost("recognition", {
                toUserId,
                message: message.trim(),
                value,
            });
            const recipient = (directory.data?.employees ?? []).find(
                (person) => person.id === toUserId
            );
            setSentTo(recipient?.name ?? "your colleague");
            setMessage("");
            reload();
        } catch (err) {
            setSendError(err instanceof Error ? err.message : "Could not record recognition.");
        } finally {
            setSending(false);
        }
    }

    const entries = data?.recognition ?? [];
    const people = directory.data?.employees ?? [];

    return (
        <div>
            <PageHeader
                title="Recognition"
                subtitle="Specific thanks, tied to one of our values. No generic praise."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    {loading ? <LoadingBlock rows={3} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && entries.length === 0 ? (
                        <EmptyState
                            title="No recognition yet"
                            body="When someone does something worth naming, say so here."
                        />
                    ) : null}

                    {entries.map((entry) => (
                        <article
                            key={entry.id}
                            className="rounded-2xl border border-white/10 bg-surface-900/40 p-5"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                    {entry.toName}
                                </span>
                                <span className="text-xs text-surface-500">from {entry.fromName}</span>
                                <Badge tone="brand">{COMPANY_VALUE_LABELS[entry.value]}</Badge>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-surface-300">
                                {entry.message}
                            </p>
                            <p className="mt-3 text-xs text-surface-500">{fmt(entry.createdAt)}</p>
                        </article>
                    ))}
                </div>

                <Card title="Recognise someone" subtitle="Pick the value they demonstrated.">
                    <form onSubmit={submit} className="space-y-3">
                        <Field label="Who">
                            <Select
                                value={toUserId}
                                onChange={(event) => setToUserId(event.target.value)}
                                required
                            >
                                <option value="">Choose a colleague</option>
                                {people.map((person) => (
                                    <option key={person.id} value={person.id}>
                                        {person.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field label="Value demonstrated">
                            <Select
                                value={value}
                                onChange={(event) => setValue(event.target.value as CompanyValue)}
                            >
                                {COMPANY_VALUES.map((option) => (
                                    <option key={option} value={option}>
                                        {COMPANY_VALUE_LABELS[option]}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <Field
                            label="What they did"
                            hint="Describe the act, not the person. Specific beats warm."
                        >
                            <TextArea
                                rows={4}
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                required
                            />
                        </Field>

                        {sendError ? <Notice tone="error">{sendError}</Notice> : null}
                        {sentTo ? <Notice tone="success">Recorded for {sentTo}.</Notice> : null}

                        <PrimaryButton
                            type="submit"
                            disabled={sending || !toUserId || !message.trim()}
                        >
                            {sending ? "Recording\u2026" : "Record recognition"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
