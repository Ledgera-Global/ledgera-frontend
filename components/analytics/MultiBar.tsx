"use client";

interface MultiBarProps {
  val: number;
  max: number;
}

export function MultiBar({ val, max }: MultiBarProps) {
  const pct = Math.min((val / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-surface-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-400 transition-all duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
