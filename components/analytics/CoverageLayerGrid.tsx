import { LAYER_BLOCKS, LAYER_CARRIES, LAYER_LABEL } from "@/lib/networkCoverageDisplay";
import type { LayerCoverage } from "@/lib/types/networkCoverage";

/**
 * Every economic layer, connected or not.
 *
 * A missing layer is not rendered as an empty slot waiting to be filled; it is
 * rendered with what its absence costs, because the cost is the reason an owner
 * would spend a week of their life on an integration.
 */
export default function CoverageLayerGrid({ layers }: { layers: LayerCoverage[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {layers.map((layer) => {
        const names = layer.connectedProviderNames ?? [];
        return (
          <div
            key={layer.layer}
            className={`rounded-2xl border p-5 ${
              layer.covered
                ? "border-emerald-400/25 bg-emerald-400/[0.04]"
                : "border-white/10 bg-surface-900/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">{LAYER_LABEL[layer.layer]}</h4>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  layer.covered
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                    : "border-white/15 bg-surface-950/60 text-surface-400"
                }`}
              >
                {layer.covered ? "Connected" : "Missing"}
              </span>
            </div>

            <p className="mt-2 text-xs text-surface-400">{LAYER_CARRIES[layer.layer]}</p>

            {layer.covered ? (
              <p className="mt-3 text-xs text-surface-300">
                {names.length > 0 ? names.join(", ") : `${layer.connectedProviderIds.length} live source`}
              </p>
            ) : (
              <p className="mt-3 border-t border-white/5 pt-3 text-xs text-surface-400">
                Without it: {LAYER_BLOCKS[layer.layer].charAt(0).toLowerCase()}
                {LAYER_BLOCKS[layer.layer].slice(1)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
