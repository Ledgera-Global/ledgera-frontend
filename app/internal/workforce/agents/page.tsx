"use client";
import { Badge, StatTile } from "@/components/internal/indicators";
import { Card, EmptyState, ErrorState, LoadingBlock, PageHeader } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import type { AgentRuntimeStatus, ImpactLedger } from "@/lib/internal/workforceTypes";

/**
 * The AI agents, reported honestly.
 *
 * Two numbers are kept apart on purpose. "Open estimated impact" is what the
 * agent thinks it could save; "realized impact" is what was actually measured
 * after someone implemented the change. Collapsing them would let an estimate
 * that nobody acted on read as a result that happened.
 */

function money(amount: number): string {
    return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

export default function AgentsPage() {
    const agents = useWorkforce<{ agents: AgentRuntimeStatus[] }>("agents");
    const ledger = useWorkforce<ImpactLedger>("agents/impact-ledger");

    const rows = agents.data?.agents ?? [];

    return (
        <div>
            <PageHeader
                title="Agents"
                subtitle="Five analysts watching revenue, cost, efficiency, and risk. Estimates and measured results are shown separately."
            />

            {agents.loading || ledger.loading ? <LoadingBlock rows={4} /> : null}
            {agents.error ? <ErrorState message={agents.error} onRetry={agents.reload} /> : null}
            {ledger.error ? <ErrorState message={ledger.error} onRetry={ledger.reload} /> : null}

            {ledger.data ? (
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <StatTile
                        label="Measured impact"
                        value={money(ledger.data.totalRealizedImpact)}
                        tone="positive"
                    />
                    <StatTile
                        label="Changes implemented"
                        value={String(ledger.data.totalImplemented)}
                    />
                    <StatTile
                        label="Companies with impact"
                        value={String(ledger.data.companiesWithImpact)}
                    />
                </div>
            ) : null}

            {!agents.loading && !agents.error && rows.length === 0 ? (
                <EmptyState
                    title="No agent activity"
                    body="The agents report once they have read something. Nothing has been read yet."
                />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
                {rows.map((agent) => (
                    <Card key={agent.name} title={agent.label} subtitle={agent.mandate}>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="info">{agent.domain}</Badge>
                            <Badge tone={agent.openSignals > 0 ? "warning" : "neutral"}>
                                {agent.openSignals} open
                            </Badge>
                            {agent.implementedSignals > 0 ? (
                                <Badge tone="positive">{agent.implementedSignals} implemented</Badge>
                            ) : null}
                            {agent.declinedSignals > 0 ? (
                                <Badge tone="neutral">{agent.declinedSignals} declined</Badge>
                            ) : null}
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                                <dt className="text-surface-500">Open estimated impact</dt>
                                <dd className="text-surface-200">
                                    {money(agent.openEstimatedImpact)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-surface-500">Realized impact</dt>
                                <dd className="text-surface-200">{money(agent.realizedImpact)}</dd>
                            </div>
                            <div>
                                <dt className="text-surface-500">Approved</dt>
                                <dd className="text-surface-200">{agent.approvedSignals}</dd>
                            </div>
                            <div>
                                <dt className="text-surface-500">Last updated</dt>
                                <dd className="text-surface-200">
                                    {agent.lastUpdatedAt
                                        ? new Date(agent.lastUpdatedAt).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                          })
                                        : "Never"}
                                </dd>
                            </div>
                        </dl>
                    </Card>
                ))}
            </div>

            {ledger.data && ledger.data.recent.length > 0 ? (
                <div className="mt-8">
                    <Card title="Recently measured" subtitle="Implemented changes and what they moved.">
                        <ul className="divide-y divide-white/5">
                            {ledger.data.recent.map((entry) => (
                                <li
                                    key={`${entry.companyId}-${entry.title}-${entry.updatedAt}`}
                                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm text-white">{entry.title}</p>
                                        <p className="mt-0.5 text-xs text-surface-500">
                                            {entry.agent} ·{" "}
                                            {new Date(entry.updatedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span className="text-sm text-emerald-300">
                                        {money(entry.realizedImpact)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
