import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Brightness4,
  Brightness7,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useColorMode } from "../useColorMode";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const languages = [
  { code: "en", label: "English" },
  { code: "si", label: "සිංහල" },
];

const Login = () => {
  const { t, i18n } = useTranslation("login");
  const { mode, toggleColorMode } = useColorMode();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setAnchorEl(null);
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const schema = yup.object().shape({
    username: yup.string().required(t("usernameRequired")),
    password: yup
      .string()
      .min(4, t("passwordInvalidLength"))
      .required(t("passwordRequired")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      const response = await axiosInstance.post("/auth/login", {
        username: data.username,
        password: data.password,
      });

      if (response?.data?.user?.firstLogin === "Y") {
        localStorage.removeItem("hasSeenIntroTour");
      } else {
        localStorage.setItem("hasSeenIntroTour", "true");
      }

      navigate("/dashboard");
    } catch (error) {
      toast.error(t("loginError"));
      console.error("Login error:", error);
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
      bgcolor="background.default"
    >
      <Paper elevation={6} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">{t("title")}</Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={toggleColorMode} color="inherit" size="small">
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <Typography
              onClick={handleLanguageClick}
              sx={{ cursor: "pointer", userSelect: "none" }}
              fontWeight={500}
              fontSize="0.9rem"
            >
              {i18n.language.toUpperCase()}
            </Typography>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {languages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  selected={i18n.language === lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            margin="normal"
            label={t("username")}
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label={t("password")}
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box textAlign="right" mt={1} mb={2}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/reset-password")}
            >
              {t("forgotPassword")}
            </Typography>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("login")
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
