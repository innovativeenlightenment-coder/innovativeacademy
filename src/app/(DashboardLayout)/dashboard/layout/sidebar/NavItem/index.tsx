"use client";

import React from "react";
import Link from "next/link";

import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";

interface NavItemProps {
  item: any;
  pathDirect: string;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItem = ({
  item,
  pathDirect,
  collapsed,
  onClick,
}: NavItemProps) => {
  const Icon = item.icon;

  const href = item.href;

  const isActive =
    typeof href === "string" &&
    href.length > 1 &&
    (pathDirect === href || pathDirect.startsWith(`${href}/`));

  const disabled = Boolean(item.disabled) || !href;

  const handleClick = () => {
    if (!disabled) {
      onClick?.();
    }
  };

  const button = (
    <ListItemButton
      component={disabled ? "div" : Link}
      href={disabled ? undefined : href}
      onClick={handleClick}
      disabled={disabled}
      sx={{
        width: "100%",
        minWidth: 0,
        height: 46,
        minHeight: 46,
        px: collapsed ? 0 : 1.7,

        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        flexDirection: "row",
        gap: collapsed ? 0 : 1.5,

        overflow: "hidden",
        whiteSpace: "nowrap",
        borderRadius: "11px",

        color: isActive ? "primary.main" : "text.secondary",
        bgcolor: isActive ? "action.selected" : "transparent",

        textDecoration: "none",

        transition: "all 0.2s ease",

        "&:hover": {
          bgcolor: isActive ? "action.selected" : "action.hover",
          color: "primary.main",
        },

        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: isActive ? 23 : 0,
          width: 3,
          borderRadius: "0 5px 5px 0",
          bgcolor: "primary.main",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          width: collapsed ? "100%" : 23,
          height: 23,
          flex: collapsed ? "0 0 100%" : "0 0 23px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "inherit",
          m: 0,
        }}
      >
        {Icon && <Icon size="1.3rem" stroke={1.7} />}
      </ListItemIcon>

      {!collapsed && (
        <ListItemText
          primary={
            <Typography
              noWrap
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 550,
                color: "inherit",
              }}
            >
              {item.title}
            </Typography>
          }
          sx={{
            minWidth: 0,
            m: 0,
          }}
        />
      )}

      {!collapsed && isActive && (
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "primary.main",
            flexShrink: 0,
            ml: "auto",
          }}
        />
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip
        title={item.title || ""}
        placement="right"
        arrow
        enterDelay={250}
      >
        <Box sx={{ width: "100%", minWidth: 0 }}>
          {button}
        </Box>
      </Tooltip>
    );
  }

  return button;
};

export default NavItem;