import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { api, getApiErrorMessage } from '../api/client';
import { resolveCoverImageSrc } from '../utils/images';
import NavBar from '../components/NavBar';
import { getToken, getUser } from '../utils/session';

const ShowBook = () => {
  const renderStars = (ratingValue) => {
    const safe = Math.max(0, Math.min(5, Number(ratingValue) || 0));
    const rounded = Math.round(safe);
    return '*****'.slice(0, rounded) + '-----'.slice(0, 5 - rounded);
  };

    const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState('5');
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [modalChapter, setModalChapter] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const me = getUser();

  const loadBook = useCallback(() => {
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
      })
      .catch((err) => {
        console.log(err);
        alert(getApiErrorMessage(err, 'Failed to load book details.'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadReviews = useCallback(() => {
    setReviewsLoading(true);
    api
      .get(`/books/${id}/reviews`)
      .then((res) => setReviews(res.data?.data?.reviews || []))
      .catch((err) => console.log(err))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    loadBook();
    loadReviews();
  }, [loadBook, loadReviews]);

  const sortedChapters = Array.isArray(book.chapters)
    ? book.chapters.slice().sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))
    : [];

  const openChapter = (chapter) => {
    setModalChapter(chapter);
    setChapterModalOpen(true);
  };

  const closeChapterModal = () => {
    setChapterModalOpen(false);
    setModalChapter(null);
  };

  const requireLogin = () => {
    navigate('/login', { replace: true, state: { from: location.pathname } });
  };

  const canModifyReview = (r) => {
    if (!me) return false;
    if (me.role === 'admin') return true;
    const reviewUserId = r?.user?._id || r?.user;
    return String(reviewUserId) === String(me.id);
  };

  const submitReview = async () => {
    if (!token) return requireLogin();
    try {
      await api.post(`/books/${id}/reviews`, { review: reviewText, rating: Number(rating) });
      setReviewText('');
      setRating('5');
      loadReviews();
      loadBook();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to add review'));
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setEditText(r.review || '');
    setEditRating(String(r.rating || 5));
  };

  const saveEdit = async () => {
    if (!token) return requireLogin();
    try {
      await api.patch(`/reviews/${editing}`, { review: editText, rating: Number(editRating) });
      setEditing(null);
      loadReviews();
      loadBook();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to update review'));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!token) return requireLogin();
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      loadReviews();
      loadBook();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete review'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <NavBar />
      <div className="mx-auto mt-3 max-w-7xl rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] p-4 shadow-[0_8px_26px_rgba(0,0,0,0.35)]">
        <h1 className="mb-4 text-center text-3xl font-bold text-[var(--text-main)] md:text-left">Book Details</h1>

        {loading ? (
          <div className="mt-20 flex justify-center">
            <Loader />
          </div>
        ) : book && book.title ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.15fr]">
            <div className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-sm">
              {book.coverImg ? (
                <img
                  src={resolveCoverImageSrc(book.coverImg)}
                  alt={book.title}
                  className="h-72 w-full rounded-md border border-[var(--line)] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null}

              <div className="mt-4 space-y-3">
                <div>
                  <span className="block text-sm text-[var(--text-soft)]">Title</span>
                  <p className="text-xl font-semibold text-[var(--text-main)]">{book.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-sm text-[var(--text-soft)]">Author</span>
                    <p className="text-lg text-[var(--text-main)]">{book.author}</p>
                  </div>
                  <div>
                    <span className="block text-sm text-[var(--text-soft)]">Published Year</span>
                    <p className="text-lg text-[var(--text-main)]">{book.publishedYear}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-sm text-[var(--text-soft)]">Avg Rating</span>
                    <p className="text-lg text-[var(--text-main)]">
                      {typeof book.ratingsAverage === 'number' ? book.ratingsAverage.toFixed(1) : book.ratingsAverage || '-'}
                    </p>
                    <p className="text-xs text-yellow-400">{renderStars(book.ratingsAverage)}</p>
                  </div>
                  <div>
                    <span className="block text-sm text-[var(--text-soft)]">Ratings</span>
                    <p className="text-lg text-[var(--text-main)]">{book.ratingsQuantity ?? '-'}</p>
                  </div>
                </div>

                <div>
                  <span className="block text-sm text-[var(--text-soft)]">Genres</span>
                  {Array.isArray(book.genre) && book.genre.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {book.genre.map((g) => (
                        <span key={g} className="rounded-full border border-[var(--line)] bg-[#0b1220] px-2 py-1 text-xs text-[#bfdbfe]">
                          {g}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-soft)]">-</p>
                  )}
                </div>

                <div>
                  <span className="block text-sm text-[var(--text-soft)]">Description</span>
                  <p className="whitespace-pre-wrap text-[var(--text-soft)]">
                    {book.description ? book.description : 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2">
                  <BackButton />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--text-main)]">Read Chapters</h2>

              {sortedChapters.length === 0 ? (
                <p className="mt-3 text-[var(--text-soft)]">No chapters published yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sortedChapters.map((chapter) => (
                    <div key={chapter._id} className="rounded-md border border-[var(--line)] bg-[#0d1627] p-3">
                      <p className="font-semibold text-[#dbeafe]">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </p>
                      <button
                        onClick={() => openChapter(chapter)}
                        className="mt-2 rounded-md bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Read Chapter
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="mt-6 border-t border-[var(--line)] pt-4 text-xl font-semibold text-[var(--text-main)]">
                Leave A Review
              </h2>

              <div className="mt-4 rounded-md border border-[var(--line)] bg-[#0d1627] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="rounded-md border border-[var(--line)] bg-[#0b1220] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={token ? 'Write a review...' : 'Login to write a review'}
                    rows={2}
                    className="flex-1 rounded-md border border-[var(--line)] bg-[#0b1220] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <button
                    onClick={submitReview}
                    disabled={!reviewText.trim()}
                    className="rounded-md bg-[var(--accent)] px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    Add
                  </button>
                </div>
                {!token ? (
                  <p className="mt-2 text-xs text-[var(--text-soft)]">Protected endpoint: login to create a review.</p>
                ) : null}
              </div>

              <div className="mt-4">
                {reviewsLoading ? (
                  <Loader />
                ) : reviews.length === 0 ? (
                  <p className="text-[var(--text-soft)]">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => {
                      const isEditing = editing === r._id;
                      const userLabel = r?.user?.name || r?.user?.email || (r?.user?._id || r?.user);
                      return (
                        <div key={r._id} className="rounded-md border border-[var(--line)] bg-[#0d1627] p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-[var(--text-soft)]">
                              <span className="font-semibold text-[#dbeafe]">{userLabel}</span>{' '}
                              <span>- {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
                            </div>
                            <div className="text-sm text-[var(--text-soft)]">
                              {renderStars(r.rating)} <span>({r.rating})</span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                              <select
                                value={editRating}
                                onChange={(e) => setEditRating(e.target.value)}
                                className="rounded-md border border-[var(--line)] bg-[#0b1220] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none sm:col-span-2"
                              >
                                <option value="5">5</option>
                                <option value="4">4</option>
                                <option value="3">3</option>
                                <option value="2">2</option>
                                <option value="1">1</option>
                              </select>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                                className="rounded-md border border-[var(--line)] bg-[#0b1220] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none sm:col-span-10"
                              />
                              <div className="flex justify-end gap-2 sm:col-span-12">
                                <button
                                  onClick={() => setEditing(null)}
                                  className="rounded-md border border-[var(--line)] px-3 py-2 text-[var(--text-soft)] hover:bg-[#1a2940]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="rounded-md bg-[var(--accent)] px-3 py-2 text-white hover:bg-blue-500"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-[var(--text-soft)]">{r.review}</p>
                          )}

                          {canModifyReview(r) && !isEditing ? (
                            <div className="mt-3 flex justify-end gap-2">
                              <button
                                onClick={() => startEdit(r)}
                                className="rounded-md border border-[var(--line)] px-3 py-2 text-[var(--text-soft)] hover:bg-[#1a2940]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteReview(r._id)}
                                className="rounded-md bg-[#b43b41] px-3 py-2 text-white hover:bg-[#9f2f35]"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-20 text-center text-[var(--text-soft)]">Book not found.</p>
        )}
      </div>

      {chapterModalOpen && modalChapter ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4" onClick={closeChapterModal}>
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--text-soft)]">Reading</p>
                <h3 className="text-xl font-semibold text-[var(--text-main)]">
                  Chapter {modalChapter.chapterNumber}: {modalChapter.title}
                </h3>
              </div>
              <button
                onClick={closeChapterModal}
                className="rounded-md border border-[var(--line)] bg-[#111b2d] px-3 py-1 text-sm text-[var(--text-soft)] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-[var(--text-soft)] leading-relaxed">
              {modalChapter.content}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShowBook;


