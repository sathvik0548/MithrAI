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
import "../styles/Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
  { to: "/resume-analyzer", icon: FaFileAlt, label: "Resume Analyzer" },
  { to: "/ai-mock-interview", icon: FaRobot, label: "AI Mock Interview" },
  { to: "/roadmap", icon: FaRoad, label: "Roadmap" },
  { to: "/human-interview", icon: FaUserTie, label: "Human Interview" },
  { to: "/profile", icon: FaUser, label: "Profile" },
];

/**
 * Single shared vertical nav bar used on every authenticated page
 * (Dashboard, Resume Analyzer, AI Mock Interview, Roadmap, Human Interview, Profile).
 * Renders identically everywhere, and collapses into a slide-in drawer on mobile.
 */
export default function Sidebar() {
  const navigate = useNavigate();

const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
};
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const closeOnMobile = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar: only visible below the responsive breakpoint */}
      <div className="sidebar-mobile-bar">
        <button
          className="sidebar-burger"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <FaBars />
        </button>
        <span className="sidebar-mobile-logo">🤖 PlacementAI</span>
      </div>

      {/* Backdrop, only rendered/shown while the mobile drawer is open */}
      {open && <div className="sidebar-backdrop" onClick={closeOnMobile} />}

      <aside className={"sidebar" + (open ? " sidebar-open" : "")}>
        <div className="sidebar-top">
          <h2 className="logo">🤖 PlacementAI</h2>
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

        <button onClick={logout} className="menu-item logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </aside>
    </>
  );
}
