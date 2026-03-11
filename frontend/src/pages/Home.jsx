import React, { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import Table from '../components/home/Table';
import Card from '../components/home/Card';
import { api } from '../api/client';
import NavBar from '../components/NavBar';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("-createdAt");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    const p = { page, limit, sort };
    if (minYear) p["publishedYear[gte]"] = minYear;
    if (maxYear) p["publishedYear[lte]"] = maxYear;
    return p;
  }, [limit, maxYear, minYear, page, sort]);

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
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/books', { params })
      .then((response) => {
        setBooks(response.data?.data?.books || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [params]);

  useEffect(() => {
    api
      .get("/books/trending")
      .then((res) => setTrending(res.data?.data?.trending || []))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="selection:bg-teal-900 min-h-screen bg-gradient-to-b from-teal-300 via-violet-500 to-teal-300">
      <NavBar />
      <div className="max-w-6xl mx-auto p-5">
        <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-4 bg-gray-900 text-teal-300 rounded-md">
          <div className="text-left">
            <h1 className="text-2xl">Books</h1>
            <p className="text-sm text-gray-300 mt-1">
              Use filters/sort/pagination (backend query features).
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end flex-wrap">
            <Link to="/books/create" className="flex items-center gap-2 hover:text-teal-200">
              <MdAdd size={22} /> <span>Add Book</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 bg-gray-900 text-teal-200 rounded-md p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
            <label className="text-sm text-gray-300 flex-1 min-w-[220px]">
              Search (title/author)
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
                placeholder="e.g. dune / tolkien"
              />
            </label>

            <label className="text-sm text-gray-300 min-w-[140px]">
              Min year
              <input
                value={minYear}
                onChange={(e) => {
                  setPage(1);
                  setMinYear(e.target.value);
                }}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
                placeholder="2015"
              />
            </label>

            <label className="text-sm text-gray-300 min-w-[140px]">
              Max year
              <input
                value={maxYear}
                onChange={(e) => {
                  setPage(1);
                  setMaxYear(e.target.value);
                }}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
                placeholder="2026"
              />
            </label>

            <label className="text-sm text-gray-300 min-w-[180px]">
              Sort
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
                <option value="-publishedYear">Year (desc)</option>
                <option value="publishedYear">Year (asc)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>

            <label className="text-sm text-gray-300 min-w-[110px]">
              Page
              <input
                type="number"
                min="1"
                value={page}
                onChange={(e) => setPage(Math.max(1, Number(e.target.value || 1)))}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
              />
            </label>

            <label className="text-sm text-gray-300 min-w-[120px]">
              Limit
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="mt-1 w-full p-2 rounded-md bg-gray-950 border border-gray-700 focus:border-teal-400 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            {loading ? (
              <Loader />
            ) : isMobile ? (
              <Card books={visibleBooks} />
            ) : (
              <Table books={visibleBooks} />
            )}
          </div>
        </div>

      {/* Content */}
        <div className="mt-6 bg-gray-900 rounded-md p-5">
          <h2 className="text-xl text-teal-200 font-semibold">Trending (last 30 days)</h2>
          {trending.length === 0 ? (
            <p className="text-gray-300 mt-2">No trending books yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((t) => {
                const b = Array.isArray(t.bookDetails) ? t.bookDetails[0] : null;
                if (!b) return null;
                return (
                  <Link
                    key={String(t._id)}
                    to={`/books/details/${b._id}`}
                    className="block bg-gray-950 border border-gray-800 rounded-lg p-4 hover:border-teal-500 transition"
                  >
                    <div className="text-teal-200 font-semibold">{b.title}</div>
                    <div className="text-sm text-gray-300 mt-1">{b.author}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {t.reviewCount} reviews · avg rating{" "}
                      {typeof t.averageRating === "number" ? t.averageRating.toFixed(1) : "-"}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
