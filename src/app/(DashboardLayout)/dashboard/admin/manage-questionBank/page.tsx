"use client";
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  MenuItem,
  Button,
} from "@mui/material";
import { Edit, Delete, Cancel } from "@mui/icons-material";
import PageContainer from "../../components/container/PageContainer";
import { SubjectWithChaptersType, getUniqueSubjects, getChaptersBySubject } from "@/lib/getSubjectWiseChapter";
import { useRouter } from "next/navigation";
import QuestionTypeSelector from "../../components/questionTypeSelector";
import { unstable_noStore as noStore } from "next/cache";

import * as XLSX from "xlsx";
import Loading from "../../loading";
import { getCurrentUser } from "@/lib/getCurrentUser";
import RenderMath from "@/lib/renderMaths";

import html2pdf from "html2pdf.js";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import katex from "katex";
import "katex/dist/katex.min.css";

// Define the type for a question
export interface QuestionData {
  _id: string;
  questionType: "text" | "image";
  hint: {
    text: string | null;
    imgUrl: string | null;
  };
  hintType: "text" | "image";
  optionType: "text" | "image";
  question: {
    text: string | null;
    imgUrl: string | null;
  };
  options: {
    text: string | null;
    imgUrl: string | null;
  }[];
  answer: "A" | "B" | "C" | "D";
  level: "Easy" | "Medium" | "Difficult" | "Moderate" | "Very Easy" | "Extreme" | "Excellent";
  course: string;
  subject: string;
  chapter: string;
  uploadedBy: string;
  createdAt: string; // or Date if you're converting it
  updatedAt: string; // or Date
  __v: number;
}



// Converts math or text to HTML string
function renderMathToHTML(text?: string): string {
  if (!text) return "";
  try {
    const raw = text.trim();
    // If it already has LaTeX symbols like α, β etc., you may normalize or just render directly
    return katex.renderToString(raw, { throwOnError: false });
  } catch (e) {
    return text ?? "";
  }
}

// Wait until all images load
function waitForImages(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
    )
  );
}

// Generate PDF
// async function handleDownloadPDF(questions: any[]) {
//   const container = document.createElement("div");
//   container.style.padding = "20px";
//   container.style.fontFamily = "Arial, sans-serif";

//   // Header
//   const header = document.createElement("h2");
//   header.innerText = "Innovative Academy";
//   header.style.textAlign = "center";
//   header.style.marginBottom = "20px";
//   container.appendChild(header);

//   // Each question
//   questions.forEach((q, idx) => {
//     const block = document.createElement("div");
//     block.style.marginBottom = "25px";
//     block.style.padding = "12px";
//     block.style.borderBottom = "1px solid #ccc";
//     block.style.pageBreakInside = "avoid";

//     // Question number
//     const qNum = document.createElement("h4");
//     qNum.innerText = `Q${idx + 1}:`;
//     block.appendChild(qNum);

//     // Question content
//     const qDiv = document.createElement("div");
//     if (q.questionType === "image" && q.question.imgUrl) {
//       qDiv.innerHTML = `<img src="${q.question.imgUrl}" style="max-width:500px; height:auto; border-radius:4px;" />`;
//     } else {
//       qDiv.innerHTML = String(RenderMath(q.question.text));
//     }
//     qDiv.style.marginBottom = "8px";
//     qDiv.style.wordWrap = "break-word";
//     qDiv.style.whiteSpace = "normal";
//     block.appendChild(qDiv);

//     // Options vertical
//     ["A", "B", "C", "D"].forEach((opt, i) => {
//       const optText = q.options?.[i]?.text ?? "";
//       const optImg = q.options?.[i]?.imgUrl ?? "";
//       if (optText || optImg) {
//         const optDiv = document.createElement("div");
//         if (optImg) {
//           optDiv.innerHTML = `<strong>${opt}.</strong> <img src="${optImg}" style="max-width:400px; height:auto; border-radius:4px;" />`;
//         } else {
//           optDiv.innerHTML = `<strong>${opt}.</strong> ${String(RenderMath(optText))}`;
//         }
//         optDiv.style.marginBottom = "4px";
//         block.appendChild(optDiv);
//       }
//     });

//     // Answer & level
//     const ansDiv = document.createElement("div");
//     ansDiv.innerHTML = `<strong>Answer:</strong> ${q.answer ?? ""} &nbsp; | &nbsp; <strong>Level:</strong> ${q.level ?? ""}`;
//     ansDiv.style.marginTop = "6px";
//     block.appendChild(ansDiv);

//     // Subject, Chapter, Course
//     const metaDiv = document.createElement("div");
//     metaDiv.innerHTML = `<strong>Subject:</strong> ${q.subject ?? ""} &nbsp; | &nbsp; <strong>Chapter:</strong> ${q.chapter ?? ""} &nbsp; | &nbsp; <strong>Course:</strong> ${q.course ?? ""}`;
//     metaDiv.style.marginTop = "2px";
//     metaDiv.style.fontSize = "0.9em";
//     metaDiv.style.color = "#555";
//     block.appendChild(metaDiv);

//     container.appendChild(block);
//   });

//   document.body.appendChild(container);
//   await waitForImages(container); // wait for images

//   html2pdf()
//     .set({
//       margin: 0.5,
//       filename: "InnovativeAcademy_Questions.pdf",
//       html2canvas: { scale: 2, allowTaint: true },
//       jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//     })
//     .from(container)
//     .save()
//     .finally(() => {
//       document.body.removeChild(container);
//     });
// }

export default function ManageQuestionBank() {
  // Use the Question type for the state

  noStore()

  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const [level, setLevel] = useState<string>("");
  const [course, setCourse] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [chapter, setChapter] = useState<string>("");
  const [search, setSearch] = useState("");

    const [subjectWithChapters, setSubjectWithChapters] = useState<SubjectWithChaptersType[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [chapters, setChapters] = useState<string[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
// const {user}=useUser()
const [user,setUser]=useState({_id:""})
  const [isLoading,setIsLoading]=useState(true)
    
  const router=useRouter()

    useEffect(() => {
      const fetchSubjectWithChapters = async () => {
        const res = await fetch("/api/Fetch-SubjectWithChapters",{cache:"no-store",});
        if (!res.ok) {
          console.error("Failed to fetch subjects");
          return;
        }
        const json = await res.json();
        if (json.success) {
          setSubjectWithChapters(json.data);
          setSubjects(getUniqueSubjects(json.data));
        }
      };
      fetchSubjectWithChapters();
    }, []);
  
    useEffect(() => {
      if (subject) {
        setChapters(getChaptersBySubject(subjectWithChapters, subject));
      } else {
        setChapters([]);
      }
    }, [subject, subjectWithChapters]);
  

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch("/api/Fetch-QuestionBank",{cache:"no-store",});
      if (!res.ok) {
        console.error("Failed to fetch questions");
        return;
      }
     
      const data = await res.json();
      setQuestions(data.questions || []);
    };

    fetchQuestions();
  }, []);

//  const filteredQuestions = questions.filter((q) => {

//   const subjectMatch = subject ? q.subject?.toLowerCase().includes(subject.toLowerCase()) : true;
//   const chapterMatch = chapter ? q.chapter?.toLowerCase().includes(chapter.toLowerCase()) : true;
//   const levelMatch = level ? q.level?.toLowerCase().includes(level.toLowerCase()) : true;
// const courseMatch = course ? q.course?.toLowerCase().includes(course.toLowerCase()) : true;

//   return subjectMatch && chapterMatch && levelMatch&&courseMatch;
// });

const filteredQuestions = questions.filter((q) => {
  const subjectMatch = subject ? q.subject?.toLowerCase().includes(subject.toLowerCase()) : true;
  const chapterMatch = chapter ? q.chapter?.toLowerCase().includes(chapter.toLowerCase()) : true;
  const levelMatch = level ? q.level?.toLowerCase().includes(level.toLowerCase()) : true;
  const courseMatch = course ? q.course?.toLowerCase().includes(course.toLowerCase()) : true;

  const s = search.trim().toLowerCase();
  const searchMatch = s
    ? (
        (q.question?.text ?? "").toLowerCase().includes(s) ||
        (q.hint?.text ?? "").toLowerCase().includes(s) ||
        (q.subject ?? "").toLowerCase().includes(s) ||
        (q.chapter ?? "").toLowerCase().includes(s) ||
        (q.course ?? "").toLowerCase().includes(s) ||
        (q.options ?? []).some((o) => (o.text ?? "").toLowerCase().includes(s))
      )
    : true;

  return subjectMatch && chapterMatch && levelMatch && courseMatch && searchMatch;
});

const handleLevelChange = (newLevel: string) => {
  setLevel(newLevel);
};


const handleCourseChange = (newCourse: string) => {
  setCourse(newCourse);
};

const handleSubjectChange = (newSubject: string) => {
  setSubject(newSubject);
};

const handleChapterChange = (newChapter: string) => {
  setChapter(newChapter);
};

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`/api/Delete-Question/${id}`,{cache:"no-store",
        method: 'DELETE',
      });
  
      if (res.ok) {
        alert('Question deleted successfully');
        // Update UI without full reload
        setQuestions(prevQuestions => prevQuestions.filter(q => q._id !== id));
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong while deleting.');
    }
  };
  


const [isSubmitted, setIsSubmitted] = useState(false);

const tableRef = useRef<HTMLDivElement>(null);


const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const data = new Uint8Array(event.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
console.log(jsonData)
    // Call your API to save questions
    const res = await fetch("/api/Import-Questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: jsonData,userId:user?._id }),
    });

    if (res.ok) {
      alert("Questions imported successfully!");
      location.reload(); // or re-fetch questions
    } else {
      alert("Failed to import questions.");
    }
  };

  reader.readAsArrayBuffer(file);
};

const renderMyMaths=(my_formula:any)=>{
  return <span>{RenderMath(my_formula)}</span>
}
const handleDownloadExcel = () => {
  const exportData = filteredQuestions.map((q) => ({
    // "question": renderMathToHTML(q.question?.text ?? ""),

    
    // "optionA": renderMathToHTML(q.options?.[0]?.text ?? ""),
    
    // "optionB": renderMathToHTML(q.options?.[1]?.text ?? ""),
    
    // "optionC": renderMathToHTML(q.options?.[2]?.text ?? ""),
    
    // "optionD": renderMathToHTML(q.options?.[3]?.text ?? ""),
    
    // "hint": renderMathToHTML(q.hint?.text ?? ""),

"question": q.question?.text ?? "",

    
    "optionA": q.options?.[0]?.text ?? "",
    
    "optionB": q.options?.[1]?.text ?? "",
    
    "optionC": q.options?.[2]?.text ?? "",
    
    "optionD": q.options?.[3]?.text ?? "",
    
    "hint": q.hint?.text ?? "",

    answer: q.answer ?? "",
    level: q.level ?? "",
     course: q.course ?? "",
    subject: q.subject ?? "",
    chapter: q.chapter ?? "",
    uploadedBy: q.uploadedBy ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: [
      
      "question",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "hint",
      "answer",
      "level",
      "course",
      "subject",
      "chapter",
      "uploadedBy",
    ],
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

  XLSX.writeFile(workbook, "QuestionBank.xlsx");
};


useEffect(()=>{
if(filteredQuestions){
  setIsLoading(false)
}
},[filteredQuestions])

// const handleDownloadPDF = async () => {
//   if (!tableRef.current) return;

//   const element = tableRef.current;

//   // 🔹 Save original styles
//   const originalOverflow = element.style.overflow;
//   const originalHeight = element.style.height;
//   const originalMaxHeight = element.style.maxHeight;

//   // 🔹 Remove scroll restrictions
//   element.style.overflow = "visible";
//   element.style.height = "auto";
//   element.style.maxHeight = "none";

//   // 🔹 Force full width
//   const fullWidth = element.scrollWidth;
//   const fullHeight = element.scrollHeight;

//   const canvas = await html2canvas(element, {
//     scale: 2,
//     useCORS: true,
//     backgroundColor: "#ffffff",
//     width: fullWidth,
//     height: fullHeight,
//     windowWidth: fullWidth,
//     windowHeight: fullHeight,
//   });

//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jsPDF({
//     orientation: "landscape",
//     unit: "mm",
//     format: "a4",
//   });

//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();

//   const imgWidth = pageWidth;
//   const imgHeight = (canvas.height * imgWidth) / canvas.width;

//   let heightLeft = imgHeight;
//   let position = 0;

//   pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//   heightLeft -= pageHeight;

//   while (heightLeft > 0) {
//     position = heightLeft - imgHeight;
//     pdf.addPage();
//     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;
//   }

//   pdf.save("QuestionBank.pdf");

//   // 🔹 Restore original styles
//   element.style.overflow = originalOverflow;
//   element.style.height = originalHeight;
//   element.style.maxHeight = originalMaxHeight;
// };

// // Main PDF download function
// function handleDownloadPDF(questions: any[]) {
//   const container = document.createElement("div");
//   container.style.padding = "20px";
//   container.style.fontFamily = "Arial, sans-serif";

//   // Header
//   const header = document.createElement("h2");
//   header.innerText = "Innovative Academy";
//   header.style.textAlign = "center";
//   header.style.marginBottom = "20px";
//   container.appendChild(header);

//   // Table
//   const table = document.createElement("table");
//   table.style.width = "100%";
//   table.style.borderCollapse = "collapse";
//   table.style.tableLayout = "fixed"; // ensures column width uniform

//   const columns = [
//     "Question",
//     "Option A",
//     "Option B",
//     "Option C",
//     "Option D",
//     "Hint",
//     "Answer",
//     "Level",
//     "Subject",
//     "Chapter",
//     "Course",
//   ];

//   // Table header
//   const thead = document.createElement("thead");
//   const trHead = document.createElement("tr");
//   columns.forEach(c => {
//     const th = document.createElement("th");
//     th.innerText = c;
//     th.style.border = "1px solid #333";
//     th.style.padding = "6px";
//     th.style.background = "#f2f2f2";
//     th.style.textAlign = "center";
//     th.style.fontWeight = "bold";
//     trHead.appendChild(th);
//   });
//   thead.appendChild(trHead);
//   table.appendChild(thead);

//   // Table body
//   const tbody = document.createElement("tbody");
//   questions.forEach(q => {
//     const tr = document.createElement("tr");

//     const cells = [
//       q.questionType === "image"
//         ? `<img src="${q.question.imgUrl}" style="max-width:200px; max-height:120px; border-radius:4px;" />`
//         : renderMathToHTML(q.question.text),
//       renderMathToHTML(q.options?.[0]?.text),
//       renderMathToHTML(q.options?.[1]?.text),
//       renderMathToHTML(q.options?.[2]?.text),
//       renderMathToHTML(q.options?.[3]?.text),
//       renderMathToHTML(q.hint?.text),
//       q.answer ?? "",
//       q.level ?? "",
//       q.subject ?? "",
//       q.chapter ?? "",
//       q.course ?? "",
//     ];

//     cells.forEach(c => {
//       const td = document.createElement("td");
//       td.style.border = "1px solid #333";
//       td.style.padding = "6px";
//       td.style.verticalAlign = "top";
//       td.style.wordBreak = "break-word";
//       td.innerHTML = c;
//       tr.appendChild(td);
//     });

//     tbody.appendChild(tr);
//   });

//   table.appendChild(tbody);
//   container.appendChild(table);
//   document.body.appendChild(container);

//   // Generate PDF
//   html2pdf()
//     .set({
//       margin: 0.5,
//       filename: "InnovativeAcademy_Questions.pdf",
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: "in", format: "a4", orientation: "landscape" }, // landscape
//     })
//     .from(container)
//     .save()
//     .finally(() => {
//       document.body.removeChild(container); // cleanup
//     });
// }

// async function handleDownloadPDF(questions: any[], orientation: "portrait" | "landscape" = "portrait") {
//   console.log("papapapapapa")
//   const container = document.createElement("div");
//   container.style.padding = "20px";
//   container.style.fontFamily = "Arial, sans-serif";

//   // Header
//   const header = document.createElement("h2");
//   header.innerText = "Innovative Academy";
//   header.style.textAlign = "center";
//   header.style.marginBottom = "20px";
//   container.appendChild(header);

//   // Question blocks
//   questions.forEach((q, idx) => {
//     const block = document.createElement("div");
//     block.style.marginBottom = "25px";
//     block.style.padding = "12px";
//     block.style.border = "1px solid #ccc";
//     block.style.borderRadius = "6px";
//     block.style.pageBreakInside = "avoid"; // avoid splitting question
//     block.style.backgroundColor = idx % 2 === 0 ? "#f9f9f9" : "#ffffff";

//     // Question number
//     const qNum = document.createElement("h4");
//     qNum.innerText = `Q${idx + 1}:`;
//     qNum.style.marginBottom = "8px";
//     block.appendChild(qNum);

//     // Question content
//     if (q.questionType === "image") {
//       const img = document.createElement("img");
//       img.src = q.question.imgUrl || "";
//       img.style.maxWidth = "500px";
//       img.style.height = "auto";
//       img.style.borderRadius = "4px";
//       img.style.marginBottom = "6px";
//       block.appendChild(img);
//     } else {
//       const qText = document.createElement("div");
//       qText.innerHTML = renderMathToHTML(q.question.text);
//       qText.style.marginBottom = "8px";
//       qText.style.wordWrap = "break-word";
//       qText.style.whiteSpace = "normal"; // wrap text
//       block.appendChild(qText);
//     }

//     // Options vertical
//     const optionsContainer = document.createElement("div");
//     ["A", "B", "C", "D"].forEach((opt, i) => {
//       const optText = q.options?.[i]?.text ?? "";
//       if (optText || q.options?.[i]?.imgUrl) {
//         const optDiv = document.createElement("div");
//         optDiv.style.marginBottom = "4px";
//         if (q.options[i]?.imgUrl) {
//           optDiv.innerHTML = `<strong>${opt}.</strong> <img src="${q.options[i].imgUrl}" style="max-width:400px; max-height:150px; border-radius:4px;" />`;
//         } else {
//           optDiv.innerHTML = `<strong>${opt}.</strong> ${renderMathToHTML(optText)}`;
//         }
//         optionsContainer.appendChild(optDiv);
//       }
//     });
//     block.appendChild(optionsContainer);

//     // Answer & Level
//     const answerDiv = document.createElement("div");
//     answerDiv.innerHTML = `<strong>Answer:</strong> ${q.answer ?? ""} &nbsp; | &nbsp; <strong>Level:</strong> ${q.level ?? ""}`;
//     answerDiv.style.marginTop = "6px";
//     block.appendChild(answerDiv);

//     // Subject, Chapter, Course
//     const metaDiv = document.createElement("div");
//     metaDiv.innerHTML = `<strong>Subject:</strong> ${q.subject ?? ""} &nbsp; | &nbsp; <strong>Chapter:</strong> ${q.chapter ?? ""} &nbsp; | &nbsp; <strong>Course:</strong> ${q.course ?? ""}`;
//     metaDiv.style.marginTop = "2px";
//     metaDiv.style.fontSize = "0.9em";
//     metaDiv.style.color = "#555";
//     block.appendChild(metaDiv);

//     container.appendChild(block);
//   });

//   document.body.appendChild(container);
//   await waitForImages(container); // ensure all images loaded before pdf

//   html2pdf()
//     .set({
//       margin: 0.5,
//       filename: "InnovativeAcademy_Questions.pdf",
//       html2canvas: { scale: 2, allowTaint: true, logging: false },
//       jsPDF: { unit: "in", format: "a4", orientation: orientation },
//     })
//     .from(container)
//     .save()
//     .finally(() => {
//       document.body.removeChild(container);
//     });
// }

  useEffect(() => {
    async function fetchUser() {
      try {
         const data = await getCurrentUser();
       
        if (data?.success && data.user) {
   
          setUser(data.user);
          console.log(data.user)
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);


if(isLoading){
  return <Loading />
}


  return (
    
    <PageContainer title="Manage Question Bank" description="this is manage question bank page">
      <Box  mb={3}>
        <Typography variant="h4" mb={4}>
          Manage Question Bank
        </Typography>
        {/* <Grid container spacing={2}>
        
          <Grid item xs={12} sm={12}>
            <QuestionTypeSelector
              onLevelChange={handleLevelChange}
               onCourseChange={handleCourseChange}
              onSubjectChange={handleSubjectChange}
              onChapterChange={handleChapterChange}
              
       title={null}
              isSubmitted={isSubmitted}
              />
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setLevel("");
                setSubject("");
                setChapter("");
                setIsSubmitted(true);
              }}
              sx={{
                marginTop: "20px",
                paddingX:"10px",
                paddingY:"0px",
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                  borderColor: "#1565c0",
                },
              }}
              disabled={!course && !subject && !chapter}
            >
              <IconButton
                sx={{
                  marginRight: 0.5,
                  paddingLeft:0,
                  color: "#d32f2f",
                  "&:hover": {
                    color: "#b71c1c",
                  },
                }}
              >
                <Cancel />
              </IconButton>
              <Typography
                variant="body1"
                sx={{
                  color: "#d32f2f",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                Clear Filters
              </Typography>
            </Button>
            <Button
  variant="contained"
  component="label"
  sx={{ marginTop: "20px", marginLeft: "15px" }}
>
  Import Questions
  <input
    type="file"
    accept=".xlsx, .xls"
    hidden
    onChange={handleExcelUpload}
  />
</Button>
<Button
  variant="contained"
  color="primary"
  onClick={handleDownloadExcel}
  sx={{ marginTop: "20px", marginLeft: "15px" }}
>
  Export Questions
</Button>

{selectedQuestions.length > 0 && (
  <Button
    variant="contained"
    color="error"
    sx={{ marginTop: "20px", marginLeft: "15px" }}
    onClick={async () => {
      const confirmDelete = confirm("Are you sure you want to delete selected questions?");
      if (!confirmDelete) return;

      try {
        const res = await fetch("/api/Bulk-Delete-Questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedQuestions }),
        });

        if (res.ok) {
          alert("Selected questions deleted successfully");
          setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q._id)));
          setSelectedQuestions([]);
        } else {
          alert("Failed to delete selected questions");
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      }
    }}
  >
    Delete Selected ({selectedQuestions.length})
  </Button>
)}

            </Grid>
            
        </Grid>  */}
        <Grid container spacing={2}>
  <Grid item xs={12}>
    {/* 1) Filters selector */}
    <QuestionTypeSelector
      onLevelChange={handleLevelChange}
      onCourseChange={handleCourseChange}
      onSubjectChange={handleSubjectChange}
      onChapterChange={handleChapterChange}
      title={null}
      isSubmitted={isSubmitted}
    />

    {/* 2) Search + Buttons responsive row */}
    <Grid
      container
      spacing={2}
      alignItems="center"
      sx={{ mt: 1 }}
    >
      {/* Search */}
      <Grid item xs={12} md={5}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search (question / options / hint)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Grid>

      {/* Actions */}
      <Grid item xs={12} md={7}>
        <Grid
          container
          spacing={2}
          justifyContent={{ xs: "stretch", md: "flex-end" }}
          alignItems="center"
        >
          {/* Clear */}
          <Grid item xs={12} sm="auto">
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                setLevel("");
                setSubject("");
                setChapter("");
                setIsSubmitted(true);
                setSearch("");
              }}
              sx={{
                height: 40,
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                  borderColor: "#1565c0",
                },
              }}
              disabled={!course && !subject && !chapter && !search}
              startIcon={<Cancel sx={{ color: "#d32f2f" }} />}
            >
              Clear
            </Button>
          </Grid>

          {/* Import */}
          <Grid item xs={12} sm="auto">
            <Button
              fullWidth
              variant="contained"
              component="label"
              sx={{ height: 40, minWidth: 160 }}
            >
              Import
              <input
                type="file"
                accept=".xlsx, .xls"
                hidden
                onChange={handleExcelUpload}
              />
            </Button>
          </Grid>

          {/* Export */}
          <Grid item xs={12} sm="auto">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
              sx={{ height: 40, minWidth: 160 }}
            >
              Export
            </Button>
          </Grid>
 {/* <Grid item xs={12} sm="auto">
  <Button
    fullWidth
    variant="contained"
    color="success"
    onClick={() => handleDownloadPDF(filteredQuestions)}
    sx={{ height: 40, minWidth: 180 }}
  >
    Download PDF (Table)
  </Button>
</Grid> */}
          {/* Delete Selected */}
          {selectedQuestions.length > 0 && (
            <Grid item xs={12} sm="auto">
              <Button
                fullWidth
                variant="contained"
                color="error"
                sx={{ height: 40, minWidth: 220 }}
                onClick={async () => {
                  const confirmDelete = confirm(
                    "Are you sure you want to delete selected questions?"
                  );
                  if (!confirmDelete) return;

                  try {
                    const res = await fetch("/api/Bulk-Delete-Questions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids: selectedQuestions }),
                    });

                    if (res.ok) {
                      alert("Selected questions deleted successfully");
                      setQuestions((prev) =>
                        prev.filter((q) => !selectedQuestions.includes(q._id))
                      );
                      setSelectedQuestions([]);
                    } else {
                      alert("Failed to delete selected questions");
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Something went wrong");
                  }
                }}
              >
                Delete Selected ({selectedQuestions.length})
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  </Grid>
  </Grid>
      </Box>

      {/* ✅ Table Scroll Wrapper */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 780 }} ref={tableRef}>
        <TableContainer
  component={Paper}
  elevation={1}
  sx={{
    maxHeight: 500,
    overflow: "auto",
  }}
  id="question-container"
>

<Table
  stickyHeader
  sx={{
    borderCollapse: "collapse",
    width: "100%",
    fontFamily: "Inter, sans-serif",
    "& thead th": {
      backgroundColor: "#f4f5f7", // subtle gray header
      color: "#333",
      fontWeight: 600,
      fontSize: "0.9rem",
      
      border: "1px solid rgb(197, 197, 197)",
      
      textAlign: "left",
    },
    "& tbody td": {
      // borderBottom: "1px solid #e0e0e0",
      border: "1px solid rgb(197, 197, 197)",
      fontSize: "0.87rem",
      color: "#2c2c2c",
      backgroundColor: "#ffffff",
    },
    "& tbody tr:nth-of-type(even) td": {
      backgroundColor: "#fafafa",
    },
    "& tbody tr:hover td": {
      backgroundColor: "#f0f2f5",
      transition: "background 0.3s ease",
    },
  }}
>


    <TableHead>
      {/* <TableRow sx={{ backgroundColor: "#1976d2" }}>
        {[
          "Subject",
          "Chapter",
          "Level",
          "Question",
          "Options",
          "Answer",
          "Actions",
        ].map((header) => (
          <TableCell
            key={header}
            sx={{
              color: "#fff",
              fontWeight: "bold",
              border: "1px solid #efefef",
            
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {header}
          </TableCell>
        ))}
      </TableRow> */}
      <TableRow>
  <TableCell
    padding="checkbox"
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 1,
    padding:"10px 21px"
    }}
  >
    <input
      type="checkbox"
      checked={filteredQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length}
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedQuestions(filteredQuestions.map((q) => q._id));
        } else {
          setSelectedQuestions([]);
        }
      }}
    />
  </TableCell>
  {/* removed level */}
  {["Subject", "Chapter", 
  
   "Question", "Options", "Answer","Hint","Course","Level" ,  "Actions"].map((header) => (
    <TableCell
      key={header}
      sx={{
        color: "#fff",
        fontWeight: "bold",
        border: "1px solid #efefef",
      
        position: "sticky",
        top: 0,
        zIndex: 1,
        
        
      }}
    >
      {header}
    </TableCell>
  ))}
</TableRow>

    </TableHead>

    <TableBody>
      {filteredQuestions.map((q, index) => (
        <TableRow
          key={q._id}
          hover
          sx={{
            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
            "&:hover": { backgroundColor: "#e3f2fd" },
          }}
        >
          <TableCell padding="checkbox" sx={{padding:"0 21px 0 21px"}}>
  <input
    type="checkbox"
    checked={selectedQuestions.includes(q._id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedQuestions((prev) => [...prev, q._id]);
      } else {
        setSelectedQuestions((prev) => prev.filter((id) => id !== q._id));
      }
    }}
  />
</TableCell>

          <TableCell >{q.subject}</TableCell>
          <TableCell >{q.chapter}</TableCell>
          {/* <TableCell >
            <Chip
              label={q.level}
              size="small"
              sx={{
                fontWeight: 500,
                backgroundColor:
                  q.level === "Easy"
                    ? "#E6FFFA"
                    : q.level === "Medium"
                    ? "#FFF8E1"
                    : "#FDEDE8",
                color:
                  q.level === "Easy"
                    ? "#02b3a9"
                    : q.level === "Medium"
                    ? "#ae8e59"
                    : "#f3704d",
              }}
            />
          </TableCell> */}
          <TableCell >
            {q.questionType === "image" ? (
              <img
                src={q.question.imgUrl || ""}
                alt="question"
                style={{ maxWidth: 195, height: "auto", borderRadius: 4 }}
              />
            ) : (
              <p style={{ wordBreak: "break-word" }}>
                 <RenderMath text={q.question.text} />
                </p>
              
            )}
            {/* {q.question.text} */}
          </TableCell>
          <TableCell >
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  {q.optionType === "image" && opt.imgUrl ? (
                    <img
                      src={opt.imgUrl}
                      alt={`option-${idx}`}
                      style={{
                        maxWidth: 73,
                        height: "auto",
                        borderRadius: 3,
                      }}
                    />
                  ) : (
                    <p style={{ wordBreak: "break-word" }}>
                      <RenderMath text={`${String.fromCharCode(65 + idx)}. ${opt.text}`} />
                    </p>
                  )}
                  {/* {`${String.fromCharCode(65 + idx)}. ${opt.text}`} */}
                </li>
              ))}
            </ul>
          </TableCell>
          <TableCell >{q.answer}</TableCell>
          <TableCell >
            {q.hintType === "image" ? (
              <img
                src={q.hint?.imgUrl || ""}
                alt="Hint Not Rendering"
                style={{ maxWidth: 195, height: "auto", borderRadius: 4 }}
              />
            ) : (
              <p style={{ wordBreak: "break-word" }}>
                    <RenderMath text={q.hint?.text||"-"} />
                  
                </p>
            )}
            {/* {q.hint?.text||"-"} */}
          </TableCell>
           <TableCell >{q.course}</TableCell>
                      <TableCell >{q.level}</TableCell>
          <TableCell >
            <IconButton  href={`/dashboard/admin/edit-question/${q._id}`} sx={{ color: "#1976d2" }}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(q._id)} sx={{ color: "#d32f2f" }}>
              <Delete />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

        </Box>
      </Box>
    </PageContainer>
  );
}



