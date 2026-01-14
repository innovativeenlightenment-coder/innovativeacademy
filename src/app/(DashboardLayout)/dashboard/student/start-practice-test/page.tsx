'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getLevelLabel } from '@/lib/getLevelLable';

interface PracticeRow {
  course: string;
  subject?: string;
  chapter?: string;
  level:string;
  count: number;
}




const levelColorMap: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  difficult: "bg-orange-100 text-orange-700",
  extreme: "bg-red-100 text-red-700",
};

const PracticeSelector= () => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [rows, setRows] = useState<PracticeRow[]>([]);
const router=useRouter()
  /** Fetch options **/
  useEffect(() => {
   const fetchData = async () => {
  try {
    const userRes = await fetch('/api/auth/Get-Current-User');
    const userData = await userRes.json();
    const userCourses: string[] = userData?.user?.courses || [];

    const res = await fetch('/api/Get-Available-Options?email='+encodeURIComponent(userData?.user?.email) ||"email");
    const data = await res.json();

    if (data.success) {
      const practiceRows: PracticeRow[] = data.chapters
        .filter((ch: any) => userCourses.includes(ch.course))
        .map((ch: any) => ({
          course: ch.course,
          subject: ch.subject,
          chapter: ch.chapter,
          level:ch.level,
          count: ch.count,
        }));

      setRows(practiceRows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingOptions(false);
  }
};

fetchData();

  }, []);

  /** Filter **/
  const filteredRows = rows.filter((r) =>
    Object.values(r)
      .join(' ')
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  /** Start Practice **/
  const handleStart = async (row: PracticeRow) => {
  setLoading(true);
  try {
    // 1️⃣ Get current user
    const res_user = await fetch("/api/auth/Get-Current-User");
    const data_user = await res_user.json();
    const email = data_user.user.email;

    // 2️⃣ Fetch questions
    const res = await fetch("/api/Get-Questions-By-Type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testType: "practice",
        course: row.course,
        subject: row.subject,
        chapter: row.chapter,
        email,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Not enough questions");
      return;
    }
console.log(data.questions)
    // 3️⃣ Prepare test session object
    const testSession = {
      testType: "practice",
      course: row.course,
      subject: row.subject,
      chapter: row.chapter,
      email,
      questions: data.questions,
      chapterLevel: data.chapterLevel,
      totalQuestions: data.totalQuestions,
      avgScore: data.avgScore,
      startTime: Date.now(), // optional: store test start time
    };

    // 4️⃣ Store in sessionStorage (use localStorage if needed)
    sessionStorage.setItem("currentTest", JSON.stringify(testSession));

    // 5️⃣ Redirect to /test page
    router.push("/dashboard/student/test")
  } catch (err) {
    console.error(err);
    alert("Error starting test");
  } finally {
    setLoading(false);
  }
};


  if (loadingOptions)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4, color: '#1976d2' }}>
        Practice Test Selection
      </Typography>

      <Paper sx={{ p: 3 ,display:"flex", justifyContent:"space-between"}}>
        {['Physics', 'Chemistry', 'Biology', 'Maths'].map((subject) => {
    const active = filterText.toLowerCase() === subject.toLowerCase();

    return (
      <Box
        key={subject}
        onClick={() => setFilterText(subject)}
        sx={{
          cursor: 'pointer',
          py: 1.5,
          px: 1,
          borderBottom: active ? '3px solid #1976d2' : '1px solid #e0e0e0',
          color: active ? '#1976d2' : '#444',
          fontWeight: active ? 600 : 400,
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#1976d2',
          },
        }}
      >
        {subject}
      </Box>
    );
  })}

  {/* Optional: All */}
  <Box
    onClick={() => setFilterText('')}
    sx={{
      cursor: 'pointer',
      py: 1.5,
      px: 1,
      borderBottom: filterText === '' ? '3px solid #1976d2' : '1px solid #e0e0e0',
      color: filterText === '' ? '#1976d2' : '#444',
      fontWeight: filterText === '' ? 600 : 400,
      transition: 'all 0.2s ease',
      '&:hover': {
        color: '#1976d2',
      },
    }}
  >
    All Subjects
  </Box>
        <input
          type="text"
          placeholder="Filter course / subject / chapter"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            marginBottom: 12,
            minWidth: 280,
          }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Chapter</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Questions</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Chip label={row.course} size="small" variant="outlined" />
                  </TableCell>

                  <TableCell>
                    {row.subject ? (
                      <Chip label={row.subject} size="small" variant="outlined" />
                    ) : '—'}
                  </TableCell>

                  <TableCell>
                    {row.chapter ? (
                      <Chip label={row.chapter} size="small" variant="outlined" />
                    ) : '—'}
                  </TableCell>

                  {/* <TableCell>
                    <Chip label={`${row.count} questions`} color="success" size="small" />
                  </TableCell> */}
<TableCell>
                  <Chip
  label={`${getLevelLabel(row.level) || "Beginner"} level`}
  size="small"
  sx={{
    bgcolor:
      row.level === "easy"
        ? "#DCFCE7"
        : row.level === "moderate"
        ? "#FEF9C3"
        : row.level === "difficult"
        ? "#FFEDD5"
        : row.level === "extreme"
        ? "#FEE2E2"
        : "#DCFCE7",
    color:
      row.level === "easy"
        ? "#166534"
        : row.level === "moderate"
        ? "#854D0E"
        : row.level === "difficult"
        ? "#9A3412"
        : row.level === "extreme"
        ? "#991B1B"
        : "#166534",
    fontWeight: 600,
  }}
/>
</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayIcon />}
                      disabled={loading}
                      onClick={() => handleStart(row)}
                    >
                      Start
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PracticeSelector;
