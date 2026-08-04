import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import ResumeAnalyzer from "../pages/ResumeAnalyzer";
import AIMockInterview from "../pages/AIMockInterview";
import HumanInterview from "../pages/HumanInterview";
import Roadmap from "../pages/Roadmap";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="/ai-mock-interview" element={<AIMockInterview />} />
        <Route path="/human-interview" element={<HumanInterview />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
