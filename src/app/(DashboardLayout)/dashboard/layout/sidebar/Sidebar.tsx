"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

import SidebarItems from "./SidebarItems";
import { UserData } from "@/types/UserType";
import { getCurrentUser } from "@/lib/getCurrentUser";

type UserDataWithAvatar = UserData & {
  avatar?: string;
};

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  isSidebarOpen: boolean;
  onWidthChange?: (width: number) => void;
}

const EXPANDED_WIDTH = 270;
const COLLAPSED_WIDTH = 76;

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  onWidthChange,
}: ItemType) => {
  const theme = useTheme();

  const lgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const isDark = theme.palette.mode === "dark";

  const [isCollapsed, setIsCollapsed] = useState(!isSidebarOpen);
  const [user, setUser] = useState<UserDataWithAvatar | null>(null);
  const [loading, setLoading] = useState(true);

  const sidebarWidth = isCollapsed
    ? COLLAPSED_WIDTH
    : EXPANDED_WIDTH;

  useEffect(() => {
    if (lgUp) {
      onWidthChange?.(sidebarWidth);
    }
  }, [lgUp, sidebarWidth, onWidthChange]);

  // Fetch current user
  useEffect(() => {
    let active = true;

    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();

        if (active && userData?.success && userData.user) {
          setUser(userData.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      active = false;
    };
  }, []);

  const renderSidebarContent = (mobile = false) => {
    const compact = !mobile && isCollapsed;

    return (
      <Box
        sx={{
          width: mobile ? "100%" : sidebarWidth,
          height: "100%",
          minHeight: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          boxSizing: "border-box",
          bgcolor: "background.paper",
          color: "text.primary",
          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <Box
          sx={{
            minHeight: 76,
            px: mobile || !compact ? 2 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {mobile || !compact ? (
              <Image
                src={
                  isDark
                    ? "/images/logos/innovative-academy-dark.png"
                    : "/images/logos/innovative-academy.png"
                }
                alt="Innovative Academy"
                width={200}
                height={80}
                priority
                style={{
                  width: "100%",
                  maxWidth: 205,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Image
                src={
                  isDark
                    ? "/images/logos/Innovative_Academy_Logo_icon_dark.png"
                    : "/images/logos/Innovative_Academy_Logo_icon.png"
                }
                alt="Innovative Academy"
                width={43}
                height={43}
                priority
                style={{
                  objectFit: "contain",
                }}
              />
            )}
          </Box>

          {/* Mobile Close */}
          {mobile && (
            <IconButton
              onClick={onSidebarClose}
              size="small"
              sx={{
                position: "absolute",
                right: 12,
                color: "text.secondary",
                bgcolor: "action.hover",
                "&:hover": {
                  bgcolor: "action.selected",
                },
                
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        {/* ===================================== */}
        {/* USER PROFILE */}
        {/* ===================================== */}

        {/* ===================================== */}
{/* USER PROFILE */}
{/* ===================================== */}

{!compact && (
  <Box
    sx={{
      mx: 1.5,
      mt: 2,
      mb: 1.5,
      p: 1.8,

      display: "flex",
      alignItems: "center",
      gap: 1.7,

      minHeight: 94,
      borderRadius: "16px",

      // background: isDark
      //   ? "linear-gradient(135deg, rgba(124,77,255,0.16), rgba(124,77,255,0.05))"
      //   : "linear-gradient(135deg, #f5f0ff, #faf8ff)",

      border: "1px solid",
      borderColor: isDark
        ? "rgba(167,139,250,0.2)"
        : "#ebe3ff",

      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    {/* USER AVATAR */}
    <Box
      sx={{
        position: "relative",
        width: 80,
        height: 80,
        flexShrink: 0,
        borderRadius: "50%",
        p: "2.5px",
        background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
        boxShadow: "0 4px 12px rgba(109,40,217,0.2)",
      }}
    >
      <Avatar
        src={user?.avatar || undefined}
        alt={user?.username || "User profile"}
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: isDark ? "#31205c" : "#ede5ff",
          color: "primary.main",
          fontSize: 21,
          fontWeight: 800,
          border: "2px solid",
          borderColor: "background.paper",
        }}
      >
        {user?.username
          ?.trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word.charAt(0).toUpperCase())
          .join("") || "Ne"}
      </Avatar>

      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            borderRadius: "50%",
          }}
        >
          <CircularProgress size={22} />
        </Box>
      )}
    </Box>

    {/* USER INFORMATION */}
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: "text.secondary",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          mb: 0.4,
        }}
      >
        Welcome back
      </Typography>

      <Typography
        title={user?.username || "Guest"}
        sx={{
          fontSize: 15,
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "Loading..." : user?.username || "Guest"}
      </Typography>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          mt: 0.7,
          px: 1,
          py: 0.35,
          borderRadius: "6px",
          bgcolor: isDark
            ? "rgba(167,139,250,0.15)"
            : "#e9ddff",
        }}
      >
        <Typography
          sx={{
            fontSize: 9,
            fontWeight: 800,
            color: "primary.main",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            lineHeight: 1.4,
          }}
        >
          {user?.role || "Member"}
        </Typography>
      </Box>
    </Box>
  </Box>
)}

        {/* ===================================== */}
        {/* NAVIGATION */}
        {/* ===================================== */}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",

            px: compact ? 1 : 1.5,
            pb: 2,

            scrollbarWidth: "thin",
            scrollbarColor: `${theme.palette.divider} transparent`,

            "&::-webkit-scrollbar": {
              width: 5,
            },

            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },

            "&::-webkit-scrollbar-thumb": {
              background: theme.palette.divider,
              borderRadius: 10,
            },

            "&::-webkit-scrollbar-thumb:hover": {
              background: theme.palette.text.disabled,
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            <SidebarItems
              userData={user}
              collapsed={compact}
              toggleMobileSidebar={
                mobile ? onSidebarClose : undefined
              }
            />
          )}
        </Box>

        {/* ===================================== */}
        {/* DESKTOP COLLAPSE BUTTON */}
        {/* ===================================== */}

        {!mobile && (
          <Tooltip
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
            placement="right"
            arrow
          >
            <IconButton
              onClick={() =>
                setIsCollapsed((previous) => !previous)
              }
              size="small"
              sx={{
                position: "absolute",
                right: -14,
                top: "50%",
                transform: "translateY(-50%)",

                zIndex: 1300,

                width: 28,
                height: 42,

                borderRadius: "0 10px 10px 0",
                border: "1px solid",
                borderLeft: "none",
                borderColor: "divider",

                bgcolor: "background.paper",
                color: "text.secondary",

                boxShadow: "3px 2px 10px rgba(0,0,0,0.09)",

                "&:hover": {
                  bgcolor: "primary.main",
                  color: "#ffffff",
                },

                transition: "all 0.2s ease",
              }}
            >
              {compact ? (
                <ChevronRight sx={{ fontSize: 20 }} />
              ) : (
                <ChevronLeft sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  // =====================================
  // DESKTOP SIDEBAR
  // =====================================

  if (lgUp) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",

          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.shorter,
          }),

          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            height: "100vh",
            boxSizing: "border-box",
            overflow: "visible",
            position: "fixed",

            borderRight: "1px solid",
            borderColor: "divider",

            bgcolor: "background.paper",

            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
          },
        }}
      >
        {renderSidebarContent()}
      </Drawer>
    );
  }

  // =====================================
  // MOBILE SIDEBAR
  // =====================================

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: "min(300px, 86vw)",
          maxWidth: "100%",
          height: "100dvh",
          overflow: "hidden",
         
          boxSizing: "border-box",
          bgcolor: "background.paper",
        },
      }}
    >
      {renderSidebarContent(true)}
    </Drawer>
  );
};

export default Sidebar;