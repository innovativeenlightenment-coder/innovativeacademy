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
//                           <Box sx={{  width:"100%",display:"flex",justifyContent:"center",alignItems:"center", padding:"10px 0px 15px 0px"}}><Image src="/images/logos/logo-innovative.png" alt="Logo" width={200} height={100} style={{maxWidth:"260px",marginTop:"10px",height:"auto"}}  /></Box> 
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
//          <Box sx={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center",}}><Image src="/images/logos/logo-innovative.png" alt="Logo" width={200} height={100} style={{maxWidth:"260px",marginTop:"10px",paddingBottom:"10px",height:"auto"}}  /></Box> 
           
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

import { Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, useMediaQuery } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SidebarItems from "./SidebarItems"; // Make sure you have this component (you can reuse it or create it based on your app)
import Image from "next/image";
import { useState } from "react";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: () => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen }: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = 270; // Width of the sidebar

  const renderSidebarContent = () => (
    <Box sx={{ width: sidebarWidth, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
        <Image
          src="/images/logos/logo-innovative.png"
          alt="Logo"
          width={200}
          height={100}
          style={{ maxWidth: "260px", height: "auto" }}
        />
      </Box>

      {/* Toggle Collapse Button */}
      <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? <ExpandMore /> : <ExpandLess />}
      </IconButton>

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
