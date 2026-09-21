"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "@/components/internal/indicators";
import type { Tone } from "@/components/internal/indicators";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import { workforcePost } from "@/lib/internal/workforceClient";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/internal/workforceTypes";
import type { AnnouncementCategory, AnnouncementView } from "@/lib/internal/workforceTypes";

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
 * Announcements.
 *
 * Pinned items sort above newer ones because that is the entire point of
 * pinning: a leadership update should outrank a lunch-menu change posted after
 * it, and a feed sorted purely by date cannot express that.
 */

const CATEGORY_TONES: Record<AnnouncementCategory, Tone> = {
    company: "brand",
    product: "info",
    leadership: "warning",
    security: "danger",
    people: "neutral",
};

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function AnnouncementsPage() {
    const { data, error, loading, reload } = useWorkforce<{
        announcements: AnnouncementView[];
    }>("announcements");

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState<AnnouncementCategory>("company");
    const [pinned, setPinned] = useState(false);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    async function post(event: FormEvent) {
        event.preventDefault();
        if (!title.trim() || !body.trim() || posting) return;

        setPosting(true);
        setPostError(null);
        try {
            await workforcePost("announcements", {
                title: title.trim(),
                body: body.trim(),
                category,
                pinned,
            });
            setTitle("");
            setBody("");
            setPinned(false);
            reload();
        } catch (err) {
            setPostError(err instanceof Error ? err.message : "Could not post the announcement.");
        } finally {
            setPosting(false);
        }
    }

    const announcements = data?.announcements ?? [];

    return (
        <div>
            <PageHeader
                title="Announcements"
                subtitle="What the company wants everyone to know. Pinned first, then newest."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    {loading ? <LoadingBlock rows={3} /> : null}
                    {error ? <ErrorState message={error} onRetry={reload} /> : null}
                    {!loading && !error && announcements.length === 0 ? (
                        <EmptyState
                            title="Nothing posted yet"
                            body="When something is worth telling everyone, it goes here."
                        />
                    ) : null}

                    {announcements.map((announcement) => (
                        <article
                            key={announcement.id}
                            className={`rounded-[2rem] border p-6 ${
                                announcement.pinned
                                    ? "border-brand-400/25 bg-brand-400/5"
                                    : "border-white/10 bg-surface-900/40"
                            }`}
                        >
                            <header className="flex flex-wrap items-center gap-2">
                                {announcement.pinned ? <Badge tone="brand">Pinned</Badge> : null}
                                <Badge tone={CATEGORY_TONES[announcement.category]}>
                                    {announcement.category}
                                </Badge>
                                <span className="text-xs text-surface-500">
                                    {fmt(announcement.publishedAt)}
                                </span>
                            </header>
                            <h2 className="mt-3 text-lg font-semibold text-white">
                                {announcement.title}
                            </h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-surface-300">
                                {announcement.body}
                            </p>
                            <p className="mt-4 text-xs text-surface-500">
                                {announcement.authorName}
                                {announcement.authorRole ? ` - ${announcement.authorRole}` : ""}
                            </p>
                        </article>
                    ))}
                </div>

                <Card title="Post an announcement" subtitle="Visible to the whole company.">
                    <form onSubmit={post} className="space-y-3">
                        <Field label="Title">
                            <TextInput
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Body">
                            <TextArea
                                rows={5}
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                required
                            />
                        </Field>
                        <Field label="Category">
                            <Select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value as AnnouncementCategory)
                                }
                            >
                                {ANNOUNCEMENT_CATEGORIES.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <label className="flex items-center gap-2 text-xs text-surface-300">
                            <input
                                type="checkbox"
                                checked={pinned}
                                onChange={(event) => setPinned(event.target.checked)}
                                className="h-4 w-4 rounded border-white/20 bg-surface-900"
                            />
                            Pin to the top
                        </label>

                        {postError ? <Notice tone="error">{postError}</Notice> : null}

                        <PrimaryButton type="submit" disabled={posting || !title.trim() || !body.trim()}>
                            {posting ? "Posting\u2026" : "Post"}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </div>
    );
}
