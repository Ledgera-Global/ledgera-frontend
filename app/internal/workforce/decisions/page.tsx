"use client";
import { useState } from "react";
import { Badge } from "@/components/internal/indicators";
import { Card, EmptyState, ErrorState, LoadingBlock, PageHeader, TextInput } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import type { DecisionView } from "@/lib/internal/workforceTypes";

/**
 * The decision log.
 *
 * Each entry keeps the context, the decision, and what was rejected. The
 * rejected options are the valuable part: without them the log records what was
 * chosen but not what it was chosen over, and the same debate restarts a year
 * later with no memory of why it was settled.
 */

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function DecisionsPage() {
    const { data, error, loading, reload } = useWorkforce<{ decisions: DecisionView[] }>(
        "decisions"
    );
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const decisions = (data?.decisions ?? []).filter((decision) =>
        needle.length === 0
            ? true
            : [decision.title, decision.context, decision.decision, decision.tags.join(" ")]
                  .join(" ")
                  .toLowerCase()
                  .includes(needle)
    );

    return (
        <div>
            <PageHeader
                title="Decision log"
                subtitle="What was decided, why, and what was considered instead."
            />

            <div className="mb-6 max-w-md">
                <TextInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search decisions"
                    aria-label="Search decisions"
                />
            </div>

            {loading ? <LoadingBlock rows={3} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && decisions.length === 0 ? (
                <EmptyState
                    title={needle ? "No decision matches" : "No decisions recorded"}
                    body={
                        needle
                            ? "Try a shorter phrase, or clear the search to read the whole log."
                            : "A decision that was not written down gets made again next quarter."
                    }
                />
            ) : null}

            <div className="space-y-5">
                {decisions.map((decision) => (
                    <Card
                        key={decision.id}
                        title={decision.title}
                        subtitle={fmt(decision.decidedAt)}
                    >
                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-500">
                                    Context
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-surface-300">
                                    {decision.context}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
                                    Decision
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-white">
                                    {decision.decision}
                                </p>
                            </div>

                            {decision.alternatives ? (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-500">
                                        Considered and rejected
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-surface-400">
                                        {decision.alternatives}
                                    </p>
                                </div>
                            ) : null}

                            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                                <span className="text-xs text-surface-500">
                                    Decided by {decision.decidedBy}
                                </span>
                                {decision.tags.map((tag) => (
                                    <Badge key={tag} tone="neutral">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
