import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-purple-600">
          PlacementAI
        </h1>

        <div className="flex gap-6 text-sm font-medium">

          <NavLink to="/">Home</NavLink>

          <NavLink to="/register">Register</NavLink>

          <NavLink to="/dashboard">Dashboard</NavLink>

          <NavLink to="/resume-analyzer">
            Resume Analyzer
          </NavLink>

          <NavLink to="/ai-mock-interview">
            AI Mock Interview
          </NavLink>

          <NavLink to="/human-interview">
            Human Interview
          </NavLink>

          <NavLink to="/roadmap">
            Roadmap
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>

          <button
            onClick={logout}
            className="text-red-500 font-semibold"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}