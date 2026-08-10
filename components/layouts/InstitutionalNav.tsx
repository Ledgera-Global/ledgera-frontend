import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Institutional Navigation ──────────────────────────────────────────
// Groups the institutional pages under a single dropdown so the header
// stays clean while keeping one-click access to every module.

export interface InstitutionalLink {
  label: string;
  href: string;
}

export const INSTITUTIONAL_LINKS: InstitutionalLink[] = [
  { label: "Institutional Risk", href: "/analytics/institutional-risk" },
  { label: "Lender Readiness", href: "/analytics/lender-readiness" },
  { label: "Value Growth", href: "/analytics/value-growth" },
  { label: "Missed Calls", href: "/analytics/missed-calls" },
  { label: "Marketing Profit", href: "/analytics/marketing-profit" },
  { label: "Benchmarks", href: "/analytics/benchmarks" },
];

export default function InstitutionalNav({
  currentHref,
  linkClassName = "border border-brand-400/30 bg-brand-500/10 text-sm font-medium text-brand-100 hover:border-brand-400/50 hover:bg-brand-500/20 transition-colors",
}: {
  currentHref?: string;
  linkClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const isActive =
    currentHref != null &&
    INSTITUTIONAL_LINKS.some((link) => link.href === currentHref);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ${linkClassName} ${
          isOpen || isActive
            ? "border-brand-400/60 bg-brand-500/25 text-white"
            : ""
        }`}
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 003.346 2.032.531.531 0 01.505.728c-.127.34-.274.673-.44 1A10.947 10.947 0 0010 15a10.947 10.947 0 00-3.75-9.003.531.531 0 01.505-.728 11.947 11.947 0 003.346-2.032z"
            clipRule="evenodd"
          />
        </svg>
        Institutional
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-brand-400/20 bg-surface-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <span className="block px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-brand-300/70">
            Institutional
          </span>
          {INSTITUTIONAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                link.href === currentHref
                  ? "bg-brand-400/10 text-brand-200"
                  : "text-surface-300 hover:bg-surface-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
