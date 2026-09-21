"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The employee workspace navigation.
 *
 * Grouped by what a person is doing rather than by which table the rows live in:
 * "My work" holds tasks, goals, requests, and training because that is how
 * someone thinks about their day; nobody opens a screen called "WorkforceGoal".
 *
 * The company brain, the queue, and the platform views sit lower because they
 * are visited deliberately, not daily.
 */

interface NavLink {
    label: string;
    href: string;
}

interface NavGroup {
    heading: string;
    links: NavLink[];
}

const ROOT = "/internal/workforce";

export const WORKFORCE_NAV: NavGroup[] = [
    {
        heading: "Today",
        links: [
            { label: "Command center", href: ROOT },
            { label: "Ask the copilot", href: `${ROOT}/copilot` },
        ],
    },
    {
        heading: "My work",
        links: [
            { label: "Tasks", href: `${ROOT}/tasks` },
            { label: "Goals", href: `${ROOT}/goals` },
            { label: "My requests", href: `${ROOT}/requests` },
            { label: "Learning", href: `${ROOT}/learning` },
        ],
    },
    {
        heading: "The company",
        links: [
            { label: "Announcements", href: `${ROOT}/announcements` },
            { label: "Company brain", href: `${ROOT}/brain` },
            { label: "Decision log", href: `${ROOT}/decisions` },
            { label: "Recognition", href: `${ROOT}/recognition` },
        ],
    },
    {
        heading: "People & operations",
        links: [
            { label: "Directory", href: `${ROOT}/directory` },
            { label: "Decision queue", href: `${ROOT}/queue` },
        ],
    },
    {
        heading: "Build & platform",
        links: [
            { label: "Ideas", href: `${ROOT}/ideas` },
            { label: "Roadmap", href: `${ROOT}/roadmap` },
            { label: "AI agents", href: `${ROOT}/agents` },
            { label: "Platform", href: `${ROOT}/platform` },
            { label: "Capabilities", href: `${ROOT}/capabilities` },
        ],
    },
];

/** The root is only "active" on an exact match, so it does not light up everywhere. */
function isActive(href: string, pathname: string): boolean {
    if (href === ROOT) return pathname === ROOT;
    return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="space-y-6">
            {WORKFORCE_NAV.map((group) => (
                <div key={group.heading}>
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-surface-500">
                        {group.heading}
                    </p>
                    <ul className="space-y-0.5">
                        {group.links.map((link) => {
                            const active = isActive(link.href, pathname);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={onNavigate}
                                        aria-current={active ? "page" : undefined}
                                        className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                                            active
                                                ? "bg-brand-400/12 text-brand-100 ring-1 ring-inset ring-brand-400/25"
                                                : "text-surface-300 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

export function DesktopRail() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-white/5 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto px-3 py-6">
                <NavList />
            </div>
        </aside>
    );
}

export function MobileNavToggle() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Close the drawer whenever the route changes, so a tap always lands.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-surface-100 transition-colors hover:bg-white/5 lg:hidden"
            >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                        fillRule="evenodd"
                        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                        clipRule="evenodd"
                    />
                </svg>
                Workspace
            </button>

            {open ? (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-r border-white/10 bg-surface-950/98 px-3 py-5 shadow-2xl shadow-black/60">
                        <div className="mb-4 flex items-center justify-between px-3">
                            <span className="text-sm font-semibold text-white">Workspace</span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close navigation"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                        <NavList onNavigate={() => setOpen(false)} />
                    </div>
                </div>
            ) : null}
        </>
    );
}
