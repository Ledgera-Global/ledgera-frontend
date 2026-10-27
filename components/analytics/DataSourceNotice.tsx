import type { DataSource } from "@/lib/dataProvenance";

/**
 * States, on the page itself, whether the numbers below are the customer's own.
 *
 * The proxy labels every response, but a header is invisible to the person
 * reading the screen. This renders that label as text. It returns nothing for
 * `live`, because a correct reading needs no footnote; it is loud for the two
 * cases where the figures are not the customer's books.
 */

interface DataSourceNoticeProps {
  source: DataSource;
  /** What the screen would have measured, e.g. "attribution" or "coverage". */
  subject: string;
}

const DEMO_CLASSES =
  "border-amber-400/30 bg-amber-400/[0.07] text-amber-100";
const UNAVAILABLE_CLASSES =
  "border-rose-400/30 bg-rose-400/[0.07] text-rose-100";

export default function DataSourceNotice({
  source,
  subject,
}: DataSourceNoticeProps) {
  if (source === "live") return null;

  const isDemo = source === "demo";
  const tone = isDemo ? DEMO_CLASSES : UNAVAILABLE_CLASSES;

  return (
    <div
      role={isDemo ? "note" : "alert"}
      className={`mb-8 flex items-start gap-3 rounded-2xl border p-5 ${tone}`}
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <div className="space-y-1">
        <p className="text-sm font-semibold">
          {isDemo
            ? "Showing the worked example, not your books"
            : `${capitalise(subject)} could not be read`}
        </p>
        <p className="text-sm leading-relaxed opacity-90">
          {isDemo
            ? `No live ${subject} was returned for this company, so the numbers below come from the bundled sample company. They demonstrate how the analysis reads; they are not a claim about your business.`
            : `The backend refused or did not answer the read, so nothing is shown rather than the sample figures. ${capitalise(subject)} will populate once the connection is restored.`}
        </p>
      </div>
    </div>
  );
}

function capitalise(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}
