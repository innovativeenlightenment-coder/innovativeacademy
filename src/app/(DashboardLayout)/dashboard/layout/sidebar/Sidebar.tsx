
import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SidebarItems from "./SidebarItems"; // Make sure you have this component (you can reuse it or create it based on your app)
import Image from "next/image";
import { useEffect, useState } from "react";
import { UserData } from "@/types/UserType";
import { getCurrentUser } from "@/lib/getCurrentUser";

type UserDataWithAvatar = UserData & { avatar?: string };

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  isSidebarOpen: boolean;
}

const Sidebar =  ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen }: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const [isCollapsed, setIsCollapsed] = useState(false);
 const theme = useTheme();
 const isDark = theme.palette.mode === "dark";
  const sidebarWidth = 270; // Width of the sidebar

  const [users, setUsers] = useState<UserDataWithAvatar[]>([]);

   useEffect(() => {
    const fetchUserData = async () => {
      try {
          const user_data=await getCurrentUser();
        if (user_data&&user_data?.success && user_data.user) {
      setUsers([user_data.user]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const renderSidebarContent = () => (
    <Box
  sx={{
    width: sidebarWidth,
    maxWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
    backgroundColor: "background.paper",
    color: "text.primary",
    borderRight: "1px solid",
    borderColor: "divider",
  }}
>
      {/* Logo */}
      <Box
  sx={{
    px: 2,
    py: 2.5,
    minHeight: 84,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid",
    borderColor: "divider",
  }}
>
        <Image
          src={isDark
      ? "/images/logos/innovative-academy-dark.png"
      : "/images/logos/innovative-academy.png"}
          alt="Logo"
          width={200}
          height={100}
          style={{ maxWidth: "260px", height: "auto" }}
        />
      </Box>

      {/* User Info Box: shadow background with user photo */}
      <Box
       sx={{
  mx: 1.5,
  mt: 2,
  mb: 1.5,
  p: 1.75,
  borderRadius: "12px",
  backgroundColor: "action.hover",
  border: "1px solid",
  borderColor: "divider",
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  minWidth: 0,
}}
      >
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", overflow: 'hidden', flexShrink: 0, border: '3px solid rgba(99,102,241,0.3)' }}>
          {users[0]?.avatar ? (
            <Image
              src={users[0]?.avatar}
              alt={users[0]?.username || 'User'}
              width={72}
              height={72}
              style={{ width: '72px', height: '72px', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ width: '72px', height: '72px', backgroundColor: '#cfe0ff' }} />
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ fontSize: "0.9rem", color: "text.secondary", fontWeight: 500, letterSpacing: '0.3px' }}>Welcome,</Box>
          <Box sx={{ fontSize: "1.15rem", fontWeight: 800, color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : "#1f2937", letterSpacing: '-0.5px' }}>{users[0]?.username || 'Guest'}</Box>
        </Box>
      </Box>
          
     
      {/* Sidebar List */}
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {/* You can replace SidebarItems with your actual list of links/icons */}
      <SidebarItems toggleMobileSidebar={onSidebarClose} />

      </List>
    </Box>
  );

  if (lgUp) {
    // Permanent Drawer on larger screens (desktop)
    return (
      <Drawer variant="permanent" open={isSidebarOpen} sx={{ width: sidebarWidth, flexShrink: 0 }}>
        {renderSidebarContent()}
      </Drawer>
    );
  }

  // Temporary Drawer on smaller screens (mobile)
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      sx={{ width: sidebarWidth }}
    >
      {renderSidebarContent()}
    </Drawer>
  );
};

export default Sidebar;
