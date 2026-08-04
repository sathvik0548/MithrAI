import React from "react";

/**
 * Generic reusable stat tile — used for the small "ATS Score / Interviews
 * Taken / Average Score" style cards. Accepts an icon node, a title,
 * a big value, and an optional trend line.
 *
 * <StatsCard title="ATS Score" value="85/100" trend="12% this week" />
 */
export default function StatsCard({
  title,
  value,
  trend,
  icon = null,
  iconBg = "#EEF0FF",
  accent = "#6C63FF",
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        flex: "1 1 180px",
        minWidth: 180,
        boxShadow: "0 2px 12px rgba(108,99,255,.08)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#8B8FA8", fontWeight: 500 }}>{title}</span>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1D2E", lineHeight: 1.1 }}>{value}</div>

      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: accent }}>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
