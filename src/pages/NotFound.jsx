// src/pages/NotFound.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" fontWeight="bold" color="error" fontSize="6rem">
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Oops! The page you’re looking for drifted into space 🌌
      </Typography>
      <Typography variant="body1" mb={4}>
        It might be lost in another galaxy... or just a broken link.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/dashboard")}
      >
        🛸 Beam me back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
