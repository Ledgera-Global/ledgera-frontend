"use client";
import { Badge } from "@/components/internal/indicators";
import { Card, EmptyState, ErrorState, LoadingBlock, PageHeader } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import type { CapabilityReportEntry } from "@/lib/internal/workforceTypes";

/**
 * Capabilities.
 *
 * This screen exists to say "no" honestly. A capability that is not connected is
 * listed with what it would provide and who supplies it, rather than being
 * hidden or rendered as a zero - a zero reads as real data reporting a problem,
 * and it is not the same thing as a missing vendor.
 */

interface CapabilityPayload {
    capabilities: CapabilityReportEntry[];
    connected: string[];
    notConnected: string[];
}

export default function CapabilitiesPage() {
    const { data, error, loading, reload } = useWorkforce<CapabilityPayload>("capabilities");

    const entries = data?.capabilities ?? [];

    return (
        <div>
            <PageHeader
                title="Capabilities"
                subtitle="What is genuinely wired up, and what is not. Nothing here is a placeholder."
            />

            {loading ? <LoadingBlock rows={5} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {data ? (
                <div className="mb-6 flex flex-wrap gap-3">
                    <Badge tone="positive">{data.connected.length} connected</Badge>
                    <Badge tone={data.notConnected.length > 0 ? "warning" : "neutral"}>
                        {data.notConnected.length} not connected
                    </Badge>
                </div>
            ) : null}

            {!loading && !error && entries.length === 0 ? (
                <EmptyState
                    title="No capability report"
                    body="The report is generated from what the platform actually reaches. Nothing was reported."
                />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
                {entries.map((entry) => (
                    <Card
                        key={entry.key}
                        title={entry.label}
                        subtitle={entry.provides}
                        actions={
                            entry.status.connected ? (
                                <Badge tone="positive">Connected</Badge>
                            ) : (
                                <Badge tone="warning">Not connected</Badge>
                            )
                        }
                    >
                        {entry.status.connected ? (
                            <p className="text-sm text-surface-300">
                                Source:{" "}
                                <span className="text-white">{entry.status.source}</span>
                            </p>
                        ) : (
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-xs text-surface-500">Provider type</dt>
                                    <dd className="text-surface-200">{entry.status.vendorType}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-surface-500">When it is not there</dt>
                                    <dd className="text-surface-300">{entry.status.note}</dd>
                                </div>
                            </dl>
                        )}

                        <p className="mt-4 border-t border-white/5 pt-3 text-xs text-surface-500">
                            {entry.status.connected
                                ? "Figures on this screen come from the connection above."
                                : `Until it connects: ${entry.interimRoute}`}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
