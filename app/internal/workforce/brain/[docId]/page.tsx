"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/internal/indicators";
import { ErrorState, LoadingBlock, PageHeader } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { DOC_CATEGORY_LABELS } from "@/lib/internal/workforceTypes";
import type { DocView } from "@/lib/internal/workforceTypes";

/**
 * One page of the company brain.
 *
 * The id comes from `useParams` rather than the route's props: this is a client
 * component, and reading the param directly avoids the request-time params
 * promise entirely - the value is already known once the route has matched.
 */
export default function DocDetailPage() {
    const params = useParams<{ docId: string }>();
    const docId = typeof params?.docId === "string" ? params.docId : "";
    const { data, error, loading, reload } = useWorkforce<DocView>(`docs/${docId}`);

    return (
        <div>
            <Link
                href="/internal/workforce/brain"
                className="mb-4 inline-block text-xs text-surface-400 transition-colors hover:text-white"
            >
                &larr; Company brain
            </Link>

            {loading ? <LoadingBlock rows={5} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {data ? (
                <article className="max-w-3xl">
                    <PageHeader
                        title={data.title}
                        subtitle={`Updated ${new Date(data.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}`}
                        actions={<Badge tone="info">{DOC_CATEGORY_LABELS[data.category]}</Badge>}
                    />

                    <div className="rounded-[2rem] border border-white/10 bg-surface-900/40 p-8">
                        <p className="whitespace-pre-line text-sm leading-7 text-surface-200">
                            {data.body}
                        </p>
                    </div>

                    {data.tags.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {data.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-surface-400"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </article>
            ) : null}
        </div>
    );
}
