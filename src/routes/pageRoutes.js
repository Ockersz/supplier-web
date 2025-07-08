import React, { lazy } from "react";

const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
export const pageRoutes = [
  {
    path: "/dashboard",
    element: Dashboard,
    title: "Dashboard",
  },
  {
    path: "/settings",
    element: Settings,
    title: "Settings",
  },
];
