export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 animate-pulse">
          <div className="h-4 w-1/2 rounded bg-surface-800 mb-4" />
          <div className="h-24 rounded bg-surface-800" />
        </div>
      ))}
    </div>
  );
}
