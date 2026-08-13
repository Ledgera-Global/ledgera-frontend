"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { INSTITUTIONAL_LINKS } from "./InstitutionalNav";

// ─── App Header / Navigation ─────────────────────────────────────────
// One shared header for every authenticated/admin page.
//
// Desktop (lg+): horizontal nav with the core tabs inline. The
// "Plugins" tab expands into a dropdown listing every institutional
// page (Risk, Lender Readiness, Value Growth, ...).
//
// Mobile (<lg): hamburger opens a full-screen drawer. Every core tab is
// an accordion group; tabs that have sub-pages reveal them beneath the
// tab when tapped. Nothing overflows — each group is a clean vertical
// stack, so every destination is one or two taps away.

export interface HeaderTab {
  label: string;
  href: string;
  /** Optional child pages shown in a dropdown (desktop) / accordion (mobile). */
  children?: { label: string; href: string }[];
}

export const HEADER_TABS: HeaderTab[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  {
    label: "Plugins",
    href: "/analytics",
    children: [
      { label: "Analytics Overview", href: "/analytics" },
      ...INSTITUTIONAL_LINKS,
    ],
  },
];

const NAV_LINK_BASE =
  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors";
const NAV_LINK_IDLE =
  "text-surface-300 hover:bg-white/5 hover:text-white";
const NAV_LINK_ACTIVE =
  "bg-brand-500/15 text-white ring-1 ring-brand-400/30";

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);
}

function isTabActive(tab: HeaderTab, currentHref?: string): boolean {
  if (!currentHref) return false;
  if (tab.href === currentHref) return true;
  return tab.children?.some((child) => child.href === currentHref) ?? false;
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
        L
      </span>
      <span className="text-lg font-semibold text-white">Ledgera Global</span>
    </Link>
  );
}

function DesktopNav({ currentHref }: { currentHref?: string }) {
  const [openPlugin, setOpenPlugin] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openPlugin) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenPlugin(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPlugin(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPlugin]);

  return (
    <nav className="hidden items-center gap-2 lg:flex">
      {HEADER_TABS.map((tab) => {
        if (tab.children) {
          const pluginActive = isTabActive(tab, currentHref);
          return (
            <div key={tab.label} ref={rootRef} className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={openPlugin}
                onClick={() => setOpenPlugin((open) => !open)}
                className={`flex items-center gap-1.5 ${NAV_LINK_BASE} ${
                  pluginActive ? NAV_LINK_ACTIVE : NAV_LINK_IDLE
                } ${openPlugin ? "bg-white/5 text-white" : ""}`}
              >
                {tab.label}
                <Chevron open={openPlugin} />
              </button>
              {openPlugin && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-brand-400/20 bg-surface-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
                  <span className="block px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-brand-300/70">
                    Plugins
                  </span>
                  {tab.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpenPlugin(false)}
                      className={`block px-4 py-2.5 text-sm transition-colors ${
                        child.href === currentHref
                          ? "bg-brand-400/10 text-brand-200"
                          : "text-surface-300 hover:bg-surface-800 hover:text-white"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${NAV_LINK_BASE} ${
              tab.href === currentHref ? NAV_LINK_ACTIVE : NAV_LINK_IDLE
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({
  currentHref,
  open,
  onNavigate,
}: {
  currentHref?: string;
  open: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState<string[]>([
    ...HEADER_TABS.filter((tab) => isTabActive(tab, currentHref)).map(
      (tab) => tab.label
    ),
  ]);

  useLockBodyScroll(open);

  const toggleGroup = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onNavigate}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-l border-white/10 bg-surface-950/98 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={onNavigate}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <nav className="px-3 py-4">
              {HEADER_TABS.map((tab) => {
                const active = isTabActive(tab, currentHref);
                const groupOpen = expanded.includes(tab.label);
                const hasChildren = !!tab.children?.length;

                if (!hasChildren) {
                  return (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      onClick={onNavigate}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        active
                          ? "bg-brand-500/15 text-white"
                          : "text-surface-200 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                }

                return (
                  <div key={tab.label} className="mb-1">
                    <button
                      type="button"
                      aria-expanded={groupOpen}
                      onClick={() => toggleGroup(tab.label)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        active
                          ? "bg-brand-500/15 text-white"
                          : "text-surface-200 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {tab.label}
                      <Chevron open={groupOpen} />
                    </button>
                    {groupOpen && (
                      <div className="mt-1 space-y-0.5 border-l border-white/10 pl-3">
                        {tab.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                              child.href === currentHref
                                ? "bg-brand-400/10 text-brand-200"
                                : "text-surface-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default function AppHeader({
  currentHref,
  transparent = false,
}: {
  /** The href of the current page, used to highlight the active tab. */
  currentHref?: string;
  /** When true the header has no background until the page scrolls. */
  transparent?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const solid = !transparent || scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid
            ? "border-b border-white/5 bg-surface-950/90 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Logo />
          <DesktopNav currentHref={currentHref} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-surface-300 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav
        currentHref={currentHref}
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
    </>
  );
}
