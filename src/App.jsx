// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import Login from "./pages/Login";
import ProtectedLayout from "./layout/ProtectedLayout";
import { pageRoutes } from "./routes/pageRoutes";
import NotFound from "./pages/NotFound";
import ResetPasswordRequest from "./pages/ResetPassword";

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    bgcolor="background.default"
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPasswordRequest />} />
        {pageRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectedLayout title={route.title}>
                <Suspense fallback={<LoadingFallback />}>
                  <route.element />
                </Suspense>
              </ProtectedLayout>
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
