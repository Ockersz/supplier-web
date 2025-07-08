// src/pages/Dashboard.js
import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const Dashboard = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="calc(100vh - 128px)" // adjust based on AppBar + Toolbar height
    >
      <Paper
        elevation={6}
        sx={{ p: 4, width: "100%", maxWidth: 600, textAlign: "center" }}
      >
        <Typography variant="h5" gutterBottom>
          Welcome to your dashboard!
        </Typography>
        <Typography variant="body1">
          You are now logged in and viewing a protected route.
        </Typography>
      </Paper>
    </Box>
  );
};
export default Dashboard;
