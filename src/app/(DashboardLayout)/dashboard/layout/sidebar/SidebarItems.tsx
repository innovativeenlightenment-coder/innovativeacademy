"use client";

import React from "react";

import {
  Box,
  Button,
  Divider,
  List,
  Tooltip,
} from "@mui/material";

import {
  LogoutRounded,
} from "@mui/icons-material";

import {
  CollegeMenuitems,
  TeacherMenuitems,
  AdminMenuitems,
  StudentMenuitems,
} from "./MenuItems";

import { usePathname } from "next/navigation";

import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";

import { UserData } from "@/types/UserType";

type MenuItemType = {
  id?: string;
  title?: string;
  href?: string;
  icon?: any;
  navlabel?: boolean;
  subheader?: string;
  disabled?: boolean;
  external?: boolean;
};

interface SidebarItemsProps {
  toggleMobileSidebar?: () => void;
  userData: UserData | null;
  collapsed?: boolean;
}

const SidebarItems = ({
  toggleMobileSidebar,
  userData,
  collapsed = false,
}: SidebarItemsProps) => {
  const pathname = usePathname();

  const menuItems: MenuItemType[] =
    (userData?.role === "admin" && AdminMenuitems) ||
    (userData?.role === "college" && CollegeMenuitems) ||
    (userData?.role === "student" && StudentMenuitems) ||
    (userData?.role === "teacher" && TeacherMenuitems) ||
    [];

  const handleLogout = async () => {
    try {
      sessionStorage.clear();

      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!userData) return null;

  return (
    <Box
      sx={{
        px: collapsed ? 1 : 1.5,
        pt: 0.5,
        pb: 1.5,
      }}
    >
      <List
        disablePadding
        component="div"
        className="sidebarNav"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.45,
        }}
      >
        {menuItems.map((item, index) =>
          item.subheader ? (
            <NavGroup
              key={item.id || index}
              item={item}
              collapsed={collapsed}
            />
          ) : (
            <NavItem
              key={item.id || index}
              item={item}
              pathDirect={pathname || ""}
              onClick={toggleMobileSidebar}
              collapsed={collapsed}
            />
          )
        )}
      </List>

      <Divider
        sx={{
          my: 1.5,
          borderColor: "divider",
        }}
      />

      <Tooltip
        title={collapsed ? "Logout" : ""}
        placement="right"
        arrow
        disableHoverListener={!collapsed}
      >
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogoutRounded />}
          variant="outlined"
          color="error"
          sx={{
            minHeight: 44,
            borderRadius: "11px",
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 1.5,
            minWidth: 0,
            fontWeight: 700,
            textTransform: "none",

            "& .MuiButton-startIcon": {
              mx: collapsed ? 0 : 1,
            },

            "&:hover": {
              bgcolor: "rgba(211,47,47,0.07)",
            },
            
          }}
        >
          {!collapsed && "Sign out"}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default SidebarItems;