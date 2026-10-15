/**
 * One headline figure on the portfolio dashboard.
 *
 * The subtitle is required rather than optional. Every number on this screen is
 * a sum over some subset of companies, and a tile that showed the figure without
 * saying what it covers would be the exact ambiguity the coverage block exists
 * to remove. If there is nothing to say about a tile, it should not be a tile.
 */
export default function PortfolioStatTile({
  label,
  value,
  subtitle,
  tone = "default",
}: {
  label: string;
  value: string;
  subtitle: string;
  tone?: "default" | "positive" | "warning";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : "text-white";

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/40 p-4">
      <p className="text-xs uppercase tracking-wider text-surface-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-surface-500">{subtitle}</p>
    </div>
  );
}
