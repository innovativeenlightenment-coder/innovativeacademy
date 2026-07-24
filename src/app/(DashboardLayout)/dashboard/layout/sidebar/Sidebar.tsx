// // import dynamic from "next/dynamic";

// // const SidebarClient = dynamic(
// //   () => import("react-mui-sidebar").then((mod) => mod.Sidebar),
// //   { ssr: false } // disables server-side rendering
// // );


// import { useMediaQuery, Box, Drawer } from "@mui/material";
// import SidebarItems from "./SidebarItems";
// import { Upgrade } from "./Updrade";
// import { Sidebar, Logo } from 'react-mui-sidebar';
// import Image from "next/image";
// import { useState } from "react";

// interface ItemType {
//   isMobileSidebarOpen: boolean;
//   onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
//   isSidebarOpen: boolean;
  
// }

// const MSidebar = ({
//   isMobileSidebarOpen,
//   onSidebarClose,
//   isSidebarOpen,
// }: ItemType) => {
//   const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

// // const [isSidebarLoaded, setIsSidebarLoaded] = useState(true);


//   const sidebarWidth = "270px";

//   // Custom CSS for short scrollbar
//   const scrollbarStyles = {
//     '&::-webkit-scrollbar': {
//       width: '7px',

//     },
//     '&::-webkit-scrollbar-thumb': {
//       backgroundColor: '#eff2f7',
//       borderRadius: '15px',
//     },
//   };


//   if (lgUp) {
//     return (
//       <Box
//         sx={{
//           width: sidebarWidth,
//           flexShrink: 0,
//         }}
//       >
//         {/* ------------------------------------------- */}
//         {/* Sidebar for desktop */}
//         {/* ------------------------------------------- */}
//         <Drawer
//           anchor="left"
//           open={isSidebarOpen}
//           variant="permanent"
//           PaperProps={{
//             sx: {
//               boxSizing: "border-box",
//               ...scrollbarStyles,
//             },
//           }}
//         >
//           {/* ------------------------------------------- */}
//           {/* Sidebar Box */}
//           {/* ------------------------------------------- */}
//           <Box
//             sx={{
//               height: "100%",
//             }}
//           >
//              <Sidebar
//               width={'270px'}
//               collapsewidth="80px"
//               open={isSidebarOpen}
//               themeColor="#5d87ff"
//               themeSecondaryColor="#49beff"
//               showProfile={false}
//             >
//                           <Box sx={{  width:"100%",display:"flex",justifyContent:"center",alignItems:"center", padding:"10px 0px 15px 0px"}}><Image src="/images/logos/innovative-academy.png" alt="Logo" width={200} height={100} style={{maxWidth:"260px",marginTop:"10px",height:"auto"}}  /></Box> 
//               <Box>
                
//                 <SidebarItems toggleMobileSidebar={()=>onSidebarClose}  />
               
//               </Box>
//             </Sidebar >
//           </Box>
//         </Drawer>
//       </Box>
//     );
//   }

//   return (
//     <Drawer
//       anchor="left"
//       open={isMobileSidebarOpen}
//       onClose={onSidebarClose}
//       variant="temporary"
//       PaperProps={{
//         sx: {
//           boxShadow: (theme) => theme.shadows[8],
//           ...scrollbarStyles,
//         },
//       }}
//     >
//       {/* ------------------------------------------- */}
//       {/* Sidebar Box */}
//       {/* ------------------------------------------- */}
//       <Box px={2}>
//         <Sidebar
//           width={'270px'}
//           collapsewidth="80px"
//           isCollapse={false}
//           mode="light"
//           direction="ltr"
//           themeColor="#5d87ff"
//           themeSecondaryColor="#49beff"
//           showProfile={false}
//         >
//          <Box sx={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",}}><Image src="/images/logos/innovative-academy.png" alt="Logo" width={200} height={100} style={{maxWidth:"260px",marginTop:"10px",paddingBottom:"10px",height:"auto"}}  /></Box> 
           
//           <SidebarItems toggleMobileSidebar={()=>onSidebarClose}  />

//         </Sidebar>
//       </Box>
//       {/* ------------------------------------------- */}
//       {/* Sidebar For Mobile */}
//       {/* ------------------------------------------- */}

//     </Drawer>
//   );
// };

// export default MSidebar;

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
    <Box sx={{ width: sidebarWidth, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
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
          mx: 2,
          mb: 2,
          p: 2.5,
          borderRadius: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? '0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(16,24,40,0.12)',
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          border: (theme) =>
            theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(16,24,40,0.08)",
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
