import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Layout for public-facing pages (landing page, standalone auth screens,
 * etc.) that don't have the authenticated app's sidebar.
 *
 * Usage with React Router's nested routes:
 *   <Route element={<MainLayout />}>
 *     <Route path="/" element={<Home />} />
 *   </Route>
 *
 * Can also be used directly as a wrapper: <MainLayout><Home /></MainLayout>
 */
export default function MainLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {children ?? <Outlet />}
    </div>
  );
}
