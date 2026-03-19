import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import NavBar from '../components/NavBar';
import { api, getApiErrorMessage } from '../api/client';
import { resolveCoverImageSrc } from '../utils/images';
import { getToken } from '../utils/session';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    api
      .get('/books/my')
      .then((res) => setBooks(res.data?.data?.books || []))
      .catch((err) => alert(getApiErrorMessage(err, 'Failed to load your books.')))
      .finally(() => setLoading(false));
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        <div className="p-4">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">My Books</h1>
            <Link
              to="/books/create"
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
            >
              Add Book
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : books.length === 0 ? (
            <div className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-6 text-[var(--text-soft)]">
              You have not added any books yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {books.map((book) => (
                <div key={book._id} className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-3 shadow-sm">
                  <div className="flex gap-3">
                    <div className="h-24 w-16 shrink-0 overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--bg-input)]">
                      {book.coverImg ? (
                        <img
                          src={resolveCoverImageSrc(book.coverImg)}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold text-[var(--text-strong)]">{book.title}</h2>
                      <p className="text-sm text-[var(--text-soft)]">by {book.author}</p>
                      <p className="mt-1 text-xs text-[var(--text-soft)]">
                        Chapters: {Array.isArray(book.chapters) ? book.chapters.length : 0}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to={`/books/details/${book._id}`}
                          className="rounded-md border border-[var(--line)] px-2 py-1 text-xs font-semibold text-[var(--text-brand)] hover:bg-[var(--bg-chip)]"
                        >
                          Read
                        </Link>
                        <Link
                          to={`/books/edit/${book._id}`}
                          className="rounded-md bg-[var(--accent)] px-2 py-1 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                        >
                          Edit + Chapters
                        </Link>
                        <Link
                          to={`/books/delete/${book._id}`}
                          className="rounded-md bg-[var(--danger)] px-2 py-1 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--danger-hover)]"
                        >
                          Delete
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBooks;



