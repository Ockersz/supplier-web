import React from "react";
import ProtectedRoute from "../util/ProtectedRoute";
import MainFrame from "./MainFrame";

const ProtectedLayout = ({ children, title }) => {
  return (
    <ProtectedRoute>
      <MainFrame title={title}>{children}</MainFrame>
    </ProtectedRoute>
  );
};

export default ProtectedLayout;
