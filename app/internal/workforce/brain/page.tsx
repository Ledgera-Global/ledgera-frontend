"use client";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "@/components/internal/indicators";
import type { Tone } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePost } from "@/lib/internal/workforceClient";
import { DOC_CATEGORIES, DOC_CATEGORY_LABELS } from "@/lib/internal/workforceTypes";
import type { DocCategory, DocView } from "@/lib/internal/workforceTypes";

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
 * The company brain.
 *
 * Search is submitted rather than run on every keystroke. The corpus is a few
 * hundred pages, and a request per character would put more load on the database
 * than reading the whole thing - the search that matters is the one where the
 * reader has finished typing.
 */

const DOC_TONES: Record<DocCategory, Tone> = {
    sop: "brand",
    policy: "info",
    engineering: "positive",
    playbook: "brand",
    product: "info",
    finance: "warning",
};

function excerpt(body: string, limit = 180): string {
    const flat = body.replace(/\s+/g, " ").trim();
    return flat.length > limit ? `${flat.slice(0, limit)}\u2026` : flat;
}

export default function CompanyBrainPage() {
    const [draft, setDraft] = useState("");
    const [committed, setCommitted] = useState("");
    const [category, setCategory] = useState<DocCategory | "">("");

    const params = new URLSearchParams();
    if (committed) params.set("q", committed);
    if (category) params.set("category", category);
    const suffix = params.toString();

    const { data, error, loading, reload } = useWorkforce<{ docs: DocView[]; query: string }>(
        suffix ? `docs?${suffix}` : "docs"
    );

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [newCategory, setNewCategory] = useState<DocCategory>("sop");
    const [tags, setTags] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedTitle, setSavedTitle] = useState<string | null>(null);

    function search(event: FormEvent) {
        event.preventDefault();
        setCommitted(draft.trim());
    }

    async function create(event: FormEvent) {
        event.preventDefault();
        if (!title.trim() || !body.trim() || saving) return;

        setSaving(true);
        setSaveError(null);
        setSavedTitle(null);
        try {
            await workforcePost("docs", {
                title: title.trim(),
                body: body.trim(),
                category: newCategory,
                tags: tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            });
            setSavedTitle(title.trim());
            setTitle("");
            setBody("");
            setTags("");
            reload();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Could not save the page.");
        } finally {
            setSaving(false);
        }
    }

    const docs = data?.docs ?? [];

    return (
        <div>
            <PageHeader
                title="Company brain"
                subtitle="How this company works, written down. Titles are unique, so there is one answer per question."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-5">
                    <form onSubmit={search} className="flex flex-wrap items-end gap-3">
                        <label className="min-w-[14rem] flex-1">
                            <span className="mb-1 block text-xs text-surface-400">Search</span>
                            <TextInput
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder="reimbursement, deploy, onboarding"
                            />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs text-surface-400">Category</span>
                            <Select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value as DocCategory | "")
                                }
                            >
                                <option value="">All categories</option>
                                {DOC_CATEGORIES.map((value) => (
                                    <option key={value} value={value}>
                                        {DOC_CATEGORY_LABELS[value]}
                                    </option>
                                ))}
                            </Select>
                        </label>
                        <PrimaryButton type="submit">Search</PrimaryButton>
                    </form>

                    {loading ? <LoadingBlock rows={4} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}

                    {!loading && !error && docs.length === 0 ? (
                        <EmptyState
                            title={committed ? "No page matches" : "The brain is empty"}
                            body={
                                committed
                                    ? `Nothing contains "${committed}". Try a shorter phrase, or write the page yourself.`
                                    : "Nothing has been written down yet. Start with how you do your own job."
                            }
                        />
                    ) : null}

                    <ul className="grid gap-3 sm:grid-cols-2">
                        {docs.map((doc) => (
                            <li key={doc.id}>
                                <Link
                                    href={`/internal/workforce/brain/${doc.id}`}
                                    className="block h-full rounded-2xl border border-white/10 bg-surface-900/50 p-5 transition-colors hover:border-brand-400/30 hover:bg-surface-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-medium text-white">{doc.title}</h3>
                                        <Badge tone={DOC_TONES[doc.category]}>
                                            {DOC_CATEGORY_LABELS[doc.category]}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-surface-400">
                                        {excerpt(doc.body)}
                                    </p>
                                    {doc.tags.length > 0 ? (
                                        <p className="mt-3 text-[11px] text-surface-500">
                                            {doc.tags.join(" · ")}
                                        </p>
                                    ) : null}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <Card title="Write a page" subtitle="A page that already exists must be edited, not duplicated.">
                    <form onSubmit={create} className="space-y-3">
                        <Field label="Title" hint="Unique. A second page with this title is refused.">
                            <TextInput
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Body">
                            <TextArea
                                rows={8}
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Category">
                            <Select
                                value={newCategory}
                                onChange={(event) => setNewCategory(event.target.value as DocCategory)}
                            >
                                {DOC_CATEGORIES.map((value) => (
                                    <option key={value} value={value}>
                                        {DOC_CATEGORY_LABELS[value]}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Tags" hint="Comma separated. Exact tags are searchable.">
                            <TextInput
                                value={tags}
                                onChange={(event) => setTags(event.target.value)}
                                placeholder="expenses, travel"
                            />
                        </Field>

                        {saveError ? <Notice tone="error">{saveError}</Notice> : null}
                        {savedTitle ? (
                            <Notice tone="success">Saved "{savedTitle}".</Notice>
                        ) : null}

                        <PrimaryButton type="submit" disabled={saving || !title.trim() || !body.trim()}>
                            {saving ? "Saving\u2026" : "Save page"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
