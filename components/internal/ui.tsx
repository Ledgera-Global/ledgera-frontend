"use client";
import type { ReactNode } from "react";

/**
 * The employee workspace's presentational primitives.
 *
 * These follow the product's established house style - deep navy surfaces,
 * brass accents, generously rounded panels - because the internal workspace sits
 * inside the same application as the customer pages. An employee who moves
 * between the two should not feel they have crossed into a different product.
 *
 * Every component here is presentational. No component fetches, and none of
 * them decides what is true - they render what the page passes down.
 */

// ─── Page structure ──────────────────────────────────────────────────────

export function PageHeader({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
                {subtitle ? (
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-surface-300">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
    );
}

export function Card({
    title,
    subtitle,
    actions,
    children,
    className = "",
}: {
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-[2rem] border border-white/10 bg-surface-900/40 p-6 shadow-xl shadow-black/20 ${className}`}
        >
            {title ? (
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white">{title}</h2>
                        {subtitle ? (
                            <p className="mt-0.5 text-xs text-surface-400">{subtitle}</p>
                        ) : null}
                    </div>
                    {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
                </header>
            ) : null}
            {children}
        </section>
    );
}

export function SectionHeading({ children, note }: { children: ReactNode; note?: string }) {
    return (
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                {children}
            </h2>
            {note ? <span className="text-xs text-surface-500">{note}</span> : null}
        </div>
    );
}

// ─── States ──────────────────────────────────────────────────────────────

export function EmptyState({ title, body }: { title: string; body?: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
            <p className="text-sm font-medium text-surface-200">{title}</p>
            {body ? <p className="mx-auto mt-1 max-w-md text-xs text-surface-400">{body}</p> : null}
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div
            role="alert"
            className="rounded-2xl border border-red-400/25 bg-red-400/5 px-5 py-6 text-center"
        >
            <p className="text-sm font-medium text-red-200">{message}</p>
            <p className="mt-1 text-xs text-surface-400">
                Nothing is shown rather than something inaccurate.
            </p>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-surface-100 transition-colors hover:bg-white/5"
                >
                    Try again
                </button>
            ) : null}
        </div>
    );
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="h-16 animate-pulse rounded-2xl border border-white/5 bg-surface-900/50"
                />
            ))}
        </div>
    );
}

// ─── Form primitives ─────────────────────────────────────────────────────

const FIELD_CLASS =
    "w-full rounded-xl border border-white/10 bg-surface-950/60 px-3 py-2 text-sm text-white placeholder:text-surface-500 focus:border-brand-400/50 focus:outline-none";

export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-surface-400">
                {label}
            </span>
            {children}
            {hint ? <span className="mt-1 block text-xs text-surface-500">{hint}</span> : null}
        </label>
    );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${FIELD_CLASS} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...props} className={`${FIELD_CLASS} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={`${FIELD_CLASS} ${props.className ?? ""}`} />;
}

export function PrimaryButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-full bg-brand-400 px-4 py-2 text-sm font-medium text-surface-950 transition-colors hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                props.className ?? ""
            }`}
        >
            {children}
        </button>
    );
}

export function GhostButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-surface-100 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
                props.className ?? ""
            }`}
        >
            {children}
        </button>
    );
}

/** A short, dismissible notice - used for form outcomes that are not full errors. */
export function Notice({
    tone = "info",
    children,
}: {
    tone?: "info" | "error" | "success";
    children: ReactNode;
}) {
    const tones = {
        info: "border-white/10 bg-white/5 text-surface-200",
        error: "border-red-400/25 bg-red-400/10 text-red-200",
        success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    } as const;

    return (
        <p className={`rounded-xl border px-3 py-2 text-xs ${tones[tone]}`} role="status">
            {children}
        </p>
    );
}
