import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { api } from "../api/client";
import { resolveCoverImageSrc } from "../utils/images";
import { getToken } from "../utils/session";

const Landing = () => {
  const token = getToken();
  const year = new Date().getFullYear();
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTrending(true);

    api
      .get("/books/trending", { signal: controller.signal })
      .then((res) => setTrending(res.data?.data?.trending || []))
      .catch((err) => {
        if (err?.code === "ERR_CANCELED") return;
        console.log(err);
        setTrending([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingTrending(false);
        }
      });

    return () => controller.abort();
  }, []);

  const visibleTrending = useMemo(() => {
    return trending
      .map((entry) => {
        const details = Array.isArray(entry.bookDetails) ? entry.bookDetails[0] : null;
        return { entry, details };
      })
      .filter(({ details }) => Boolean(details?._id && details?.title))
      .slice(0, 6);
  }, [trending]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <section className="relative overflow-hidden border-b border-[var(--line)]">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2200&q=80"
            alt="Library discussion hero"
            className="h-[340px] w-full object-cover brightness-[0.72] md:h-[460px]"
          />
          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
          <div className="absolute inset-0 bg-[var(--hero-focus-overlay)]" />
          <div className="absolute inset-0 bg-[var(--overlay-dim)]" />

          <div className="absolute inset-0 flex items-center px-5 md:px-8">
            <div className="max-w-4xl">
              <p className="inline-block rounded-full border border-[var(--line)] bg-[var(--bg-muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--text-link)]">
                BookVerse
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[var(--text-inverse)] [text-shadow:var(--hero-text-shadow)] md:text-6xl">
                Discover Great Books. Publish Yours Chapter by Chapter.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[var(--text-hero-subtle)] [text-shadow:var(--hero-text-shadow)] md:text-base">
                BookVerse helps readers discover titles and helps authors publish, update, and grow through reviews and ratings.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/explore"
                  className="rounded-md bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                >
                  Explore Books
                </Link>
                <Link
                  to={token ? "/books/create" : "/register"}
                  className="rounded-md border border-[var(--line-bright)] px-5 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--overlay-white-soft)]"
                >
                  {token ? "Start Publishing" : "Join BookVerse"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <main className="px-5 py-8 md:px-8 md:py-10">
          <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-link)]">For Readers</p>
              <h3 className="mt-2 text-xl font-bold text-[var(--text-main)]">Clean Reading Experience</h3>
              <p className="mt-2 text-sm text-[var(--text-soft)]">Browse books, open details fast, and read chapters in a focused modal view.</p>
            </article>
            <article className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-link)]">For Authors</p>
              <h3 className="mt-2 text-xl font-bold text-[var(--text-main)]">Chapter Publishing Workflow</h3>
              <p className="mt-2 text-sm text-[var(--text-soft)]">Create a book once, then publish and manage chapters from your edit flow.</p>
            </article>
            <article className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-link)]">Growth</p>
              <h3 className="mt-2 text-xl font-bold text-[var(--text-main)]">Ratings and Reviews</h3>
              <p className="mt-2 text-sm text-[var(--text-soft)]">Track reception over time and surface books that readers value most.</p>
            </article>
          </section>

          <section className="rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-[var(--text-main)]">Trending Books</h2>
                <p className="text-sm text-[var(--text-soft)]">Books with the highest recent review activity</p>
              </div>
              <Link to="/explore" className="text-sm font-semibold text-[var(--text-link)] hover:underline">
                View all
              </Link>
            </div>

            {loadingTrending ? (
              <Loader />
            ) : visibleTrending.length === 0 ? (
              <p className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-soft)]">
                No trending books yet. Add books and reviews to get this section moving.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTrending.map(({ entry, details }) => {
                  const avg = typeof entry.averageRating === "number" ? entry.averageRating.toFixed(1) : "0.0";
                  return (
                    <article
                      key={String(details._id)}
                      className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex gap-3">
                        <img
                          src={resolveCoverImageSrc(details.coverImg)}
                          alt={details.title}
                          className="h-24 w-16 rounded-md border border-[var(--line)] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--text-strong)]">{details.title}</p>
                          <p className="truncate text-xs text-[var(--text-soft)]">by {details.author}</p>
                          <p className="mt-2 text-xs text-[var(--rating)]">
                            {avg} average rating
                            <span className="ml-1 text-[var(--text-soft)]">({entry.reviewCount ?? 0} reviews)</span>
                          </p>
                          <Link
                            to={`/books/details/${details._id}`}
                            className="mt-2 inline-block text-xs font-semibold text-[var(--text-link)] hover:underline"
                          >
                            Open details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-6">
              <h3 className="text-2xl font-black text-[var(--text-main)]">Reader Experience</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-soft)]">
                <li>Explore books with search, sort, and genre-driven discovery</li>
                <li>Read chapter content in a focused overlay without leaving details</li>
                <li>View ratings and review summaries before jumping in</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-6">
              <h3 className="text-2xl font-black text-[var(--text-main)]">Publishing Flow</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-soft)]">
                <li>Create a book shell and set genre + cover</li>
                <li>Release chapters in sequence from edit page</li>
                <li>Track ratings and review response over time</li>
              </ul>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--line)] bg-[var(--bg-shell)] px-5 py-4 text-center text-xs font-semibold tracking-wide text-[var(--text-soft)] md:px-8">
          BookVerse @ {year}
        </footer>
      </div>
    </div>
  );
};

export default Landing;


