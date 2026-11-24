"use client";

import React from "react";

import {
  Box,
  Divider,
  ListSubheader,
  Tooltip,
} from "@mui/material";

type NavGroupType = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroupType;
  collapsed?: boolean;
}

const NavGroup = ({
  item,
  collapsed = false,
}: ItemType) => {
  if (collapsed) {
    return (
      <Tooltip
        title={item.subheader || ""}
        placement="right"
        arrow
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            py: 1.4,
            px: 0.5,
          }}
        >
          <Divider sx={{ width: "100%" }} />
        </Box>
      </Tooltip>
    );
  }

  return (
    <ListSubheader
      disableSticky
      sx={{
        position: "relative",
        bgcolor: "transparent",
        color: "text.disabled",

        fontSize: "0.67rem",
        fontWeight: 800,
        letterSpacing: "1.15px",
        lineHeight: "28px",
        textTransform: "uppercase",

        px: 1.3,
        mt: 2,
        mb: 0.5,
      }}
    >
      {item.subheader}
    </ListSubheader>
  );
};

export default NavGroup;