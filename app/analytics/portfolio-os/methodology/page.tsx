import AppHeader from "@/components/layouts/AppHeader";
import Link from "next/link";
import type { ReactNode } from "react";
import { HEALTH_LABELS } from "@/lib/portfolioOsDisplay";

import {
  ACCESS_MODEL,
  CAPITAL_ALLOCATION_RULES,
  DATA_COMPLETENESS_RULES,
  EV_BAND_HIGH,
  EV_BAND_LOW,
  EV_MULTIPLE,
  HEALTH_BAND_RULES,
  PORTFOLIO_METRICS,
  RANKING_RULES,
  WHAT_IS_NOT_CLAIMED,
  type MethodStatement,
  type MetricUnit,
} from "@/lib/portfolioOsMethodology";
/**
 * How the Portfolio OS numbers are calculated.
 *
 * A static page, deliberately: the rules are published before anyone reads a
 * figure, and it has to stay readable by someone who is not signed in and by an
 * auditor who wants the definitions without the data. Nothing here is fetched,
 * so there is no state in which the methodology fails to load.
 *
 * Every rule on this page is mirrored from the backend engine that implements
 * it. Where a value is also returned on an API payload - the EV multiple and the
 * band note - the screens render the payload value, and the constants here only
 * describe the published band.
 */

const UNIT_LABELS: Record<MetricUnit, string> = {
  usd: "USD",
  percent: "Percent",
  count: "Count",
};

const EV_MID_LABEL = `${EV_MULTIPLE}x`;
const EV_BAND_LABEL = `${EV_MULTIPLE * EV_BAND_LOW}x to ${
  EV_MULTIPLE * EV_BAND_HIGH
}x`;

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mb-5 max-w-3xl text-sm text-surface-400">{intro}</p>
      {children}
    </section>
  );
}

function Statements({ items }: { items: readonly MethodStatement[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.title}>
          <h3 className="mb-1 text-sm font-semibold text-surface-100">
            {item.title}
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-surface-400">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-surface-400"
        >
          <span
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400/60"
          />
          <span className="max-w-3xl">{item}</span>
        </li>
      ))}
    </ul>
  );
}
export default function PortfolioOsMethodologyPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      <AppHeader currentHref="/analytics/portfolio-os" />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-20">
        <div className="mb-12">
          <Link
            href="/analytics/portfolio-os"
            className="text-sm text-brand-300 transition-colors hover:text-brand-200"
          >
            Back to Portfolio OS
          </Link>
          <h1 className="mb-3 mt-3 text-3xl font-semibold text-white">
            How these numbers are calculated
          </h1>
          <p className="max-w-3xl text-surface-400">
            Every figure on the Portfolio OS screens comes from a stated rule.
            This page is that statement: what is measured, how companies are
            ranked, how a capital opportunity is sized, and what the numbers do
            not claim. It is written for the person making the decision, not for
            the person who wrote the engine.
          </p>
        </div>
<Section
          id="measured"
          title="What is measured"
          intro="Every figure is computed for each company from completed work, and every screen states the basis of the one it is showing."
        >
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-surface-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Figure
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Unit
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Basis
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PORTFOLIO_METRICS.map((metric) => (
                  <tr key={metric.key}>
                    <td className="px-4 py-3 align-top font-medium text-surface-100">
                      {metric.label}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-surface-400">
                      {UNIT_LABELS[metric.unit]}
                    </td>
                    <td className="px-4 py-3 align-top text-surface-400">
                      {metric.basis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="health"
          title="Health bands"
          intro="The health band is relative to this portfolio, not to an external standard. Each band is stated with the exact rule that assigns it."
        >
          <ul className="space-y-4">
            {HEALTH_BAND_RULES.map((rule) => (
              <li
                key={rule.band}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <h3 className="mb-2 text-sm font-semibold text-white">
                  {HEALTH_LABELS[rule.band]}
                </h3>
                <p className="mb-2 text-sm leading-relaxed text-surface-300">
                  {rule.rule}
                </p>
                <p className="text-sm leading-relaxed text-surface-500">
                  {rule.meaning}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="ranking"
          title="How companies are ordered"
          intro="One ranking rule per screen, stated so a reader can reproduce the order by hand."
        >
          <Statements items={RANKING_RULES} />
        </Section>
<Section
          id="capital"
          title="How capital opportunity is sized"
          intro={`The capital-allocation view answers one question: if the next dollar went into a company the portfolio already owns, which company is the largest prize. The published band is ${EV_BAND_LABEL} EBITDA, expressed as ${EV_BAND_LOW} to ${EV_BAND_HIGH} of the ${EV_MID_LABEL} mid case.`}
        >
          <Statements items={CAPITAL_ALLOCATION_RULES} />
        </Section>

        <Section
          id="not-claimed"
          title="What these figures do not claim"
          intro="An opportunity figure next to a company name reads as an expected return unless the limits are stated on the same screen. These are the limits."
        >
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
            <Bullets items={WHAT_IS_NOT_CLAIMED} />
          </div>
        </Section>

        <Section
          id="missing"
          title="Missing data"
          intro="One rule governs every absent figure, and it is the rule that stops a company which has never synced from reading as a company worth nothing."
        >
          <Bullets items={DATA_COMPLETENESS_RULES} />
        </Section>

        <Section
          id="access"
          title="Who can see what"
          intro="Portfolio data spans companies, so access is checked per portfolio on every request rather than per session."
        >
          <Bullets items={ACCESS_MODEL} />
        </Section>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-white/10 pt-8 text-sm">
          <Link
            href="/analytics/portfolio-os"
            className="text-brand-300 transition-colors hover:text-brand-200"
          >
            Portfolio OS
          </Link>
          <Link
            href="/analytics/benchmarks"
            className="text-brand-300 transition-colors hover:text-brand-200"
          >
            Benchmarks
          </Link>
          <Link
            href="/analytics/capital"
            className="text-brand-300 transition-colors hover:text-brand-200"
          >
            Capital Intelligence
          </Link>
        </div>
      </main>
    </div>
  );
}
