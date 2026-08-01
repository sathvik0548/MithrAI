import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Reusable progress-over-time line chart.
 *
 * <ProgressChart
 *   data={[{ date: "May 1", ats: 28, interview: 15 }, ...]}
 *   lines={[
 *     { key: "ats", name: "ATS Score", color: "#6C63FF" },
 *     { key: "interview", name: "Interview Score", color: "#06B6D4" },
 *   ]}
 * />
 */
export default function ProgressChart({
  data = [],
  lines = [],
  height = 220,
  title,
  xKey = "date",
  border = "#E8EAFF",
  muted = "#8B8FA8",
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        flex: "2 1 320px",
        minWidth: 280,
        boxShadow: "0 2px 12px rgba(108,99,255,.08)",
        boxSizing: "border-box",
      }}
    >
      {title && (
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#1A1D2E" }}>{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={border} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${border}`, fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
