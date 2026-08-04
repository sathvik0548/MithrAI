import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

/* ── Terracotta/cream design tokens ─────────────────────────────────────── */
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

/* ── Inline SVG icon (no emoji) ─────────────────────────────────────────── */
const Icon = ({ d, color = C.primary, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  resume:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  interview: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  roadmap:   "M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4z M8 2v16 M16 6v16",
  book:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  trend:     "M23 6l-9.5 9.5-5-5L1 18",
};

/* ── Read stats from localStorage (same source as each tool) ──────────── */
function readLocalStats() {
  try {
    const roadmaps    = JSON.parse(localStorage.getItem("mithrai_roadmaps")   || "[]");
    const interviews  = JSON.parse(localStorage.getItem("mithrai_interviews") || "[]");
    const analyses    = JSON.parse(localStorage.getItem("mithrai_analyses")   || "[]");
    return {
      resumeCount:    analyses.length,
      interviewCount: interviews.length,
      roadmapCount:   roadmaps.length,
    };
  } catch { return { resumeCount: 0, interviewCount: 0, roadmapCount: 0 }; }
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ title, value, iconPath, iconBg }) {
  return (
    <div style={{
      background: C.white, borderRadius: 10, padding: "20px 22px",
      flex: 1, minWidth: 160,
      border: `1.5px solid ${C.border}`,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, fontFamily: C.sans, textTransform: "uppercase", letterSpacing: ".04em" }}>{title}</span>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: iconBg || C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={iconPath} color={C.primary} size={17} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, fontFamily: C.serif }}>{value ?? 0}</div>
    </div>
  );
}

/* ── Quick action card ──────────────────────────────────────────────────── */
function QuickAction({ iconPath, label, onClick, bg }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 130, padding: "20px 12px",
        background: hov ? C.primaryLight : C.white,
        border: `1.5px solid ${hov ? C.primary : C.border}`,
        borderRadius: 10, cursor: "pointer", textAlign: "center",
        transition: "all .2s", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10,
      }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={iconPath} color={C.primary} size={20} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.sans }}>{label}</div>
    </button>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumeCount: 0, interviewCount: 0, roadmapCount: 0 });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  // Load stats from localStorage (same source of truth as all tool pages)
  useEffect(() => {
    if (!user) return;
    setStats(readLocalStats());
    // Refresh when storage changes (e.g. user just finished an interview)
    const onStorage = () => setStats(readLocalStats());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: C.sans }}>
        <div>
          <div style={{ width: 44, height: 44, border: `3px solid ${C.primaryLight}`, borderTopColor: C.primary, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: C.muted, textAlign: "center", fontFamily: C.sans, fontSize: 14 }}>Loading…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName  = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "there";
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          background: C.white, padding: "16px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0, fontFamily: C.serif }}>
              Welcome back, {displayName}
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2, fontFamily: C.sans }}>
              Here's where your career prep stands today.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: C.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: C.sans,
            }}>
              {avatarLetter}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0, fontFamily: C.sans }}>{displayName}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: C.sans }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1 }}>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
            <StatCard title="Resumes Analyzed"  value={stats.resumeCount}    iconPath={ICONS.resume}    iconBg={C.primaryLight} />
            <StatCard title="Mock Interviews"   value={stats.interviewCount} iconPath={ICONS.interview} iconBg="#F0FAF5" />
            <StatCard title="Roadmaps"          value={stats.roadmapCount}   iconPath={ICONS.roadmap}   iconBg="#FDF6EC" />
          </div>

          {/* Quick actions */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14, fontFamily: C.serif }}>
              Quick actions
            </h3>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <QuickAction iconPath={ICONS.resume}    label="Analyze Resume"   onClick={() => navigate("/resume-analyzer")}  />
              <QuickAction iconPath={ICONS.interview} label="Start Interview"  onClick={() => navigate("/ai-mock-interview")} />
              <QuickAction iconPath={ICONS.roadmap}   label="View Roadmap"     onClick={() => navigate("/roadmap")}           />
              <QuickAction iconPath={ICONS.book}      label="Book Expert"      onClick={() => navigate("/human-interview")}   />
            </div>
          </div>

          {/* Recent activity — empty state with clear message */}
          <div style={{ background: C.white, borderRadius: 10, padding: 24, border: `1.5px solid ${C.border}` }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.serif }}>
              Recent activity
            </h3>
            {stats.resumeCount === 0 && stats.interviewCount === 0 && stats.roadmapCount === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: C.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                }}>
                  <Icon d={ICONS.trend} color={C.primary} size={22} />
                </div>
                <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 6px", fontFamily: C.serif }}>
                  Nothing here yet
                </p>
                <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px", fontFamily: C.sans }}>
                  Start by analyzing your resume — it only takes a minute.
                </p>
                <button
                  onClick={() => navigate("/resume-analyzer")}
                  style={{
                    padding: "10px 22px", background: C.primary, color: "#fff",
                    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", fontFamily: C.sans,
                  }}>
                  Analyze my resume →
                </button>
              </div>
            ) : (
              <div style={{ color: C.muted, fontSize: 14, fontFamily: C.sans }}>
                {stats.resumeCount > 0 && (
                  <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <Icon d={ICONS.resume} color={C.primary} size={15} style={{ display: "inline", marginRight: 8 }} />
                    {stats.resumeCount} resume{stats.resumeCount > 1 ? "s" : ""} analyzed
                  </div>
                )}
                {stats.interviewCount > 0 && (
                  <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <Icon d={ICONS.interview} color={C.primary} size={15} style={{ display: "inline", marginRight: 8 }} />
                    {stats.interviewCount} mock interview{stats.interviewCount > 1 ? "s" : ""} completed
                  </div>
                )}
                {stats.roadmapCount > 0 && (
                  <div style={{ padding: "10px 0" }}>
                    <Icon d={ICONS.roadmap} color={C.primary} size={15} style={{ display: "inline", marginRight: 8 }} />
                    {stats.roadmapCount} roadmap{stats.roadmapCount > 1 ? "s" : ""} generated
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
