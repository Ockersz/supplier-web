import React, { useLayoutEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Toolbar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

// Validation schemas
const emailSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your password"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleToggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchUserEmail = async () => {
    try {
      const { data } = await axiosInstance.get("/custsup/0");
      if (data?.email) {
        emailForm.setValue("email", data.email);
        passwordForm.setValue("email", data.email);
      }
    } catch (err) {
      console.error("Failed to fetch user email:", err);
      toast.error("Failed to fetch user email.");
    }
  };

  useLayoutEffect(() => {
    fetchUserEmail();
  }, []);

  const handleEmailUpdate = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        oldPassword: null,
        newPassword: null,
        email: data.email,
      });
      toast.success("Email updated successfully!");
    } catch (err) {
      toast.error(`Failed to update email: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/change-password", {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        email: null,
      });
      toast.success("Password updated successfully!");
      passwordForm.reset({
        email: passwordForm.getValues("email"),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(`Failed to update password: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: window.innerHeight - 64 || "auto",
        bgcolor: "background.default",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <Toolbar />
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: { xs: 360, sm: 500, md: 600 },
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          centered
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Change Email" />
          <Tab label="Change Password" />
        </Tabs>

        {/* Email Tab */}
        {activeTab === 0 && (
          <Box
            component="form"
            onSubmit={emailForm.handleSubmit(handleEmailUpdate)}
            noValidate
          >
            <Typography variant="h6" gutterBottom>
              Change Email
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...emailForm.register("email")}
              error={Boolean(emailForm.formState.errors.email)}
              helperText={emailForm.formState.errors.email?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} />}
            >
              {loading ? "Updating..." : "Update Email"}
            </Button>
          </Box>
        )}

        {/* Password Tab */}
        {activeTab === 1 && (
          <Box
            component="form"
            onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
            noValidate
          >
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>

            {[
              { label: "Current Password", name: "currentPassword", toggleKey: "current" },
              { label: "New Password", name: "newPassword", toggleKey: "new" },
              { label: "Confirm Password", name: "confirmPassword", toggleKey: "confirm" },
            ].map(({ label, name, toggleKey }) => (
              <TextField
                key={name}
                fullWidth
                label={label}
                type={showPasswords[toggleKey] ? "text" : "password"}
                margin="normal"
                {...passwordForm.register(name)}
                error={Boolean(passwordForm.formState.errors[name])}
                helperText={passwordForm.formState.errors[name]?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleToggleVisibility(toggleKey)} edge="end">
                        {showPasswords[toggleKey] ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={18} />}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;
