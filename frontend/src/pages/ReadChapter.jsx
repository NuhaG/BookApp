import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Loader from "../components/Loader";
import BackButton from "../components/BackButton";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { api, getApiErrorMessage } from "../api/client";

const ReadChapter = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((response) => setBook(response.data?.book || null))
      .catch((err) => {
        console.log(err);
        alert(getApiErrorMessage(err, "Failed to load chapter."));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const publishedChapters = useMemo(() => {
    if (!Array.isArray(book?.chapters)) return [];
    return book.chapters
      .filter((chapter) => chapter?.isPublished)
      .slice()
      .sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber));
  }, [book]);

  const chapterIndex = useMemo(
    () => publishedChapters.findIndex((chapter) => String(chapter._id) === String(chapterId)),
    [chapterId, publishedChapters],
  );
  const current = chapterIndex >= 0 ? publishedChapters[chapterIndex] : null;
  const prevChapter = chapterIndex > 0 ? publishedChapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 && chapterIndex < publishedChapters.length - 1
    ? publishedChapters[chapterIndex + 1]
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        {loading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : !book || !current ? (
          <div className="p-6">
            <p className="text-[var(--text-soft)]">Chapter not found or not published.</p>
            <div className="mt-4">
              <BackButton />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl p-4 md:p-8">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-4 md:p-6">
              <p className="text-xs uppercase tracking-wider text-[var(--text-soft)]">
                {book.title}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--text-main)] md:text-3xl">
                Chapter {current.chapterNumber}: {current.title}
              </h1>

              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <MarkdownRenderer content={current.content} className="text-[1.06rem]" />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                <button
                  onClick={() => navigate(`/books/details/${id}`)}
                  className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                >
                  Back To Book
                </button>

                <div className="flex gap-2">
                  {prevChapter ? (
                    <Link
                      to={`/books/details/${id}/chapters/${prevChapter._id}`}
                      state={{ from: location.pathname }}
                      className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--text-soft)] hover:bg-[var(--bg-hover)]"
                    >
                      Previous
                    </Link>
                  ) : null}
                  {nextChapter ? (
                    <Link
                      to={`/books/details/${id}/chapters/${nextChapter._id}`}
                      state={{ from: location.pathname }}
                      className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                    >
                      Next
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadChapter;
