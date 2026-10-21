import { uniqueId } from "lodash";

import {
  IconLayoutDashboard,
  IconReportAnalytics,
  IconCalendarEvent,
  IconClipboardCheck,
  IconClipboardList,
  IconBook2,
  IconPlayerPlay,
  IconCertificate,
  IconSchool,
  IconUsers,
  IconUserCheck,
  IconChartBar,
  IconFileText,
  IconDatabase,
  IconListCheck,
  IconSettings,
} from "@tabler/icons-react";

// Reusable menu item types
const AdminMenuitems = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },

  {
    navlabel: true,
    subheader: "STUDENT LEARNING",
  },
  {
    id: uniqueId(),
    title: "Study Calendar",
    icon: IconCalendarEvent,
    href: "/dashboard/student/study-calendar",
  },
  {
    id: uniqueId(),
    title: "Daily Lectures",
    icon: IconPlayerPlay,
    href: "/dashboard/student/daily-lectures",
  },
  {
    id: uniqueId(),
    title: "One-Shot Revision",
    icon: IconBook2,
    href: "/dashboard/student/one-shots",
  },
  {
    id: uniqueId(),
    title: "Practice Tests",
    icon: IconClipboardCheck,
    href: "/dashboard/student/start-practice-test",
  },
  {
    id: uniqueId(),
    title: "Upcoming Exams",
    icon: IconCalendarEvent,
    href: "/dashboard/student/exam",
  },
  {
    id: uniqueId(),
    title: "Test Records",
    icon: IconReportAnalytics,
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Exam Results",
    icon: IconCertificate,
    href: "/dashboard/student/exam-result",
  },

  {
    navlabel: true,
    subheader: "TEACHING & MANAGEMENT",
  },
  {
    id: uniqueId(),
    title: "Student Attendance",
    icon: IconUserCheck,
    href: "/dashboard/admin/attendance",
  },
  {
    id: uniqueId(),
    title: "Student Performance",
    icon: IconChartBar,
    href: "/dashboard/admin/student-performance",
  },
  {
    id: uniqueId(),
    title: "Subject & Chapter Setup",
    icon: IconBook2,
    href: "/dashboard/admin/manage-subjectWithChapter",
  },

  {
    navlabel: true,
    subheader: "ASSESSMENT MANAGEMENT",
  },
  {
    id: uniqueId(),
    title: "Question Bank",
    icon: IconDatabase,
    href: "/dashboard/admin/manage-questionBank",
  },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon: IconListCheck,
    href: "/dashboard/admin/set-question-bank",
  },
  {
    id: uniqueId(),
    title: "Manage Exams",
    icon: IconClipboardList,
    href: "/dashboard/admin/manage-exam",
  },
  {
    id: uniqueId(),
    title: "Set Exams",
    icon: IconFileText,
    href: "/dashboard/admin/set-exam",
  },
  {
    id: uniqueId(),
    title: "Learning Videos",
    icon: IconPlayerPlay,
    href: "/dashboard/admin/manage-learning-videos",
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
    subheader: "MY LEARNING",
  },
  {
    id: uniqueId(),
    title: "Study Calendar",
    icon: IconCalendarEvent,
    href: "/dashboard/student/study-calendar",
  },
  {
    id: uniqueId(),
    title: "Daily Lectures",
    icon: IconPlayerPlay,
    href: "/dashboard/student/daily-lectures",
  },
  {
    id: uniqueId(),
    title: "One-Shot Revision",
    icon: IconBook2,
    href: "/dashboard/student/one-shots",
  },

  {
    navlabel: true,
    subheader: "TESTS & EXAMS",
  },
  {
    id: uniqueId(),
    title: "Practice Tests",
    icon: IconClipboardCheck,
    href: "/dashboard/student/start-practice-test",
  },
  {
    id: uniqueId(),
    title: "Upcoming Exams",
    icon: IconCalendarEvent,
    href: "/dashboard/student/exam",
  },
  {
    id: uniqueId(),
    title: "Test Records",
    icon: IconReportAnalytics,
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Exam Results",
    icon: IconCertificate,
    href: "/dashboard/student/exam-result",
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
    subheader: "STUDENT MANAGEMENT",
  },
  {
    id: uniqueId(),
    title: "Student Attendance",
    icon: IconUserCheck,
    href: "/dashboard/admin/attendance",
  },
  {
    id: uniqueId(),
    title: "Student Performance",
    icon: IconChartBar,
    href: "/dashboard/admin/student-performance",
  },

  {
    navlabel: true,
    subheader: "ACADEMIC SETUP",
  },
  {
    id: uniqueId(),
    title: "Subject & Chapter Setup",
    icon: IconBook2,
    href: "/dashboard/admin/manage-subjectWithChapter",
  },

  {
    navlabel: true,
    subheader: "ASSESSMENTS",
  },
  
  {
    id: uniqueId(),
    title: "Question Bank",
    icon: IconDatabase,
    href: "/dashboard/admin/manage-questionBank",
  },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon: IconListCheck,
    href: "/dashboard/admin/set-question-bank",
  },
  {
    id: uniqueId(),
    title: "Manage Exams",
    icon: IconClipboardList,
    href: "/dashboard/admin/manage-exam",
  },
  {
    id: uniqueId(),
    title: "Set Exams",
    icon: IconFileText,
    href: "/dashboard/admin/set-exam",
  },
  {
    id: uniqueId(),
    title: "Learning Videos",
    icon: IconPlayerPlay,
    href: "/dashboard/admin/manage-learning-videos",
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
    subheader: "STUDENT",
  },
  {
    id: uniqueId(),
    title: "Test Records",
    icon: IconReportAnalytics,
    href: "/dashboard/student/test-record",
  },
  {
    id: uniqueId(),
    title: "Practice Tests",
    icon: IconClipboardCheck,
    href: "/dashboard/student/select-test",
  },

  {
    navlabel: true,
    subheader: "TEACHER",
  },
  {
    id: uniqueId(),
    title: "Question Bank",
    icon: IconDatabase,
    href: "/dashboard/admin/manage-questionBank",
  },
  {
    id: uniqueId(),
    title: "Set Question Bank",
    icon: IconListCheck,
    href: "/dashboard/admin/set-question-bank",
  },
];

export {
  CollegeMenuitems,
  TeacherMenuitems,
  AdminMenuitems,
  StudentMenuitems,
};

// import { IconSchool } from "@tabler/icons-react";
// import {
//   IconAperture,
//   IconCheck,
//   IconCopy,
//   IconLayoutDashboard,
//   IconLogin,
//   IconMailQuestion,
//   IconMapQuestion,
//   IconMoodHappy,
//   IconReportAnalytics,
//   IconTypography,
//   IconUserPlus,
// } from "@tabler/icons-react";

// import { uniqueId } from "lodash";

// const AdminMenuitems = [
  
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
//   {
//     id: uniqueId(),
//     title: "Test Records",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/test-record",
//   },
//   {
//     id: uniqueId(),
//     title: "Study Calendar",
//     icon: IconSchool, 
//     href: "/dashboard/student/study-calendar",
//   },
//   {
//     id: uniqueId(),
//     title: "Upcomming Exams",
 
//     icon: IconCopy,
//     href: "/dashboard/student/exam",
//   },
//   {
//     id: uniqueId(),
//     title: "Start Practice Test",
 
//     icon: IconCopy,
//     href: "/dashboard/student/start-practice-test",
//   },
//   {
//     id: uniqueId(),
//     title: "My Exam Result",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/exam-result",
//   },
//   {
//     id: uniqueId(),
//     title: "Daily Lectures",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/daily-lectures",
//   },
//   {
//     id: uniqueId(),
//     title: "One Shot",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/one-shots",
//   },
//  {
//     navlabel: true,
//     subheader: "Teacher",
//   },
//   //  {
//   //   id: uniqueId(),
//   //   title: "Manage Users",
//   //   icon: IconUserPlus,
//   //   href: "/dashboard/admin/manage-users",
//   // },
//   {
//     id: uniqueId(),
//     title: "Set Subject / Chapter",
//     icon: IconSchool, 
//     href: "/dashboard/admin/manage-subjectWithChapter",
//   },
//   {
//     id: uniqueId(),
//     title: "Attendence",
//     icon: IconSchool, 
//     href: "/dashboard/admin/attendance",
//   },
//   {
//     id: uniqueId(),
//     title: "Students Performance",
//     icon: IconCheck,
//     href: "/dashboard/admin/student-performance",
//   },
//   {
//     id: uniqueId(),
//     title: "Manage Exam",
//     icon: IconCheck,
//     href: "/dashboard/admin/manage-exam",
//   },
//  {
//     id: uniqueId(),
//     title: "Manage Question Bank",
//     icon: IconAperture,
//     href: "/dashboard/admin/manage-questionBank",
//   },
  
//   {
//     id: uniqueId(),
//     title: "Manage Learning Videos",
//     icon: IconAperture,
//     href: "/dashboard/admin/manage-learning-videos",
//   },
//   // {
//   //   id: uniqueId(),
//   //   title: "Generate Question Paper",
//   //   icon: IconAperture,
//   //   href: "/dashboard/admin/generate-question-paper",
//   // },
  
//   {
//     id: uniqueId(),
//     title: "Set Question Bank",
//     icon:  IconMapQuestion, 
//     href: "/dashboard/admin/set-question-bank",
//   },
 
//   {
//     id: uniqueId(),
//     title: "Set Exams",
//     icon:  IconMapQuestion, 
//     href: "/dashboard/admin/set-exam",
//   },
// ];


// const StudentMenuitems = [
  
//   {
//     id: uniqueId(),
//     title: "Dashboard",
//     icon: IconLayoutDashboard,
//     href: "/dashboard/",
//   },
//     {
//     navlabel: true,
//     subheader: "Student",
//   },
//   // {
//     //   id: uniqueId(),
//     //   title: "All Test Records",
//     //   icon : IconReportAnalytics,
    
//   //   href: "/dashboard/student/all_results",
//   // },
//   {
//     id: uniqueId(),
//     title: "Test Records",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/test-record",
//   },
//   {
//     id: uniqueId(),
//     title: "Study Calendar",
//     icon: IconSchool, 
//     href: "/dashboard/student/study-calendar",
//   },
//   {
//     id: uniqueId(),
//     title: "Upcomming Exams",
 
//     icon: IconCopy,
//     href: "/dashboard/student/exam",
//   },
//   {
//     id: uniqueId(),
//     title: "Start Practice Test",
 
//     icon: IconCopy,
//     href: "/dashboard/student/start-practice-test",
//   },
//    {
//     id: uniqueId(),
//     title: "My Exam Result",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/exam-result",
//   },
//  {
//     id: uniqueId(),
//     title: "Daily Lectures",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/daily-lectures",
//   },
//   {
//     id: uniqueId(),
//     title: "One Shot",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/one-shots",
//   },
// ];


// const TeacherMenuitems = [
  
 
//   {
//     id: uniqueId(),
//     title: "Dashboard",
//     icon: IconLayoutDashboard,
//     href: "/dashboard/",
//   },
//     {
//     navlabel: true,
//     subheader: "Teacher",
//   },
//   //  {
//   //   id: uniqueId(),
//   //   title: "Manage Users",
//   //   icon: IconUserPlus,
//   //   href: "/dashboard/admin/manage-users",
//   // },
//   {
//     id: uniqueId(),
//     title: "Set Subject / Chapter",
//     icon: IconSchool, 
//     href: "/dashboard/admin/manage-subjectWithChapter",
//   },
//   {
//     id: uniqueId(),
//     title: "Attendence",
//     icon: IconSchool, 
//     href: "/dashboard/admin/attendence",
//   },
//   {
//     id: uniqueId(),
//     title: "Students Performance",
//     icon: IconCheck,
//     href: "/dashboard/admin/student-performance",
//   },
//   {
//     id: uniqueId(),
//     title: "Manage Exam",
//     icon: IconCheck,
//     href: "/dashboard/admin/manage-exam",
//   },
//  {
//     id: uniqueId(),
//     title: "Manage Question Bank",
//     icon: IconAperture,
//     href: "/dashboard/admin/manage-questionBank",
//   },
  
//   // {
//   //   id: uniqueId(),
//   //   title: "Generate Question Paper",
//   //   icon: IconAperture,
//   //   href: "/dashboard/admin/generate-question-paper",
//   // },
  
//   {
//     id: uniqueId(),
//     title: "Set Question Bank",
//     icon:  IconMapQuestion, 
//     href: "/dashboard/admin/set-question-bank",
//   },
 
//   {
//     id: uniqueId(),
//     title: "Set Exams",
//     icon:  IconMapQuestion, 
//     href: "/dashboard/admin/set-exam",
//   },
 
// ];



// const CollegeMenuitems = [
  
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
//     title: "Test Records",
//     icon : IconReportAnalytics,
    
//     href: "/dashboard/student/test-record",
//   },
//   {
//     id: uniqueId(),
//     title: "Start Practice Test",
 
//     icon: IconCopy,
//     href: "/dashboard/student/select-test",
//   },
//   {
//     navlabel: true,
//     subheader: "Teacher",
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

// export {CollegeMenuitems,TeacherMenuitems,AdminMenuitems,StudentMenuitems};


// // const Menuitems = [
  
// //   {
// //     id: uniqueId(),
// //     title: "Dashboard",
// //     icon: IconLayoutDashboard,
// //     href: "/dashboard/",
// //   },
// //   {
// //     navlabel: true,
// //     subheader: "Student",
// //   },
// //   // {
// //   //   id: uniqueId(),
// //   //   title: "All Test Records",
// //   //   icon : IconReportAnalytics,
    
// //   //   href: "/dashboard/student/all_results",
// //   // },
// //   {
// //     id: uniqueId(),
// //     title: "Start Practice Test",
 
// //     icon: IconCopy,
// //     href: "/dashboard/student/select-test",
// //   },
// //   {
// //     navlabel: true,
// //     subheader: "Admin",
// //   },
// //   {
// //     id: uniqueId(),
// //     title: "Manage Question Bank",
// //     icon: IconAperture,
// //     href: "/dashboard/admin/manage-questionBank",
// //   },
// //   {
// //     id: uniqueId(),
// //     title: "Set Question Bank",
// //     icon: IconUserPlus,
// //     href: "/dashboard/admin/set-question-bank",
// //   },
 
// // ];

// // export default Menuitems;

