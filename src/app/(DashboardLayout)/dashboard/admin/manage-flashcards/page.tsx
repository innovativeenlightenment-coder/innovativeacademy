
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FlashcardItem = {
  _id: string;
  question: string;
  answer: string;
  course?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  uploadedBy?: string;
  createdAt?: string;
};

type Filters = {
  course: string;
  subject: string;
  chapter: string;
};

const EMPTY_FILTERS: Filters = {
  course: "",
  subject: "",
  chapter: "",
};

export default function ManageFlashcardsPage() {
  const [items, setItems] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<FlashcardItem | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/manage-flashcards", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load flashcards.",
        );
      }

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.flashcards)
            ? data.flashcards
            : [];

      setItems(records);
      setSelectedIds((current) =>
        current.filter((id) => records.some((item: FlashcardItem) => item._id === id)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load flashcards.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const courses = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.course?.trim()).filter(Boolean)),
      ).sort(),
    [items],
  );

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.subject?.trim()).filter(Boolean)),
      ).sort(),
    [items],
  );

  const chapters = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.chapter?.trim()).filter(Boolean)),
      ).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.question,
          item.answer,
          item.course,
          item.subject,
          item.chapter,
          item.topic,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

      return (
        matchesSearch &&
        (!filters.course || item.course === filters.course) &&
        (!filters.subject || item.subject === filters.subject) &&
        (!filters.chapter || item.chapter === filters.chapter)
      );
    });
  }, [items, search, filters]);

  const visibleIds = useMemo(
    () => filteredItems.map((item) => item._id),
    [filteredItems],
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));

  const toggleOne = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS);
  };

  const startEditing = (item: FlashcardItem) => {
    setEditing(item);
    setEditQuestion(item.question ?? "");
    setEditAnswer(item.answer ?? "");
    setError("");
  };

  const saveEdit = async () => {
    if (!editing) return;

    if (!editQuestion.trim() || !editAnswer.trim()) {
      setError("Question and answer are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/manage-flashcards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing._id,
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update flashcard.",
        );
      }

      const updated = data.item ?? data.flashcard ?? data;

      setItems((current) =>
        current.map((item) =>
          item._id === editing._id
            ? {
                ...item,
                ...updated,
                question: updated.question ?? editQuestion.trim(),
                answer: updated.answer ?? editAnswer.trim(),
              }
            : item,
        ),
      );

      setEditing(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update flashcard.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItems = async (ids: string[]) => {
    if (!ids.length || saving) return;

    const message =
      ids.length === 1
        ? "Delete this flashcard? This action cannot be undone."
        : `Delete ${ids.length} selected flashcards? This action cannot be undone.`;

    if (!window.confirm(message)) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/manage-flashcards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids.length === 1 ? { id: ids[0] } : { ids }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete flashcards.",
        );
      }

      setItems((current) => current.filter((item) => !ids.includes(item._id)));
      setSelectedIds((current) =>
        current.filter((id) => !ids.includes(id)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete flashcards.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen space-y-4 bg-white p-4 text-gray-900 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Manage Flashcards
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Search, filter, edit, and manage your flashcards.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <p className="text-sm text-gray-600">
          {filteredItems.length} results
          {selectedIds.length > 0 && (
            <span className="ml-2 font-semibold text-violet-700">
              · {selectedIds.length} selected
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadItems()}
            disabled={loading || saving}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => void deleteItems(selectedIds)}
            disabled={!selectedIds.length || saving}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? "Please wait..." : `Delete selected (${selectedIds.length})`}
          </button>
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions, answers..."
            className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />

          <select
            value={filters.course}
            onChange={(event) => updateFilter("course", event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500"
          >
            <option value="">All courses</option>
            {courses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={filters.subject}
            onChange={(event) => updateFilter("subject", event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500"
          >
            <option value="">All subjects</option>
            {subjects.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={filters.chapter}
            onChange={(event) => updateFilter("chapter", event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500"
          >
            <option value="">All chapters</option>
            {chapters.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} flashcards
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear filters
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading flashcards...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-gray-800">No flashcards found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="w-12 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      disabled={!visibleIds.length}
                      aria-label="Select all visible flashcards"
                      className="h-4 w-4 cursor-pointer accent-violet-600"
                    />
                  </th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Answer</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Chapter</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className={`transition-colors hover:bg-violet-50 ${
                      selectedIds.includes(item._id)
                        ? "bg-violet-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="w-12 px-4 py-3 text-center align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleOne(item._id)}
                        aria-label={`Select flashcard: ${item.question}`}
                        className="mt-1 h-4 w-4 cursor-pointer accent-violet-600"
                      />
                    </td>

                    <td className="max-w-xs px-4 py-3 align-top">
                      <p className="whitespace-pre-wrap font-medium text-gray-900">
                        {item.question}
                      </p>
                    </td>

                    <td className="max-w-xs px-4 py-3 align-top">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {item.answer}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top text-gray-700">
                      {item.course || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {item.subject || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-700">
                      {item.chapter || "—"}
                    </td>

                    <td className="px-4 py-3 text-right align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          disabled={saving}
                          className="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteItems([item._id])}
                          disabled={saving}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setEditing(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="flashcard-edit-title"
            className="my-auto w-full max-w-2xl space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="flashcard-edit-title" className="text-lg font-bold">
                Edit flashcard
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                aria-label="Close edit dialog"
                className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="flashcard-question" className="text-sm font-semibold">
                Question
              </label>
              <textarea
                id="flashcard-question"
                rows={4}
                value={editQuestion}
                onChange={(event) => setEditQuestion(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="flashcard-answer" className="text-sm font-semibold">
                Answer
              </label>
              <textarea
                id="flashcard-answer"
                rows={5}
                value={editAnswer}
                onChange={(event) => setEditAnswer(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={saving}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
