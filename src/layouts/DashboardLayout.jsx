import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

/**
 * Shared shell for every authenticated page (Dashboard, Resume Analyzer,
 * AI Mock Interview, Roadmap, Human Interview, Profile) — renders the
 * collapsible Sidebar plus a scrollable content area for the page itself.
 *
 * Usage with React Router's nested routes:
 *   <Route element={<DashboardLayout />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/profile" element={<Profile />} />
 *   </Route>
 *
 * Can also be used directly as a wrapper: <DashboardLayout><Dashboard /></DashboardLayout>
 */
export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F4F5FF",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
