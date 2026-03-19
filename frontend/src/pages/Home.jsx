import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { api } from '../api/client';
import { resolveCoverImageSrc } from '../utils/images';
import { GENRES } from '../utils/genres';
import NavBar from '../components/NavBar';

const renderStars = (rating) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  const rounded = Math.round(safe);
  return '*****'.slice(0, rounded) + '-----'.slice(0, 5 - rounded);
};

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [sort, setSort] = useState('-createdAt');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const queryParams = useMemo(() => {
    const params = { sort, page, limit };
    if (genre) {
      params.genre = genre;
    }
    return params;
  }, [genre, limit, page, sort]);

  const selectedBook = useMemo(() => {
    if (!books.length) return null;
    return books.find((b) => String(b._id) === String(selectedBookId)) || books[0];
  }, [books, selectedBookId]);

  const visibleBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => {
      const title = String(b.title || '').toLowerCase();
      const author = String(b.author || '').toLowerCase();
      return title.includes(q) || author.includes(q);
    });
  }, [books, search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .get('/books', { params: queryParams, signal: controller.signal })
      .then((response) => {
        const nextBooks = response.data?.data?.books || [];
        const nextPagination = response.data?.pagination;
        setBooks(nextBooks);
        if (nextPagination) {
          setPagination(nextPagination);
        }
        if (nextBooks.length > 0) {
          setSelectedBookId((current) => {
            if (current && nextBooks.some((book) => String(book._id) === String(current))) {
              return current;
            }
            return String(nextBooks[0]._id);
          });
        } else {
          setSelectedBookId('');
        }
      })
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        console.log(err);
        setBooks([]);
        setSelectedBookId('');
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [queryParams]);

  useEffect(() => {
    const controller = new AbortController();
    setTrendingLoading(true);

    api
      .get('/books/trending', { signal: controller.signal })
      .then((res) => setTrending(res.data?.data?.trending || []))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        console.log(err);
        setTrending([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setTrendingLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  const visibleTrending = useMemo(() => {
    return trending.filter((entry) => {
      const details = Array.isArray(entry.bookDetails) ? entry.bookDetails[0] : null;
      return Boolean(details?._id && details?.title);
    });
  }, [trending]);

  useEffect(() => {
    if (!selectedBook?._id) {
      setReviews([]);
      setReviewsLoading(false);
      return;
    }

    const controller = new AbortController();
    setReviewsLoading(true);
    api
      .get(`/books/${selectedBook._id}/reviews`, { signal: controller.signal })
      .then((res) => setReviews(res.data?.data?.reviews || []))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        console.log(err);
        setReviews([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedBook?._id]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[0_8px_26px_rgba(0,0,0,0.35)]">
        <NavBar />

        <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-[1.25fr_1fr] lg:gap-0 lg:p-0">
          <section className="rounded-md border border-[var(--line)] bg-[var(--panel-bg)] p-4 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r">
            <div className="mb-3 border-b border-[var(--line)] pb-3">
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Explore Books</h1>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-md border border-[var(--line)] bg-[#0b1220] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                  placeholder="Search title/author"
                />

                <select
                  value={limit}
                  onChange={(e) => {
                    setPage(1);
                    setLimit(Number(e.target.value));
                  }}
                  className="rounded-md border border-[var(--line)] bg-[#0b1220] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
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
                  className="rounded-md border border-[var(--line)] bg-[#0b1220] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
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
                  className="rounded-md border border-[var(--line)] bg-[#0b1220] px-3 py-1.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
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
                  const isActive = String(selectedBook?._id) === String(book._id);
                  const ratingText = typeof book.ratingsAverage === 'number' ? book.ratingsAverage.toFixed(1) : '0.0';
                  return (
                    <button
                      key={book._id}
                      type="button"
                      onClick={() => setSelectedBookId(String(book._id))}
                      className={`rounded-md border bg-[var(--card-bg)] p-2 text-left shadow-sm transition hover:shadow-md ${
                        isActive ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/20' : 'border-[var(--line)]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-[#0b1220]">
                          {book.coverImg ? (
                            <img
                              src={resolveCoverImageSrc(book.coverImg)}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-lg font-bold text-[#dbeafe]">{book.title}</h2>
                          <p className="truncate text-sm text-[var(--text-soft)]">by {book.author}</p>
                          <p className="mt-1 text-xs font-semibold text-yellow-400">
                            {renderStars(book.ratingsAverage)}
                            <span className="ml-1 text-[var(--text-soft)]">{ratingText} ({book.ratingsQuantity ?? 0} reviews)</span>
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-soft)]">
                            {book.description || 'No description available for this book yet.'}
                          </p>
                          <span className="mt-2 inline-block rounded bg-[#16243b] px-2 py-1 text-xs font-semibold text-[#cfe3ff]">
                            View Details
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="rounded border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[#16243b] disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="rounded border border-[var(--line)] px-3 py-1 text-xs text-[var(--text-soft)] hover:bg-[#16243b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </section>

          <aside className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 lg:rounded-none lg:border-0 lg:border-l lg:border-[var(--line)]">
            {selectedBook ? (
              <>
                <div className="rounded-md border border-[var(--line)] bg-[#0e182a] p-3">
                  <div className="flex gap-3">
                    <div className="h-36 w-24 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-[#0b1220]">
                      {selectedBook.coverImg ? (
                        <img
                          src={resolveCoverImageSrc(selectedBook.coverImg)}
                          alt={selectedBook.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-3xl font-bold text-[#dbeafe]">{selectedBook.title}</h2>
                      <p className="text-base text-[var(--text-soft)]">by {selectedBook.author}</p>
                      <p className="mt-1 text-sm font-semibold text-yellow-400">
                        {renderStars(selectedBook.ratingsAverage)}
                        <span className="ml-1 text-[var(--text-soft)]">
                          {typeof selectedBook.ratingsAverage === 'number' ? selectedBook.ratingsAverage.toFixed(1) : '0.0'}
                          {' '}({selectedBook.ratingsQuantity ?? 0} reviews)
                        </span>
                      </p>
                      <p className="mt-3 text-sm text-[var(--text-soft)]">
                        {selectedBook.description || 'A compelling title waiting for your next review.'}
                      </p>
                      <Link
                        to={`/books/details/${selectedBook._id}`}
                        className="mt-3 inline-block rounded bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Open Full Details
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="border-b border-[var(--line)] pb-2 text-lg font-bold text-[#dbeafe]">Reviews</h3>
                  {reviewsLoading ? (
                    <div className="py-4">
                      <Loader />
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--text-soft)]">No reviews yet.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {reviews.slice(0, 4).map((r) => {
                        const userLabel = r?.user?.name || r?.user?.email || 'Reader';
                        return (
                          <div key={r._id} className="rounded-md border border-[var(--line)] bg-[#0d1627] p-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16243b] text-xs font-bold text-[#9ec5ff]">
                                {String(userLabel).slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#dbeafe]">{userLabel}</p>
                                <p className="text-xs text-yellow-400">{renderStars(r.rating)}</p>
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-[var(--text-soft)]">{r.review}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="border-b border-[var(--line)] pb-2 text-lg font-bold text-[#dbeafe]">Trending Books</h3>
                  {trendingLoading ? (
                    <div className="py-4">
                      <Loader />
                    </div>
                  ) : visibleTrending.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--text-soft)]">No trending books right now.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {visibleTrending.slice(0, 5).map((entry) => {
                        const details = Array.isArray(entry.bookDetails) ? entry.bookDetails[0] : null;
                        const bookId = details?._id || entry._id;
                        const title = details?.title || 'Untitled';
                        const author = details?.author || 'Unknown author';
                        const avg = typeof entry.averageRating === 'number' ? entry.averageRating.toFixed(1) : '0.0';
                        const count = entry.reviewCount ?? 0;

                        return (
                          <div key={String(bookId)} className="rounded-md border border-[var(--line)] bg-[#0d1627] p-2">
                            <div className="flex gap-3">
                              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-[#0b1220]">
                                {details?.coverImg ? (
                                  <img
                                    src={resolveCoverImageSrc(details.coverImg)}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[#dbeafe]">{title}</p>
                                <p className="truncate text-xs text-[var(--text-soft)]">by {author}</p>
                                <p className="mt-1 text-xs text-yellow-400">
                                  {renderStars(entry.averageRating)} {avg} ({count} reviews)
                                </p>
                                {bookId ? (
                                  <Link
                                    to={`/books/details/${bookId}`}
                                    className="mt-1 inline-block text-xs font-semibold text-[#9ec5ff] hover:underline"
                                  >
                                    Open Details
                                  </Link>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-soft)]">Select a book to preview details.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;

