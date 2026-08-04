import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav style={{ background: "#FFFBF5", borderBottom: "1px solid #E8D9CC", position: "sticky", top: 0, zIndex: 50, padding: "12px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#B4563E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Fraunces', Georgia, serif", fontWeight: 900, fontSize: 16 }}>M</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#2A1F1A", fontFamily: "'Inter', system-ui, sans-serif" }}>MithrAI</span>
        </Link>

        <div style={{ display: "flex", gap: 20, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif", alignItems: "center" }}>
          <NavLink to="/" style={{ color: "#7A6558", textDecoration: "none" }}>Home</NavLink>
          <NavLink to="/dashboard" style={{ color: "#7A6558", textDecoration: "none" }}>Dashboard</NavLink>
          <NavLink to="/resume-analyzer" style={{ color: "#7A6558", textDecoration: "none" }}>Resume Analyzer</NavLink>
          <NavLink to="/ai-mock-interview" style={{ color: "#7A6558", textDecoration: "none" }}>AI Mock Interview</NavLink>
          <NavLink to="/human-interview" style={{ color: "#7A6558", textDecoration: "none" }}>Human Interview</NavLink>
          <NavLink to="/roadmap" style={{ color: "#7A6558", textDecoration: "none" }}>Roadmap</NavLink>
          <NavLink to="/profile" style={{ color: "#7A6558", textDecoration: "none" }}>Profile</NavLink>
          <button onClick={logout} style={{ background: "none", border: "none", color: "#C1392B", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}