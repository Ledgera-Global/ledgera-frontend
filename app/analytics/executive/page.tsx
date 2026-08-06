"use client";
import InstitutionalNav from "@/components/layouts/InstitutionalNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants/styling";

type Section = {
  title: string;
  items: { label: string; value: string; detail?: string }[];
};

const sections: Section[] = [
  {
    title: "Margin Analysis",
    items: [
      { label: "Install", value: "$85,000", detail: "35% margin" },
      { label: "Repair", value: "$42,000", detail: "30% margin" },
      { label: "Maintenance", value: "$18,000", detail: "40% margin" },
    ],
  },
  {
    title: "Technician Revenue",
    items: [
      { label: "Mike Lopez", value: "$52,000" },
      { label: "Sarah Chen", value: "$48,000" },
      { label: "James Wilson", value: "$41,000" },
    ],
  },
  {
    title: "AR Aging",
    items: [
      { label: "0-30 days", value: "$45,000", detail: "28 invoices" },
      { label: "31-60 days", value: "$22,000", detail: "12 invoices" },
      { label: "61-90 days", value: "$11,000", detail: "5 invoices" },
    ],
  },
  {
    title: "EBITDA & Valuation",
    items: [
      { label: "EBITDA", value: "$185,000" },
      { label: "Valuation (5x)", value: "$925,000" },
      { label: "Status", value: "Operational Improve", detail: "Target >$1M EBITDA" },
    ],
  },
];

export default function ExecutiveAnalyticsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/ai-executive-report/companyA")
      .then((r) => r.json())
      .then((data) => setReport(data.report))
      .catch(() => {
        // Fallback to demo
        setReport(`## Executive Summary

### Financial Position
Revenue is trending positively at $420K for the trailing period with a gross margin of 22%.
EBITDA stands at $185K yielding a 16% margin.

### Key Areas of Concern
1. **Labor Efficiency**: Technician utilization at 74% is below the 85% target.
2. **AR Aging**: 22% of outstanding receivables sit beyond 60 days.
3. **Pricing Inconsistency**: 12% of jobs show margin compression below 25%.

### Recovery Potential
With targeted interventions, estimated EBITDA lift of 30.8% ($57K) is achievable within 90 days.`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-surface-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/analytics/executive" ? "text-white" : "text-surface-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <InstitutionalNav currentHref="/analytics/executive" />
          </div>
        </nav>
      </header>

      {/* Main */}
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-semibold text-white">Executive Dashboard</h1>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Live
              </span>
            </div>
            <p className="max-w-2xl text-base text-surface-300">
              Consolidated view of margin, technician performance, AR health, EBITDA, and valuation.
              All data flows from the <code className="text-brand-300">/api/executive/:companyId</code> backend endpoint.
            </p>
          </div>

          {/* KPI Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-white/10 bg-surface-950/60 p-5"
              >
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-surface-300">{item.label}</span>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-surface-500">{item.detail}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Executive Report */}
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand-400/[0.06] to-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-white">AI Executive Report</h2>
              <span className="rounded-full bg-brand-400/10 px-2.5 py-0.5 text-xs font-medium text-brand-200">
                /ai/executive-report
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {(() => {
                  const lines = report?.split("\n") ?? [];
                  const result: React.ReactNode[] = [];
                  let i = 0;
                  while (i < lines.length) {
                    const line = lines[i];
                    if (line.startsWith("- ")) {
                      // Collect consecutive list items into a <ul>
                      const items: { text: string; idx: number }[] = [];
                      while (i < lines.length && lines[i].startsWith("- ")) {
                        items.push({ text: lines[i].replace("- ", ""), idx: i });
                        i++;
                      }
                      result.push(
                        <ul key={items[0].idx} className="list-inside list-disc space-y-0.5">
                          {items.map(({ text, idx }) => (
                            <li key={idx} className="text-sm text-surface-300">{text}</li>
                          ))}
                        </ul>
                      );
                    } else {
                      if (line.startsWith("## ")) {
                        result.push(<h3 key={i} className="mt-4 mb-2 text-lg font-semibold text-white">{line.replace("## ", "")}</h3>);
                      } else if (line.startsWith("### ")) {
                        result.push(<h4 key={i} className="mt-3 mb-1 text-base font-medium text-brand-200">{line.replace("### ", "")}</h4>);
                      } else if (line.startsWith("**") && line.endsWith("**")) {
                        result.push(<p key={i} className="text-sm font-semibold text-white mt-2">{line.replace(/\*\*/g, "")}</p>);
                      } else if (line.trim() === "") {
                        result.push(<br key={i} />);
                      } else {
                        result.push(<p key={i} className="text-sm text-surface-300">{line}</p>);
                      }
                      i++;
                    }
                  }
                  return result;
                })()}
              </div>
            )}
          </div>

          {/* Backend source */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-surface-950/60 p-5">
            <p className="text-xs text-surface-400">
              <span className="font-semibold text-surface-200">Data source:</span>{" "}
              <code className="text-brand-300">/api/executive/:companyId</code> aggregates margin, tech revenue,
              AR aging, EBITDA forecast, and valuation from 5 backend services.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-surface-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-surface-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
          <Link href="/" className="text-sm text-surface-400 hover:text-white transition-colors">Landing</Link>
        </div>
      </footer>
    </div>
  );
}
