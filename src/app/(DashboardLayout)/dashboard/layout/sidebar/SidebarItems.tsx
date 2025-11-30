import React, { useEffect, useState } from "react";
import {
  CollegeMenuitems,
  TeacherMenuitems,
  AdminMenuitems,
  StudentMenuitems,
} from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { UserData } from "@/types/UserType";
// import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

type MenuItemType = {
  id?: string;
  title?: string;
  href?: string;
  icon?: any;
  navlabel?: boolean;
  subheader?: string;
};

interface SidebarItemsProps {
  toggleMobileSidebar: () => void;
}

const SidebarItems = ({ toggleMobileSidebar }: SidebarItemsProps) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const [userData, setUserData] = useState<UserData | null>(null);

// const router=useRouter()

  
    useEffect(() => {
      async function fetchUser() {
        try {
          const res = await fetch("/api/auth/Get-Current-User", { method: "GET" });
          const data = await res.json();
  
          if (data?.success && data.user) {
     
            setUserData(data.user);
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          
        } 
      }
  
      fetchUser();
    }, []);

    
  const menuItems: MenuItemType[] =
    (userData?.role === "admin" && AdminMenuitems) ||
    (userData?.role === "college" && CollegeMenuitems) ||
    (userData?.role === "student" && StudentMenuitems) ||
    (userData?.role === "teacher" && TeacherMenuitems) ||
    [];
  if (!userData) return null; // ✅ avoid render before data is loaded

  return (
    <Box sx={{ px: 3, borderTop: "1px solid #dcdcdc" }}>
      <List sx={{ pt: 3 }} className="sidebarNav" component="div">
        {menuItems.map((item, i) =>
          item.subheader ? (
            <NavGroup item={item} key={i} />
          ) : (
            <NavItem
              item={item}
              key={i}
              pathDirect={pathDirect}
              onClick={toggleMobileSidebar}
            />
          )
        )}
      </List>
    </Box>
  );
};

export default SidebarItems;
