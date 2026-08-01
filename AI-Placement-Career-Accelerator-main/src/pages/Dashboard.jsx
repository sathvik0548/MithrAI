import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
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

// ── Icons (inline SVG) ──────────────────────────────────────────────────────
const Icon = ({ d, color = "currentColor", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  resume: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  interview: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  roadmap: "M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18",
  human: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  trend: "M23 6l-9.5 9.5-5-5L1 18",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
  play: "M5 3l14 9-14 9V3z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
};

// ── Color palette ───────────────────────────────────────────────────────────
const C = {
  primary: "#6C63FF",
  primaryDark: "#4B44D6",
  primaryLight: "#EEF0FF",
  bg: "#F4F5FF",
  sidebar: "#1A1D2E",
  sidebarHover: "#252842",
  white: "#FFFFFF",
  text: "#1A1D2E",
  muted: "#8B8FA8",
  green: "#22C55E",
  orange: "#F97316",
  teal: "#06B6D4",
  pink: "#EC4899",
  card: "#FFFFFF",
  border: "#E8EAFF",
};

// ── Data ────────────────────────────────────────────────────────────────────


// ── Activities ──────────────────────────────────────────────────────────────


// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, iconPath, iconBg, trend }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: "20px 24px",
      flex: 1, minWidth: 180, boxShadow: "0 2px 12px rgba(108,99,255,.08)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{title}</span>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={iconPath} color={C.primary} size={18} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.green }}>
        <Icon d={icons.trend} color={C.green} size={13} />
        <span>{trend}</span>
      </div>
    </div>
  );
}

// ── Pages ───────────────────────────────────────────────────────────────────
function Dashboard() {
  
  const token = localStorage.getItem("token");

const [currentUser, setCurrentUser] = useState(null);
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);
const [progressData, setProgressData] = useState([]);

const activities = dashboardData?.activities || [];

  useEffect(() => {

    const loadDashboard = async () => {

    try {

        const response = await axios.get(
    "http://localhost:5050/api/dashboard",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setCurrentUser(response.data.user);

        setDashboardData(response.data);

        setProgressData(response.data.progress || []);

    } catch (err) {

        console.log(err);

    } finally {

        setLoading(false);

    }
};

    loadDashboard();

}, 
[]);


  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "Inter, sans-serif",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

        <div
          style={{
            background: C.white,
            padding: "18px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${C.border}`,
          }}
        >

          <div>

            <h2>
              Welcome , {currentUser?.name || "User"} 
            </h2>

          </div>

          <div>

            <h3>{currentUser?.name || "User"}</h3>

            <p>{currentUser?.email || ""}</p>

          </div>

        </div>

        <div style={{ padding: 30 }}>

          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
            }}
          >

            <StatCard
              title="Resume Analysis"
              value={dashboardData?.statistics?.resumeCount || 0}
              trend="Completed"
              iconPath={icons.resume}
              iconBg="#EEF0FF"
            />

            <StatCard
              title="Interviews"
              value={dashboardData?.statistics?.interviewCount || 0}
              trend="Completed"
              iconPath={icons.interview}
              iconBg="#F0FFFE"
            />

            <StatCard
              title="Roadmaps"
              value={dashboardData?.statistics?.roadmapCount || 0}
              trend="Completed"
              iconPath={icons.roadmap}
              iconBg="#FFF7ED"
            />

          </div>

          <br />

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="ats"
                stroke="#6C63FF"
              />

              <Line
                type="monotone"
                dataKey="interview"
                stroke="#06B6D4"
              />

            </LineChart>
          </ResponsiveContainer>

          <br />

          <h2>Recent Activities</h2>

          {

            activities.length === 0 ?

            (

              <p>No activities found.</p>

            )

            :

            (

              activities.map((activity) => (

                <div
                  key={activity._id}
                  style={{
                    marginBottom: 15,
                    padding: 10,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                  }}
                >

                  <b>{activity.activity}</b>

                  <br />

                  <small>
                    {new Date(activity.createdAt).toLocaleString()}
                  </small>

                </div>

              ))

            )

          }

        </div>

      </div>

    </div>

  );

}

export default Dashboard;

