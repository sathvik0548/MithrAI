import { useState } from "react";
import {
  FaTachometerAlt, FaFileAlt, FaRobot,
  FaRoad, FaUserTie, FaUser, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard",        icon: FaTachometerAlt, label: "Dashboard"        },
  { to: "/resume-analyzer",  icon: FaFileAlt,       label: "Resume Analyzer"  },
  { to: "/ai-mock-interview",icon: FaRobot,          label: "AI Mock Interview"},
  { to: "/roadmap",          icon: FaRoad,           label: "Roadmap"          },
  { to: "/human-interview",  icon: FaUserTie,        label: "Human Interview"  },
  { to: "/profile",          icon: FaUser,           label: "Profile"          },
];

export default function Sidebar() {
  const navigate    = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await signOut(); } catch {}
    localStorage.clear();
    navigate("/login");
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sidebar-mobile-bar">
        <button className="sidebar-burger" onClick={() => setOpen(true)} aria-label="Open navigation menu">
          <FaBars />
        </button>
        <Link to="/dashboard" className="sidebar-mobile-logo">MithrAI</Link>
      </div>

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={"sidebar" + (open ? " sidebar-open" : "")}>
        <div className="sidebar-top">
          {/* M logo mark + wordmark — matches landing nav exactly */}
          <Link to="/dashboard" className="sidebar-logo" onClick={close}>
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" style={{ borderRadius: 9, flexShrink: 0 }}>
              <rect width="36" height="36" rx="10" fill="#B4563E"/>
              <path d="M 8 22 C 15 22 19 16 19 8" stroke="#FDF6EC" strokeWidth="3.2" strokeLinecap="round"/>
              <path d="M 28 14 C 21 14 17 20 17 28" stroke="#FDF6EC" strokeWidth="3.2" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3" fill="#E2A377"/>
            </svg>
            <span className="sidebar-logo-text">MithrAI</span>
          </Link>
          <button className="sidebar-close" onClick={close} aria-label="Close navigation menu">
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} onClick={close}
              className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
            >
              <Icon style={{ flexShrink: 0, fontSize: 15 }} /> {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="menu-item logout-btn">
          <FaSignOutAlt style={{ flexShrink: 0, fontSize: 15 }} /> Logout
        </button>
      </aside>
    </>
  );
}
