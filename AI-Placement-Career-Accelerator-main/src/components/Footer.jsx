import React from "react";

/**
 * Simple shared footer for marketing / public pages.
 * Not currently wired into any route — available to drop into
 * MainLayout or any standalone page that needs a footer.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#0f0d1a",
        color: "#9ca3af",
        padding: "40px 6% 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6c63ff, #ff6584)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          P
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>PlacementAI</span>
      </div>

      <p style={{ fontSize: 13, margin: 0 }}>© {year} PlacementAI. All rights reserved.</p>
      <p style={{ fontSize: 13, margin: 0 }}>Made with ❤️ for job seekers</p>
    </footer>
  );
}
