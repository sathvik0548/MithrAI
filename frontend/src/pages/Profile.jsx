import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

/* ── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  primary:      "#B4563E",
  primaryLight: "#F5E6DF",
  bg:           "#FDF6EC",
  bgWarm:       "#FAF0E3",
  white:        "#FFFFFF",
  text:         "#2A1F1A",
  muted:        "#7A6558",
  border:       "#E8D9CC",
  success:      "#2D9E6B",
  serif:        "'Fraunces',Georgia,serif",
  sans:         "'Inter',system-ui,sans-serif",
};

/* ── Read stats from localStorage (same source as Dashboard) ─────────── */
function readLocalStats() {
  try {
    const roadmaps   = JSON.parse(localStorage.getItem("mithrai_roadmaps")   || "[]");
    const interviews = JSON.parse(localStorage.getItem("mithrai_interviews") || "[]");
    const analyses   = JSON.parse(localStorage.getItem("mithrai_analyses")   || "[]");
    return {
      resumeCount:    analyses.length,
      interviewCount: interviews.length,
      roadmapCount:   roadmaps.length,
    };
  } catch { return { resumeCount: 0, interviewCount: 0, roadmapCount: 0 }; }
}

const Icon = ({ d, color = C.primary, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Profile() {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  const stats = readLocalStats();

  const displayName  = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const email        = user?.email || "";
  const initials     = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  const avatarUrl    = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const memberSince  = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const STAT_ITEMS = [
    { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6", label: "Resumes Analyzed",  value: stats.resumeCount    },
    { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",         label: "Interviews Taken",  value: stats.interviewCount },
    { icon: "M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4z M8 2v16 M16 6v16",                     label: "Roadmaps",          value: stats.roadmapCount   },
    { icon: "M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H3z", label: "Member Since", value: memberSince },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Page header */}
        <div style={{ background: C.white, padding: "18px 32px", borderBottom: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, fontFamily: C.serif }}>Profile</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 3, fontFamily: C.sans }}>Manage your account and view your progress.</p>
        </div>

        <div style={{ padding: 32, display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* ── Profile card ── */}
          <div style={{
            background: C.white, borderRadius: 12, padding: 32,
            border: `1.5px solid ${C.border}`, flex: "1 1 320px", maxWidth: 460,
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 4px", fontFamily: C.serif }}>Profile settings</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 28px", fontFamily: C.sans }}>Your account information from Supabase.</p>

            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 28 }}>
              {image || avatarUrl ? (
                <img
                  src={image || avatarUrl}
                  alt="Profile avatar"
                  style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: `3px solid ${C.primaryLight}` }}
                />
              ) : (
                /* Initials fallback — never shows as an empty ring */
                <div style={{
                  width: 88, height: 88, borderRadius: "50%", background: C.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: C.serif,
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    padding: "8px 18px", background: C.primaryLight, color: C.primary,
                    border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: C.sans,
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.target.style.background = C.primary; e.target.style.color = "#fff"; }}
                  onMouseLeave={e => { e.target.style.background = C.primaryLight; e.target.style.color = C.primary; }}
                >
                  Change photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                <p style={{ fontSize: 11, color: C.muted, marginTop: 6, fontFamily: C.sans }}>JPG, PNG up to 3 MB</p>
              </div>
            </div>

            {/* Fields — read-only from Supabase, editable name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FieldRow label="Full Name" value={displayName} />
              <FieldRow label="Email"     value={email}       />
              <FieldRow label="Member since" value={memberSince} />
            </div>

            <p style={{ fontSize: 12, color: C.muted, marginTop: 18, fontFamily: C.sans, lineHeight: 1.5 }}>
              Name and email come from your Supabase account. To update them, visit your account settings.
            </p>
          </div>

          {/* ── Stats card ── */}
          <div style={{
            background: C.white, borderRadius: 12, padding: 32,
            border: `1.5px solid ${C.border}`, flex: "1 1 240px", maxWidth: 320,
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 24px", fontFamily: C.serif }}>Your stats</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {STAT_ITEMS.map((item, i) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0",
                  borderBottom: i < STAT_ITEMS.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, background: C.primaryLight,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon d={item.icon} color={C.primary} size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: C.sans, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: C.serif }}>
                      {item.value ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#7A6558", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em", fontFamily: "'Inter',system-ui,sans-serif" }}>
        {label}
      </label>
      <div style={{
        padding: "11px 14px", background: "#FDF6EC", border: "1.5px solid #E8D9CC",
        borderRadius: 8, fontSize: 14, color: "#2A1F1A", fontFamily: "'Inter',system-ui,sans-serif",
      }}>
        {value || "—"}
      </div>
    </div>
  );
}