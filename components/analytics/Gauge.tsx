"use client";
import { gaugeColor } from "@/lib/constants/styling";

interface GaugeProps {
  score: number;
  size?: number;
}

export function Gauge({ score, size = 140 }: GaugeProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filledLength = (score / 100) * circumference;
  const color = gaugeColor(score);
  const center = size / 2;

  return (
    <svg width={size} height={size} className="shrink-0" role="img" aria-label={`Score: ${score}/100`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${filledLength} ${circumference - filledLength}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className="transition-all duration-1000"
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="32" fontWeight="700">
        {score}
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="11">
        / 100
      </text>
    </svg>
  );
}
