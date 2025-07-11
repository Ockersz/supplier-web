import React, { lazy } from "react";

const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const LatexOrders = lazy(() => import("../pages/LatexOrders.jsx"));

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
  {
    path: "/latex-orders",
    element: LatexOrders,
    title: "Latex Orders",
  },
];
