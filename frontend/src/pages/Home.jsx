import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { api } from "../api/client";
import { resolveCoverImageSrc } from "../utils/images";
import { GENRES } from "../utils/genres";
import NavBar from "../components/NavBar";

const renderStars = (rating) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  const rounded = Math.round(safe);
  return "*****".slice(0, rounded) + "-----".slice(0, 5 - rounded);
};

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [sort, setSort] = useState("-createdAt");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const queryParams = useMemo(() => {
    const params = { sort, page, limit };
    if (genre) params.genre = genre;
    return params;
  }, [genre, limit, page, sort]);

  const visibleBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => {
      const title = String(b.title || "").toLowerCase();
      const author = String(b.author || "").toLowerCase();
      return title.includes(q) || author.includes(q);
    });
  }, [books, search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    api
      .get("/books", { params: queryParams, signal: controller.signal })
      .then((response) => {
        setBooks(response.data?.data?.books || []);
        const nextPagination = response.data?.pagination;
        if (nextPagination) setPagination(nextPagination);
      })
      .catch((err) => {
        if (err?.code === "ERR_CANCELED") return;
        console.log(err);
        setBooks([]);
        setPagination({
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [limit, queryParams]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        <section className="bg-[var(--panel-bg)] p-4">
          <div className="mb-3 border-b border-[var(--line)] pb-3">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Explore Books</h1>

            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                placeholder="Search title/author"
              />

              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
              </select>

              <select
                value={genre}
                onChange={(e) => {
                  setPage(1);
                  setGenre(e.target.value);
                }}
                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-publishedYear">Year Desc</option>
                <option value="publishedYear">Year Asc</option>
                <option value="title">Title A-Z</option>
                <option value="-ratingsAverage">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10">
              <Loader />
            </div>
          ) : visibleBooks.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--text-soft)]">No books found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleBooks.map((book) => {
                const ratingText = typeof book.ratingsAverage === "number" ? book.ratingsAverage.toFixed(1) : "0.0";
                return (
                  <Link
                    key={book._id}
                    to={`/books/details/${book._id}`}
                    className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-2 text-left shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex gap-3">
                      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-input)]">
                        {book.coverImg ? (
                          <img src={resolveCoverImageSrc(book.coverImg)} alt={book.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-bold text-[var(--text-strong)]">{book.title}</h2>
                        <p className="truncate text-sm text-[var(--text-soft)]">by {book.author}</p>
                        <p className="mt-1 text-xs font-semibold text-[var(--rating)]">
                          {renderStars(book.ratingsAverage)}
                          <span className="ml-1 text-[var(--text-soft)]">
                            {ratingText} ({book.ratingsQuantity ?? 0} reviews)
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-soft)]">
                          {book.description || "No description available for this book yet."}
                        </p>
                        <span className="mt-2 inline-block rounded bg-[var(--bg-chip)] px-2 py-1 text-xs font-semibold text-[var(--text-chip)]">
                          Open Details
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="rounded border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-chip)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-[var(--text-soft)]">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} books)
            </span>
            <button
              onClick={() => {
                if (pagination.hasNextPage) setPage((p) => p + 1);
              }}
              disabled={!pagination.hasNextPage}
              className="rounded border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--bg-chip)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


