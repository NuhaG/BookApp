import React, { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import Loader from "../components/Loader";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { resolveCoverImageSrc } from "../utils/images";
import { getToken } from "../utils/session";
import { GENRES } from "../utils/genres";
import NavBar from "../components/NavBar";
import MarkdownRenderer from "../components/MarkdownRenderer";

const EditBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [description, setDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [genre, setGenre] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterSaving, setChapterSaving] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState("");
  const [chapterTab, setChapterTab] = useState("write");
  const [loading, setLoading] = useState(false);
  const chapterContentRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((res) => {
        setAuthor(res.data.book.author);
        setTitle(res.data.book.title);
        setPublishedYear(res.data.book.publishedYear);
        setDescription(res.data.book.description || "");
        setCoverImg(res.data.book.coverImg || "");
        setGenre(Array.isArray(res.data.book.genre) ? res.data.book.genre : []);
        setChapters(Array.isArray(res.data.book.chapters) ? res.data.book.chapters : []);
      })
      .catch((err) => {
        console.log(err);
        alert(getApiErrorMessage(err, "An error occurred while loading the book."));
      })
      .finally(() => setLoading(false));
  }, [id, location.pathname, navigate]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const previewSrc = useMemo(() => {
    if (coverFile && coverPreview) {
      return coverPreview;
    }
    return resolveCoverImageSrc(coverImg);
  }, [coverFile, coverImg, coverPreview]);

  const sortedChapters = useMemo(
    () => chapters.slice().sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)),
    [chapters],
  );
  const publishedChapters = useMemo(
    () => sortedChapters.filter((chapter) => chapter.isPublished),
    [sortedChapters],
  );
  const draftChapters = useMemo(
    () => sortedChapters.filter((chapter) => !chapter.isPublished),
    [sortedChapters],
  );

  const resetChapterForm = () => {
    setChapterTitle("");
    setChapterNumber("");
    setChapterContent("");
    setEditingChapterId("");
    setChapterTab("write");
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      return;
    }

    setCoverFile(null);
    setCoverPreview("");
  };

  const handleEditBook = () => {
    if (!getToken()) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    const year = Number(publishedYear);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("publishedYear", Number.isNaN(year) ? publishedYear : String(year));
    formData.append("description", description);
    formData.append("coverImg", coverImg.trim());
    formData.append("genre", JSON.stringify(genre));
    if (coverFile) {
      formData.set("coverImg", coverFile);
    }

    setLoading(true);
    api
      .patch(`/books/${id}`, formData)
      .then(() => {
        alert("Book updated successfully.");
      })
      .catch((err) => {
        alert(getApiErrorMessage(err, "An error occurred while saving the book."));
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const saveChapter = async (isPublished) => {
    if (!getToken()) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    const numberValue = Number(chapterNumber);
    const payload = {
      title: chapterTitle,
      content: chapterContent,
      chapterNumber: Number.isNaN(numberValue) ? chapterNumber : numberValue,
      isPublished,
    };

    setChapterSaving(true);
    try {
      const res = editingChapterId
        ? await api.patch(`/books/${id}/chapters/${editingChapterId}`, payload)
        : await api.post(`/books/${id}/chapters`, payload);

      const nextChapters = Array.isArray(res.data?.book?.chapters) ? res.data.book.chapters : [];
      setChapters(nextChapters);
      resetChapterForm();
    } catch (err) {
      alert(getApiErrorMessage(err, isPublished ? "Failed to publish chapter." : "Failed to save draft."));
    } finally {
      setChapterSaving(false);
    }
  };

  const startEditingChapter = (chapter) => {
    setEditingChapterId(chapter._id);
    setChapterNumber(String(chapter.chapterNumber ?? ""));
    setChapterTitle(chapter.title || "");
    setChapterContent(chapter.content || "");
    setChapterTab("write");
  };

  const applyMarkdown = ({ prefix = "", suffix = "", placeholder = "", linePrefix = "" }) => {
    const textarea = chapterContentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = chapterContent || "";
    const selected = value.slice(start, end);

    if (linePrefix) {
      const selectedBlock = selected || placeholder || "text";
      const lineMapped = selectedBlock
        .split("\n")
        .map((line) => `${linePrefix}${line}`)
        .join("\n");

      const nextValue = `${value.slice(0, start)}${lineMapped}${value.slice(end)}`;
      setChapterContent(nextValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + lineMapped.length);
      }, 0);
      return;
    }

    const insert = `${prefix}${selected || placeholder}${suffix}`;
    const nextValue = `${value.slice(0, start)}${insert}${value.slice(end)}`;
    setChapterContent(nextValue);
    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      } else {
        const cursor = start + insert.length;
        textarea.setSelectionRange(cursor, cursor);
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        <div className="m-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Edit Book</h1>
        </div>

        {loading ? (
          <div className="mb-4 flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto max-w-5xl rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <label className="text-sm text-[var(--text-soft)]">
                  Title
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Author
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Published Year
                  <input
                    type="text"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Description (optional)
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Upload new cover image (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[var(--text-soft)]">Max file size: 5MB.</p>
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Or paste cover image URL (optional)
                  <input
                    type="text"
                    value={coverImg}
                    onChange={(e) => setCoverImg(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="https://..."
                  />
                </label>

                {previewSrc ? (
                  <div>
                    <p className="mb-2 text-sm text-[var(--text-soft)]">Cover preview</p>
                    <img
                      src={previewSrc}
                      alt="Cover preview"
                      className="h-44 w-32 rounded-md border border-[var(--line)] object-cover"
                    />
                  </div>
                ) : null}

                <label className="text-sm text-[var(--text-soft)]">
                  Genres (optional)
                  <select
                    multiple
                    value={genre}
                    onChange={(e) => setGenre(Array.from(e.target.selectedOptions).map((o) => o.value))}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--text-soft)]">Hold Ctrl/Cmd to select multiple.</p>
                </label>

                <button
                  onClick={handleEditBook}
                  className="rounded-md bg-[var(--accent)] py-2 font-semibold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Save Book Changes
                </button>
              </div>

              <div className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                <h2 className="mb-1 text-lg font-semibold text-[var(--text-main)]">
                  {editingChapterId ? "Edit Chapter" : "Write Chapter"}
                </h2>

                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setChapterTab("write")}
                    className={`rounded-md border px-3 py-1 text-xs ${chapterTab === "write"
                      ? "border-[var(--accent)] bg-[var(--bg-chip)] text-[var(--text-brand)]"
                      : "border-[var(--line)] text-[var(--text-soft)]"
                      }`}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => setChapterTab("preview")}
                    className={`rounded-md border px-3 py-1 text-xs ${chapterTab === "preview"
                      ? "border-[var(--accent)] bg-[var(--bg-chip)] text-[var(--text-brand)]"
                      : "border-[var(--line)] text-[var(--text-soft)]"
                      }`}
                  >
                    Preview
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm text-[var(--text-soft)]">
                    Chapter Number
                    <input
                      type="number"
                      min="1"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </label>

                  <label className="text-sm text-[var(--text-soft)]">
                    Chapter Title
                    <input
                      type="text"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </label>

                  {chapterTab === "write" ? (
                    <label className="text-sm text-[var(--text-soft)]">
                      Chapter Content
                      <div className="mt-1 rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ prefix: "**", suffix: "**", placeholder: "bold text" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Bold
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ prefix: "*", suffix: "*", placeholder: "italic text" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Italic
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ linePrefix: "# ", placeholder: "Heading" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ linePrefix: "## ", placeholder: "Subheading" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ linePrefix: "- ", placeholder: "List item" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Bullet
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ linePrefix: "1. ", placeholder: "List item" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Numbered
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ linePrefix: "> ", placeholder: "Quote" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Quote
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ prefix: "`", suffix: "`", placeholder: "inline code" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Code
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              applyMarkdown({
                                prefix: "[",
                                suffix: "](https://example.com)",
                                placeholder: "link text",
                              })
                            }
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Link
                          </button>
                          <button
                            type="button"
                            onClick={() => applyMarkdown({ prefix: "\n---\n", suffix: "", placeholder: "" })}
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Divider
                          </button>
                        </div>
                      </div>
                      <textarea
                        ref={chapterContentRef}
                        value={chapterContent}
                        onChange={(e) => setChapterContent(e.target.value)}
                        rows={10}
                        className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Start writing your chapter..."
                      />
                    </label>
                  ) : (
                    <div className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-3">
                      {chapterContent.trim() ? (
                        <MarkdownRenderer content={chapterContent} />
                      ) : (
                        <p className="text-sm text-[var(--text-soft)]">Preview will appear here.</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button
                      onClick={() => saveChapter(false)}
                      disabled={chapterSaving}
                      className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] py-2 text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--bg-hover)] disabled:opacity-60"
                    >
                      {chapterSaving ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      onClick={() => saveChapter(true)}
                      disabled={chapterSaving}
                      className="rounded-md bg-[var(--accent)] py-2 text-sm font-semibold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                    >
                      {chapterSaving ? "Publishing..." : "Publish Chapter"}
                    </button>
                    <button
                      onClick={resetChapterForm}
                      disabled={chapterSaving}
                      className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] py-2 text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--bg-hover)] disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                <h3 className="mb-3 text-md font-semibold text-[var(--text-main)]">
                  Draft Chapters ({draftChapters.length})
                </h3>
                {draftChapters.length === 0 ? (
                  <p className="text-sm text-[var(--text-soft)]">No draft chapters yet.</p>
                ) : (
                  <div className="space-y-2">
                    {draftChapters.map((chapter) => (
                      <div key={chapter._id} className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-3">
                        <p className="font-semibold text-[var(--text-strong)]">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => startEditingChapter(chapter)}
                            className="rounded-md border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              setChapterSaving(true);
                              try {
                                const res = await api.patch(`/books/${id}/chapters/${chapter._id}`, {
                                  isPublished: true,
                                });
                                const nextChapters = Array.isArray(res.data?.book?.chapters)
                                  ? res.data.book.chapters
                                  : [];
                                setChapters(nextChapters);
                              } catch (err) {
                                alert(getApiErrorMessage(err, "Failed to publish draft."));
                              } finally {
                                setChapterSaving(false);
                              }
                            }}
                            className="rounded-md bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                          >
                            Publish
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                <h3 className="mb-3 text-md font-semibold text-[var(--text-main)]">
                  Published Chapters ({publishedChapters.length})
                </h3>
                {publishedChapters.length === 0 ? (
                  <p className="text-sm text-[var(--text-soft)]">No published chapters yet.</p>
                ) : (
                  <div className="space-y-2">
                    {publishedChapters.map((chapter) => (
                      <div key={chapter._id} className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-3">
                        <p className="font-semibold text-[var(--text-strong)]">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </p>
                        <div className="mt-2">
                          <button
                            onClick={() => startEditingChapter(chapter)}
                            className="rounded-md border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 mt-4">
              <BackButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBook;
