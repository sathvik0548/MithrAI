import React from "react";

/**
 * Reusable circular ATS score gauge + label, matching the look used on
 * the Resume Analyzer page. Drop anywhere a compact score summary is needed.
 *
 * <ATSScoreCard score={85} />
 */
export default function ATSScoreCard({ score = 0, size = 128, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const progress = (clamped / 100) * circ;

  const color = clamped >= 80 ? "#10B981" : clamped >= 60 ? "#F59E0B" : "#EF4444";
  const label = clamped >= 80 ? "Great!" : clamped >= 60 ? "Good" : "Needs Work";
  const sub =
    clamped >= 80
      ? "Your resume is performing well."
      : clamped >= 60
      ? "A few improvements needed."
      : "Significant improvements needed.";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#8B8FA8",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        ATS Score
      </div>

      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8EAFF" strokeWidth={stroke} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${progress} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: size * 0.22, fontWeight: 900, color, lineHeight: 1 }}>{clamped}</span>
          <span style={{ fontSize: size * 0.085, color: "#8B8FA8" }}>/100</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 11, color: "#8B8FA8", maxWidth: 140, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  );
}
