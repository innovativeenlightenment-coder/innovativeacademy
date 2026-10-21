"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Cancel,
  Delete,
  Edit,
  FileDownload,
  FileUpload,
  Refresh,
  Search,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import PageContainer from "../../components/container/PageContainer";
import Loading from "../../loading";
import QuestionTypeSelector from "../../components/questionTypeSelector";
import {
  SubjectWithChaptersType,
  getUniqueSubjects,
  getChaptersBySubject,
} from "@/lib/getSubjectWiseChapter";
import { getCurrentUser } from "@/lib/getCurrentUser";
import RenderMath from "@/lib/renderMaths";

export interface QuestionData {
  _id: string;
  questionType: "text" | "image";
  hint: { text: string | null; imgUrl: string | null };
  hintType: "text" | "image";
  optionType: "text" | "image";
  question: { text: string | null; imgUrl: string | null };
  options: { text: string | null; imgUrl: string | null }[];
  answer: "A" | "B" | "C" | "D";
  level: string;
  course: string;
  subject: string;
  chapter: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
}

type Filters = {
  search: string;
  course: string;
  subject: string;
  chapter: string;
  level: string;
  fromDate: string;
  toDate: string;
};

const initialFilters: Filters = {
  search: "",
  course: "",
  subject: "",
  chapter: "",
  level: "",
  fromDate: "",
  toDate: "",
};

export default function ManageQuestionBank() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [page, setPage] = useState(0); // MUI pages are zero-based
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [subjectWithChapters, setSubjectWithChapters] = useState<
    SubjectWithChaptersType[]
  >([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [user, setUser] = useState<{ _id: string }>({ _id: "" });
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
    setSelectedQuestions([]);
  };

  const queryFor = useCallback(
    (targetPage: number, limit: number) => {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(limit),
        search: filters.search.trim(),
        course: filters.course,
        subject: filters.subject,
        chapter: filters.chapter,
        level: filters.level,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
      return params.toString();
    },
    [filters]
  );

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser();
        if (!alive) return;
        if (data?.success && data.user) {
          setUser({ _id: data.user._id });
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        if (alive) router.push("/login");
      } finally {
        if (alive) setAuthLoading(false);
      }
    }

    loadUser();
    return () => {
      alive = false;
    };
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSubjectChapters() {
      try {
        const res = await fetch("/api/Fetch-SubjectWithChapters", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load subjects.");
        const json = await res.json();
        if (json.success) {
          setSubjectWithChapters(json.data || []);
          setSubjects(getUniqueSubjects(json.data || []));
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          console.error(err);
        }
      }
    }

    loadSubjectChapters();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setChapters(
      filters.subject
        ? getChaptersBySubject(subjectWithChapters, filters.subject)
        : []
    );

    // If selected subject changes, an old chapter may no longer be valid.
    if (
      filters.chapter &&
      !getChaptersBySubject(subjectWithChapters, filters.subject).includes(
        filters.chapter
      )
    ) {
      setFilters((prev) => ({ ...prev, chapter: "" }));
      setPage(0);
    }
  }, [filters.subject, subjectWithChapters]); // chapter is intentionally handled above

  useEffect(() => {
    const controller = new AbortController();
    // Debounce search only; filter/page changes still use the same safe request.
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/Fetch-QuestionBank?${queryFor(page + 1, rowsPerPage)}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Could not load questions.");
        }

        setQuestions(data.questions || []);
        setTotalQuestions(data.pagination?.total ?? 0);
        setSelectedQuestions((previous) =>
          previous.filter((id) =>
            (data.questions || []).some((q: QuestionData) => q._id === id)
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Question fetch failed:", err);
        setError(
          err instanceof Error ? err.message : "Could not load questions."
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, filters.search.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryFor, page, rowsPerPage, refreshKey]);

  const selectedOnPage = useMemo(
    () => questions.filter((q) => selectedQuestions.includes(q._id)),
    [questions, selectedQuestions]
  );

  const allPageSelected =
    questions.length > 0 &&
    questions.every((q) => selectedQuestions.includes(q._id));

  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(0);
    setSelectedQuestions([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const res = await fetch(`/api/Delete-Question/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to delete question.");

      setSelectedQuestions((prev) => prev.filter((selected) => selected !== id));
      if (questions.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      window.alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedQuestions.length) return;
    if (
      !window.confirm(
        `Delete ${selectedQuestions.length} selected question(s)? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/Bulk-Delete-Questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedQuestions }),
      });
      if (!res.ok) throw new Error("Failed to delete selected questions.");

      setSelectedQuestions([]);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      window.alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error("The Excel file has no worksheet.");

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheet],
        { defval: "" }
      );

      if (!jsonData.length) throw new Error("No rows found in the Excel file.");

      const res = await fetch("/api/Import-Questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: jsonData, userId: user._id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to import questions.");
      }

      window.alert("Questions imported successfully.");
      setPage(0);
      setFilters(initialFilters);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      window.alert(
        err instanceof Error ? err.message : "Failed to import questions."
      );
    } finally {
      event.target.value = "";
    }
  };

  // Export every matching result, not just the currently visible page.
  const handleDownloadExcel = async () => {
    setIsExporting(true);
    try {
      const firstResponse = await fetch(
        `/api/Fetch-QuestionBank?${queryFor(1, 100)}`,
        { cache: "no-store" }
      );
      const firstData = await firstResponse.json();
      if (!firstResponse.ok || !firstData.success) {
        throw new Error(firstData.error || "Could not export questions.");
      }

      const allQuestions: QuestionData[] = [...(firstData.questions || [])];
      const totalPages = firstData.pagination?.totalPages || 0;

      // Fetch remaining pages in sequential chunks to avoid huge requests.
      for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
        const res = await fetch(
          `/api/Fetch-QuestionBank?${queryFor(currentPage, 100)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Export failed on page ${currentPage}.`);
        }
        allQuestions.push(...(data.questions || []));
      }

      const exportData = allQuestions.map((q) => ({
        question: q.question?.text ?? "",
        questionImage: q.question?.imgUrl ?? "",
        optionA: q.options?.[0]?.text ?? "",
        optionB: q.options?.[1]?.text ?? "",
        optionC: q.options?.[2]?.text ?? "",
        optionD: q.options?.[3]?.text ?? "",
        hint: q.hint?.text ?? "",
        hintImage: q.hint?.imgUrl ?? "",
        answer: q.answer ?? "",
        level: q.level ?? "",
        course: q.course ?? "",
        subject: q.subject ?? "",
        chapter: q.chapter ?? "",
        uploadedBy: q.uploadedBy ?? "",
        createdAt: q.createdAt ? q.createdAt.split("T")[0] : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
      XLSX.writeFile(workbook, "QuestionBank.xlsx");
    } catch (err) {
      console.error(err);
      window.alert(
        err instanceof Error ? err.message : "Failed to export questions."
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) return <Loading />;

  return (
    <PageContainer
      title="Manage Question Bank"
      description="Search, filter and manage academy questions"
    >
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={750}>
              Manage Question Bank
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Search and manage questions without loading the entire bank.
            </Typography>
          </Box>
          <Chip
            icon={<FileDownload />}
            label={`${totalQuestions.toLocaleString()} questions`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Filters
          </Typography>

          <QuestionTypeSelector
            onLevelChange={(value: string) => setFilter("level", value)}
            onCourseChange={(value: string) => setFilter("course", value)}
            onSubjectChange={(value: string) => setFilter("subject", value)}
            onChapterChange={(value: string) => setFilter("chapter", value)}
            title={null}
            isSubmitted={false}
          />

          <Grid container spacing={1.5} sx={{ mt: 0.5 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search questions, options, hints..."
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From date"
                value={filters.fromDate}
                onChange={(event) => setFilter("fromDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: filters.toDate || undefined }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To date"
                value={filters.toDate}
                onChange={(event) => setFilter("toDate", event.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: filters.fromDate || undefined }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md="auto">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Cancel />}
                onClick={clearFilters}
                disabled={Object.values(filters).every((value) => !value)}
              >
                Clear filters
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md="auto">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setRefreshKey((prev) => prev + 1)}
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md="auto">
              <Button
                fullWidth
                variant="contained"
                component="label"
                startIcon={<FileUpload />}
              >
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  hidden
                  onChange={handleExcelUpload}
                />
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md="auto">
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={
                  isExporting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <FileDownload />
                  )
                }
                disabled={isExporting || totalQuestions === 0}
                onClick={handleDownloadExcel}
              >
                {isExporting ? "Exporting..." : "Export Excel"}
              </Button>
            </Grid>
            {selectedQuestions.length > 0 && (
              <Grid item xs={12} md="auto">
                <Button
                  fullWidth
                  color="error"
                  variant="contained"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                >
                  Delete selected ({selectedQuestions.length})
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setRefreshKey((prev) => prev + 1)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography fontWeight={700}>Questions</Typography>
            <Typography variant="body2" color="text.secondary">
              {totalQuestions
                ? `${(page * rowsPerPage + 1).toLocaleString()}–${Math.min(
                    (page + 1) * rowsPerPage,
                    totalQuestions
                  ).toLocaleString()} of ${totalQuestions.toLocaleString()}`
                : "No questions found"}
            </Typography>
          </Box>

          <TableContainer sx={{ maxHeight: "65vh", overflow: "auto" }}>
            <Table stickyHeader size="small" sx={{ minWidth: 1450 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: "#f3f4f6" }}>
                    <Checkbox
                      size="small"
                      checked={allPageSelected}
                      indeterminate={
                        selectedOnPage.length > 0 && !allPageSelected
                      }
                      onChange={(event) => {
                       if (event.target.checked) {
  setSelectedQuestions((prev) =>
    Array.from(
      new Set([
        ...prev,
        ...questions.map((question) => question._id),
      ])
    )
  );

                        } else {
                          const currentIds = new Set(
                            questions.map((question) => question._id)
                          );
                          setSelectedQuestions((prev) =>
                            prev.filter((id) => !currentIds.has(id))
                          );
                        }
                      }}
                    />
                  </TableCell>
                  {[
                    "Subject",
                    "Chapter",
                    "Question",
                    "Options",
                    "Answer",
                    "Hint",
                    "Uploaded By / Date",
                    "Course",
                    "Level",
                    "Actions",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        bgcolor: "#f3f4f6",
                        fontWeight: 750,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 7 }}>
                      <CircularProgress size={28} />
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Loading questions...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 7 }}>
                      <Typography fontWeight={650}>
                        No questions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try changing your search or filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((q, index) => (
                    <TableRow
                      key={q._id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                        verticalAlign: "top",
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedQuestions.includes(q._id)}
                          onChange={(event) => {
                            setSelectedQuestions((prev) =>
                              event.target.checked
                                ? Array.from(new Set([...prev, q._id]))
                                : prev.filter((id) => id !== q._id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>{q.subject || "—"}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        {q.chapter || "—"}
                      </TableCell>
                      <TableCell sx={{ minWidth: 240, maxWidth: 360 }}>
                        {q.questionType === "image" && q.question?.imgUrl ? (
                          <Box
                            component="img"
                            src={q.question.imgUrl}
                            alt="Question"
                            loading="lazy"
                            sx={{
                              display: "block",
                              maxWidth: 220,
                              maxHeight: 180,
                              objectFit: "contain",
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Box sx={{ overflowWrap: "anywhere" }}>
                            <RenderMath text={q.question?.text || "—"} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 220, maxWidth: 320 }}>
                        <Stack spacing={1}>
                          {(q.options || []).map((option, optionIndex) => (
                            <Box
                              key={optionIndex}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 0.75,
                                overflowWrap: "anywhere",
                              }}
                            >
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{ pt: 0.25 }}
                              >
                                {String.fromCharCode(65 + optionIndex)}.
                              </Typography>
                              {q.optionType === "image" && option.imgUrl ? (
                                <Box
                                  component="img"
                                  src={option.imgUrl}
                                  alt={`Option ${optionIndex + 1}`}
                                  loading="lazy"
                                  sx={{
                                    maxWidth: 90,
                                    maxHeight: 75,
                                    objectFit: "contain",
                                  }}
                                />
                              ) : (
                                <Box sx={{ minWidth: 0 }}>
                                  <RenderMath text={option.text || "—"} />
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color="success"
                          label={q.answer || "—"}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180, maxWidth: 260 }}>
                        {q.hintType === "image" && q.hint?.imgUrl ? (
                          <Box
                            component="img"
                            src={q.hint.imgUrl}
                            alt="Hint"
                            loading="lazy"
                            sx={{
                              maxWidth: 180,
                              maxHeight: 140,
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box sx={{ overflowWrap: "anywhere" }}>
                            <RenderMath text={q.hint?.text || "—"} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2">
                          {q.uploadedBy || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.createdAt ? q.createdAt.split("T")[0] : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{q.course || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={q.level || "—"}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            aria-label="Edit question"
                            size="small"
                            color="primary"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/edit-question/${q._id}`
                              )
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label="Delete question"
                            size="small"
                            color="error"
                            onClick={() => handleDelete(q._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalQuestions}
            page={page}
            onPageChange={(_, nextPage) => {
              setPage(nextPage);
              setSelectedQuestions([]);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
              setSelectedQuestions([]);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            showFirstButton
            showLastButton
          />
        </Paper>
      </Box>
    </PageContainer>
  );
}
