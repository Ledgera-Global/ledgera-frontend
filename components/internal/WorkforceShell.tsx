"use client";
import AppHeader from "@/components/layouts/AppHeader";
import InternalGuard from "@/components/InternalGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DesktopRail, MobileNavToggle } from "./WorkforceNav";

/**
 * The employee workspace frame: access gate, header, navigation, content.
 *
 * The access decision is not made here. `InternalGuard` asks the server which
 * account this is, and every workspace endpoint re-checks employment again on
 * each request. This component only decides what the frame looks like.
 */

function pageTitle(pathname: string): string {
    if (pathname === "/internal/workforce") return "Command center";
    const last = pathname.split("/").filter(Boolean).pop() ?? "";
    return last.replace(/-/g, " ").replace(/^\w/, (character) => character.toUpperCase());
}

export default function WorkforceShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <InternalGuard>
            <div className="min-h-screen bg-surface-950 text-surface-100">
                <AppHeader currentHref={pathname} transparent />

                <div className="pt-20">
                    <div className="mx-auto flex max-w-[100rem] px-4 lg:px-8">
                        <DesktopRail />

                        <div className="min-w-0 flex-1">
                            {/* Compact bar for narrow screens, where the rail is hidden. */}
                            <div className="flex items-center justify-between gap-3 py-4 lg:hidden">
                                <span className="truncate text-sm font-medium text-surface-200">
                                    {pageTitle(pathname)}
                                </span>
                                <MobileNavToggle />
                            </div>

                            <main className="px-1 pb-16 pt-6 lg:px-8 lg:pt-10">{children}</main>
                        </div>
                    </div>
                </div>

                <footer className="border-t border-white/5 bg-surface-950/70">
                    <div className="mx-auto flex max-w-[100rem] flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-surface-500 sm:flex-row lg:px-10">
                        <span>&copy; {new Date().getFullYear()} Ledgera Global Inc. — internal use only</span>
                        <Link
                            href="/internal/ledgera-console"
                            className="transition-colors hover:text-surface-200"
                        >
                            Operating console
                        </Link>
                    </div>
                </footer>
            </div>
        </InternalGuard>
    );
}
