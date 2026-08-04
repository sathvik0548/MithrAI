import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const C = {
  primary: "#6C63FF", primaryLight: "#EEF0FF", bg: "#F4F5FF",
  white: "#FFFFFF", text: "#1A1D2E", muted: "#8B8FA8",
  green: "#22C55E", card: "#FFFFFF", border: "#E8EAFF",
};

const Icon = ({ d, color = "currentColor", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  resume:    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  interview: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  roadmap:   "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18",
  trend:     "M23 6l-9.5 9.5-5-5L1 18",
};

function StatCard({ title, value, sub, iconPath, iconBg }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: "20px 24px",
      flex: 1, minWidth: 180, boxShadow: "0 2px 12px rgba(108,99,255,.08)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg || C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={iconPath} color={C.primary} size={18} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>{value ?? 0}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.green }}>
        <Icon d={icons.trend} color={C.green} size={13} />
        <span>{sub || "Completed"}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]         = useState({ resumeCount: 0, interviewCount: 0, roadmapCount: 0 });
  const [activities, setActivities] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [dataLoading, setDataLoading]   = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [statsRes, actRes] = await Promise.allSettled([
          API.get("/dashboard/stats"),
          API.get("/dashboard/activities"),
        ]);
        if (statsRes.status === "fulfilled") {
          const d = statsRes.value.data;
          setStats({
            resumeCount:    d.resumeCount   ?? d.statistics?.resumeCount   ?? 0,
            interviewCount: d.interviewCount?? d.statistics?.interviewCount?? 0,
            roadmapCount:   d.roadmapCount  ?? d.statistics?.roadmapCount  ?? 0,
          });
          setProgressData(d.progress || []);
        }
        if (actRes.status === "fulfilled") {
          setActivities(actRes.value.data?.activities || actRes.value.data || []);
        }
      } catch (e) {
        console.warn("Dashboard API unavailable, showing empty state", e.message);
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "Inter,sans-serif" }}>
        <div>
          <div style={{ width: 48, height: 48, border: "4px solid #EEF0FF", borderTopColor: "#6C63FF", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: C.muted, textAlign: "center" }}>Loading…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const avatarLetter = (user.user_metadata?.full_name || user.email || "U")[0].toUpperCase();
  const displayName  = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "Inter,sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          background: C.white, padding: "18px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
              Welcome back, {displayName}! 👋
            </h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
              Here's your career progress overview
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg,#6C63FF,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 16,
            }}>
              {avatarLetter}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{displayName}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1 }}>
          {/* Stats Row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
            <StatCard title="Resume Analyses" value={stats.resumeCount}    iconPath={icons.resume}    iconBg="#EEF0FF" />
            <StatCard title="Mock Interviews"  value={stats.interviewCount} iconPath={icons.interview} iconBg="#F0FFFE" />
            <StatCard title="Roadmaps"         value={stats.roadmapCount}   iconPath={icons.roadmap}   iconBg="#FFF7ED" />
          </div>

          {/* Progress chart */}
          {progressData.length > 0 && (
            <div style={{ background: C.white, borderRadius: 16, padding: 24, marginBottom: 28, boxShadow: "0 2px 12px rgba(108,99,255,.08)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis tick={{ fontSize: 12, fill: C.muted }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ats"       stroke="#6C63FF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="interview" stroke="#06B6D4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { label: "Analyze Resume",   icon: "📄", path: "/resume-analyzer",   bg: "#EEF0FF" },
              { label: "Start Interview",  icon: "🎯", path: "/ai-mock-interview",  bg: "#fce7f3" },
              { label: "View Roadmap",     icon: "🗺️", path: "/roadmap",            bg: "#ecfdf5" },
              { label: "Book Expert",      icon: "🤝", path: "/human-interview",    bg: "#fff7ed" },
            ].map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  flex: 1, minWidth: 140, padding: "18px 12px",
                  background: a.bg, border: "1.5px solid #E8EAFF",
                  borderRadius: 14, cursor: "pointer", textAlign: "center",
                  transition: "transform .2s,box-shadow .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(108,99,255,.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.label}</div>
              </button>
            ))}
          </div>

          {/* Recent Activities */}
          <div style={{ background: C.white, borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(108,99,255,.08)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: C.text }}>Recent Activities</h3>
            {dataLoading ? (
              <p style={{ color: C.muted, fontSize: 14 }}>Loading activities…</p>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
                <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>No activities yet. Start by analyzing your resume!</p>
              </div>
            ) : (
              activities.map((a, i) => (
                <div key={a.id || i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0", borderBottom: i < activities.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.text }}>{a.label || a.activity}</p>
                    {a.sub && <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{a.sub}</p>}
                  </div>
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
