import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

// Validation schema
const schema = Yup.object().shape({
  identifier: Yup.string()
    .required("Please enter your username or email")
    .test(
      "is-email-or-username",
      "Invalid email or username format",
      (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_.-]{3,}$/;
        return emailRegex.test(value) || usernameRegex.test(value);
      }
    ),
});

const ResetPasswordRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setEmail(null);
    try {
      const response = await axiosInstance.post("/auth/password-reset", {
        identifier: data.identifier,
      });

      if (
        (response.status === 200 || response.status === 201) &&
        response.data.email
      ) {
        setEmail(response.data.email);
        toast.success(
          "An email has been sent with instructions to reset your password."
        );
        reset();
      }
    } catch (error) {
      console.error("Reset request failed:", error);
      toast.error(error?.response?.data?.message || "Reset request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={4}
        sx={{ p: 4, width: "100%", maxWidth: 450, position: "relative" }}
      >
        <IconButton
          onClick={() => navigate("/login")}
          sx={{ position: "absolute", top: 8, left: 8 }}
        >
          <ArrowBack />
        </IconButton>

        <Typography variant="h5" gutterBottom textAlign="center">
          Reset Password
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          gutterBottom
        >
          Enter your username or email to receive a reset link.
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Username or Email"
            margin="normal"
            {...register("identifier")}
            error={Boolean(errors.identifier)}
            helperText={errors.identifier?.message}
          />

          {email && (
            <Typography variant="body2" color="success.main" mt={2}>
              A reset link has been sent to {email}.
            </Typography>
          )}

          {!email ? (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} />}
              sx={{ mt: 2 }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate("/login")}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPasswordRequest;
