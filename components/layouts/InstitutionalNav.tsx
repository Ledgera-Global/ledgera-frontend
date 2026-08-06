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
];

export default function InstitutionalNav({
  currentHref,
  linkClassName = "text-xs text-surface-400 hover:text-white transition-colors",
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

  const isActive = currentHref != null && INSTITUTIONAL_LINKS.some((link) => link.href === currentHref);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center gap-1 rounded-md px-2 py-1 ${linkClassName} ${
          isActive ? "text-white" : ""
        }`}
      >
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
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <span className="block px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-surface-500">
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
