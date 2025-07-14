import React from "react";
import { Box, Paper, Typography, Toolbar } from "@mui/material";

const Dashboard = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={2}
      sx={{
        minHeight: window.innerHeight - 64 || "auto",
        bgcolor: "background.default",
        transition: "min-height 0.3s ease",
      }}
    >
      <Toolbar />

      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 4 },
            width: "100%",
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Welcome to your dashboard!
          </Typography>
          <Typography variant="body1">
            You are now logged in and viewing a protected route.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
