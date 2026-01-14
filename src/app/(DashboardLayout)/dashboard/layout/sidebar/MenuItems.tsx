import { IconSchool } from "@tabler/icons-react";
import {
  IconAperture,
  IconCheck,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMailQuestion,
  IconMapQuestion,
  IconMoodHappy,
  IconReportAnalytics,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const AdminMenuitems = [
  
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },
  {
    navlabel: true,
    subheader: "Student",
  },
  {
    id: uniqueId(),
    title: "Test Records",
    icon : IconReportAnalytics,
    
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Start Practice Test",
 
    icon: IconCopy,
    href: "/dashboard/student/start-practice-test",
  },
  {
    navlabel: true,
    subheader: "Teacher",
  },
  {
    id: uniqueId(),
    title: "Manage Users",
    icon: IconUserPlus,
    href: "/dashboard/admin/manage-users",
  },
  // { 
  //   id:uniqueId(),
  //   title:"Manage Chapters",
  //   icon:IconAperture,
  //   herf:"/dashboard/admin/manage-subjectWithChapter"
  // },
  {
    id: uniqueId(),
    title: "Set Subject / Chapter",
    icon: IconSchool, 
    href: "/dashboard/admin/manage-subjectWithChapter",
  },
  //  {
  //   id: uniqueId(),
  //   title: "Manage Question Bank",
  //   icon: IconAperture,
  //   href: "/dashboard/admin/manage-questionBank",
  // },
  
  {
    id: uniqueId(),
    title: "Manage Question Paper",
    icon: IconCheck,
    href: "/dashboard/admin/manage-questionPaper",
  },
 {
    id: uniqueId(),
    title: "Manage Question Bank",
    icon: IconAperture,
    href: "/dashboard/admin/manage-questionBank",
  },
  
  {
    id: uniqueId(),
    title: "Generate Question Paper",
    icon: IconAperture,
    href: "/dashboard/admin/generate-question-paper",
  },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon:  IconMapQuestion, 
    href: "/dashboard/admin/set-question-bank",
  },
 
];


const StudentMenuitems = [
  
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },
    {
    navlabel: true,
    subheader: "Student",
  },
  // {
  //   id: uniqueId(),
  //   title: "All Test Records",
  //   icon : IconReportAnalytics,
    
  //   href: "/dashboard/student/all_results",
  // },
  {
    id: uniqueId(),
    title: "Test Records",
    icon : IconReportAnalytics,
    
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Start Practice Test",
 
    icon: IconCopy,
    href: "/dashboard/student/start-practice-test",
  },
  
 
];


const TeacherMenuitems = [
  
 
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },
    {
    navlabel: true,
    subheader: "Teacher",
  },
  //  {
  //   id: uniqueId(),
  //   title: "Manage Users",
  //   icon: IconUserPlus,
  //   href: "/dashboard/admin/manage-users",
  // },
  {
    id: uniqueId(),
    title: "Set Subject / Chapter",
    icon: IconSchool, 
    href: "/dashboard/admin/manage-subjectWithChapter",
  },
  // {
  //   id: uniqueId(),
  //   title: "Manage Question Paper",
  //   icon: IconCheck,
  //   href: "/dashboard/admin/manage-questionPaper",
  // },
 {
    id: uniqueId(),
    title: "Manage Question Bank",
    icon: IconAperture,
    href: "/dashboard/admin/manage-questionBank",
  },
  
  // {
  //   id: uniqueId(),
  //   title: "Generate Question Paper",
  //   icon: IconAperture,
  //   href: "/dashboard/admin/generate-question-paper",
  // },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon:  IconMapQuestion, 
    href: "/dashboard/admin/set-question-bank",
  },
 
];



const CollegeMenuitems = [
  
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },
  {
    navlabel: true,
    subheader: "Student",
  },
  // {
  //   id: uniqueId(),
  //   title: "All Test Records",
  //   icon : IconReportAnalytics,
    
  //   href: "/dashboard/student/all_results",
  // },
  {
    id: uniqueId(),
    title: "Test Records",
    icon : IconReportAnalytics,
    
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Start Practice Test",
 
    icon: IconCopy,
    href: "/dashboard/student/select-test",
  },
  {
    navlabel: true,
    subheader: "Teacher",
  },
  {
    id: uniqueId(),
    title: "Manage Question Bank",
    icon: IconAperture,
    href: "/dashboard/admin/manage-questionBank",
  },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon: IconUserPlus,
    href: "/dashboard/admin/set-question-bank",
  },
 
];

export {CollegeMenuitems,TeacherMenuitems,AdminMenuitems,StudentMenuitems};


// const Menuitems = [
  
//   {
//     id: uniqueId(),
//     title: "Dashboard",
//     icon: IconLayoutDashboard,
//     href: "/dashboard/",
//   },
//   {
//     navlabel: true,
//     subheader: "Student",
//   },
//   // {
//   //   id: uniqueId(),
//   //   title: "All Test Records",
//   //   icon : IconReportAnalytics,
    
//   //   href: "/dashboard/student/all_results",
//   // },
//   {
//     id: uniqueId(),
//     title: "Start Practice Test",
 
//     icon: IconCopy,
//     href: "/dashboard/student/select-test",
//   },
//   {
//     navlabel: true,
//     subheader: "Admin",
//   },
//   {
//     id: uniqueId(),
//     title: "Manage Question Bank",
//     icon: IconAperture,
//     href: "/dashboard/admin/manage-questionBank",
//   },
//   {
//     id: uniqueId(),
//     title: "Set Question Bank",
//     icon: IconUserPlus,
//     href: "/dashboard/admin/set-question-bank",
//   },
 
// ];

// export default Menuitems;

