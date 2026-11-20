import type {
  MetricDefinition,
  MetricSnapshot,
  SnapshotVerification,
} from "@/lib/types/metricStandard";

/**
 * How a published figure is rendered.
 *
 * The rule this file enforces: a figure is never shown without its unit, and a
 * refusal is never shown as a blank. `1000000` means nothing; "1,000,000 USD"
 * does, and "refused: base at or below zero" is a decision someone can act on
 * where an empty cell is just a hole in the screen.
 */

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats a figure according to the unit its definition carries. */
export function formatMetricValue(
  value: number | null,
  unit: string
): string {
  if (value === null) return "Refused";
  if (!Number.isFinite(value)) return "Not a finite number";

  switch (unit) {
    case "usd":
      return CURRENCY.format(value);
    case "ratio":
      // A ratio is stored as a fraction; people read percentages.
      return `${(value * 100).toFixed(1)}%`;
    case "score":
      return `${value.toFixed(0)} / 100`;
    default:
      return `${formatPlainNumber(value)} ${unit}`;
  }
}

function formatPlainNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

/** "2026-01-01..2026-12-31" reads better as a labelled period. */
export function formatPeriod(snapshot: MetricSnapshot): string {
  if (snapshot.periodLabel.trim() !== "") return snapshot.periodLabel;
  return `${formatDate(snapshot.periodStart)} – ${formatDate(snapshot.periodEnd)}`;
}

export function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The one-line answer to "is this figure still what it was when it was sealed".
 *
 * Deliberately not a pass/fail pill. A snapshot can fail for a reason that does
 * not invalidate the figure (a historical definition this build no longer
 * publishes) and pass while still resting on inputs nobody has attested. The
 * summary names which of those happened.
 */
export function describeVerification(verification: SnapshotVerification): string {
  if (verification.ok && verification.definitionIsCurrent) {
    return "Sealed and intact: the body hashes to its digest, the inputs hash to theirs, and the cited definition is still published unchanged.";
  }
  if (verification.ok && !verification.definitionIsCurrent) {
    return "Intact but historical: the record is unchanged since sealing, but this build no longer publishes the definition it cites, so the figure is readable rather than reproducible.";
  }
  const failed = verification.checks.filter((check) => !check.passed);
  const names = failed.map((check) => check.name).join(", ");
  return `Verification failed: ${names}. Do not treat this figure as a record of what the platform claimed.`;
}

export function refusalRuleText(definition: MetricDefinition): string {
  switch (definition.refusalRule) {
    case "when-not-positive":
      return "Refuses to publish at or below zero, on this metric's definition.";
    case "never":
      return "Always quotable; a refusal here would be a producer error.";
    default:
      return `Refusal rule: ${definition.refusalRule}.`;
  }
}

/**
 * The earnings basis, spelled out.
 *
 * The standard publishes a one-character token (`z`) because a token is what
 * appears inside a covenant citation. A token is not an explanation, and a
 * reader who sees bare `z` learns nothing - so the known tokens are expanded
 * here in the words the earnings standard uses, and an unknown token is shown
 * as unknown rather than guessed at.
 */
const EARNINGS_BASIS_MEANINGS: Record<string, string> = {
  z: "settled cash: collected job cash is the only revenue counted",
};

export function earningsBasisText(basis: string | null): string | null {
  if (basis === null) return null;
  const token = basis.trim();
  if (token === "") return null;
  const meaning = EARNINGS_BASIS_MEANINGS[token];
  if (meaning === undefined) {
    return `${token} (a basis token this build does not document)`;
  }
  return `${token} — ${meaning}`;
}

/** The inputs a definition requires, with any the quote recorded marked as present. */
export function requiredInputStatus(
  definition: MetricDefinition,
  snapshot: MetricSnapshot | null
): { name: string; present: boolean }[] {
  return definition.requiredInputs.map((name) => ({
    name,
    present: snapshot !== null && Object.prototype.hasOwnProperty.call(snapshot.inputs, name),
  }));
}

/**
 * A digest, shortened for display but never silently.
 *
 * Twelve characters is enough to compare two on screen by eye; the full value
 * stays available to anything that needs it, and truncation is marked so nobody
 * copies a prefix believing it is the whole hash.
 */
export function shortDigest(digest: string): string {
  if (digest.length <= 16) return digest;
  return `${digest.slice(0, 12)}…`;
}
