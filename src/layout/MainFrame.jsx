import React, { useEffect, useState } from "react";
import {
  Box,
  Toolbar,
  IconButton,
  AppBar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Divider,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle,
} from "@mui/icons-material";
import { useColorMode } from "../useColorMode";
import { useNavigate } from "react-router-dom";
import Joyride, { EVENTS, STATUS } from "react-joyride";

const drawerWidth = 240;
const collapsedWidth = 60;

const MainFrame = ({ children, title = "" }) => {
  const { mode, toggleColorMode } = useColorMode();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // ✅ Dialog state
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  const toggleDrawer = () => setOpen((prev) => !prev);

  const handleLogout = () => {
    document.cookie = "access_token=; Max-Age=0; path=/;";
    document.cookie = "refresh_token=; Max-Age=0; path=/;";
    navigate("/login");
  };

  const handleSettings = () => navigate("/settings");

  const tourSteps = [
    {
      target: ".account-button",
      content: "Click here to access your account settings.",
      placement: "bottom",
      disableBeacon: true, // 👈 Important
    },
    {
      target: ".menu-settings",
      content: "Click Settings to update your password.",
      placement: "right",
      disableBeacon: true, // 👈 Important
    },
  ];

  // ✅ Show tour dialog on first login
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenIntroTour");

    if (!hasSeenTour) {
      setShowTourPrompt(true); // open dialog
    }
  }, []);

  const startTour = () => {
    setShowTourPrompt(false);
    setStepIndex(0); // 👈 Reset to first step
    setRunTour(true); // 👈 This launches the tour immediately
  };

  const skipTour = () => {
    setShowTourPrompt(false);
    localStorage.setItem("hasSeenIntroTour", "true");
  };

  const handleJoyrideCallback = ({ type, status, index }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER && index === 0) {
      const profileBtn = document.querySelector(".account-button");
      profileBtn?.click();

      const waitForMenu = setInterval(() => {
        if (document.querySelector(".menu-settings")) {
          clearInterval(waitForMenu);
          setStepIndex(1);
        }
      }, 200);
    }

    if (type === EVENTS.STEP_AFTER && index === 1) {
      // ✅ End after last step
      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
      setStepIndex(0);
    }

    // Optionally handle if menu failed to open
    if (type === EVENTS.TARGET_NOT_FOUND) {
      setRunTour(false);
      localStorage.setItem("hasSeenIntroTour", "true");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: "0 0 0 0",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="account-button"
            >
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              disablePortal // Important for Joyride
            >
              <MenuItem onClick={handleSettings} className="menu-settings">
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            overflowX: "hidden",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {["Home", "Reports", "Settings"].map((text) => (
            <Tooltip
              key={text}
              title={!open ? text : ""}
              placement="right"
              arrow
            >
              <ListItem
                button
                sx={{ justifyContent: open ? "initial" : "center" }}
              >
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          ml: open ? `${drawerWidth}px` : `${collapsedWidth}px`,
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Joyride */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 9999,
            primaryColor: "#1976d2",
          },
        }}
      />

      {/* ✅ Tour Prompt Dialog */}
      <Dialog open={showTourPrompt}>
        <DialogTitle>Welcome!</DialogTitle>
        <DialogContent>
          Would you like a quick tour to learn how to change your password?
        </DialogContent>
        <DialogActions>
          <Button onClick={skipTour}>No Thanks</Button>
          <Button onClick={startTour} variant="contained">
            Start Tour
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainFrame;
