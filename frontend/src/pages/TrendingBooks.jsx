import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import NavBar from "../components/NavBar";
import { api } from "../api/client";
import { resolveCoverImageSrc } from "../utils/images";

const renderStars = (rating) => {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0));
  const rounded = Math.round(safe);
  return "*****".slice(0, rounded) + "-----".slice(0, 5 - rounded);
};

const TrendingBooks = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    api
      .get("/books/trending", { signal: controller.signal })
      .then((res) => setTrending(res.data?.data?.trending || []))
      .catch((err) => {
        if (err?.code === "ERR_CANCELED") return;
        console.log(err);
        setTrending([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const visibleTrending = useMemo(() => {
    return trending
      .map((entry) => {
        const details = Array.isArray(entry.bookDetails) ? entry.bookDetails[0] : null;
        return { entry, details };
      })
      .filter(({ details }) => Boolean(details?._id && details?.title));
  }, [trending]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        <section className="p-4 md:p-5">
          <div className="mb-4 border-b border-[var(--line)] pb-3">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Trending Books</h1>
            <p className="text-sm text-[var(--text-soft)]">
              Books with the highest recent review activity.
            </p>
          </div>

          {loading ? (
            <Loader />
          ) : visibleTrending.length === 0 ? (
            <p className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-soft)]">
              No trending books available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleTrending.map(({ entry, details }) => {
                const avg = typeof entry.averageRating === "number" ? entry.averageRating.toFixed(1) : "0.0";
                return (
                  <article
                    key={String(details._id)}
                    className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2">
                      <img
                        src={resolveCoverImageSrc(details.coverImg)}
                        alt={details.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <h2 className="mt-2 truncate text-lg font-bold text-[var(--text-strong)]">{details.title}</h2>
                    <p className="text-sm text-[var(--text-soft)]">by {details.author}</p>
                    <p className="mt-1 text-xs text-[var(--rating)]">
                      {renderStars(entry.averageRating)} {avg} ({entry.reviewCount ?? 0} reviews)
                    </p>
                    <Link
                      to={`/books/details/${details._id}`}
                      className="mt-3 inline-block rounded bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                    >
                      Open Details
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TrendingBooks;


