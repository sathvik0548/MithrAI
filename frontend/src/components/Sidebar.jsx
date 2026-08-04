import { useState } from "react";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaRobot,
  FaRoad,
  FaUserTie,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
  { to: "/resume-analyzer", icon: FaFileAlt, label: "Resume Analyzer" },
  { to: "/ai-mock-interview", icon: FaRobot, label: "AI Mock Interview" },
  { to: "/roadmap", icon: FaRoad, label: "Roadmap" },
  { to: "/human-interview", icon: FaUserTie, label: "Human Interview" },
  { to: "/profile", icon: FaUser, label: "Profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {}
    localStorage.clear();
    navigate("/login");
  };

  const closeOnMobile = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sidebar-mobile-bar">
        <button
          className="sidebar-burger"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <FaBars />
        </button>
        <span className="sidebar-mobile-logo">🎯 MithrAI</span>
      </div>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={closeOnMobile} />}

      <aside className={"sidebar" + (open ? " sidebar-open" : "")}>
        <div className="sidebar-top">
          <h2 className="logo">🎯 MithrAI</h2>
          <button
            className="sidebar-close"
            onClick={closeOnMobile}
            aria-label="Close navigation menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeOnMobile}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="menu-item logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>
    </>
  );
}
