import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { api, getApiErrorMessage } from '../api/client';
import NavBar from '../components/NavBar';
import { getToken, getUser } from '../utils/session';

const ShowBook = () => {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState("5");
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
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        alert(getApiErrorMessage(err, 'Failed to load book details.'));
        setLoading(false);
      });
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

  const requireLogin = () => {
    navigate("/login", { replace: true, state: { from: location.pathname } });
  };

  const canModifyReview = (r) => {
    if (!me) return false;
    if (me.role === "admin") return true;
    const reviewUserId = r?.user?._id || r?.user;
    return String(reviewUserId) === String(me.id);
  };

  const submitReview = async () => {
    if (!token) return requireLogin();
    try {
      await api.post(`/books/${id}/reviews`, { review: reviewText, rating: Number(rating) });
      setReviewText("");
      setRating("5");
      loadReviews();
      loadBook();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to add review"));
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setEditText(r.review || "");
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
      alert(getApiErrorMessage(err, "Failed to update review"));
    }
  };

  const deleteReview = async (reviewId) => {
    if (!token) return requireLogin();
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      loadReviews();
      loadBook();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete review"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <NavBar />
      <div className="max-w-6xl mx-auto p-5">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center md:text-left">
          Book Details
        </h1>

        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader />
          </div>
        ) : book && book.title ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 bg-gray-800 border border-teal-500 rounded-xl p-6 shadow-lg">
              {book.coverImg ? (
                <img
                  src={book.coverImg}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-lg border border-gray-700"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}

              <div className="mt-4 space-y-3">
                <div>
                  <span className="block text-sm text-gray-400">Title</span>
                  <p className="text-xl font-semibold text-teal-300">{book.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-sm text-gray-400">Author</span>
                    <p className="text-lg">{book.author}</p>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-400">Published Year</span>
                    <p className="text-lg">{book.publishedYear}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-sm text-gray-400">Avg Rating</span>
                    <p className="text-lg">
                      {typeof book.ratingsAverage === "number"
                        ? book.ratingsAverage.toFixed(1)
                        : book.ratingsAverage || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-400">Ratings</span>
                    <p className="text-lg">{book.ratingsQuantity ?? "-"}</p>
                  </div>
                </div>

                <div>
                  <span className="block text-sm text-gray-400">Genres</span>
                  {Array.isArray(book.genre) && book.genre.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {book.genre.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-1 rounded-full bg-gray-900 border border-gray-700 text-teal-200"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">-</p>
                  )}
                </div>

                <div>
                  <span className="block text-sm text-gray-400">Description</span>
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {book.description ? book.description : "No description provided."}
                  </p>
                </div>

                <div className="pt-2">
                  <BackButton />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-teal-200">Reviews</h2>

              <div className="mt-4 bg-gray-950 border border-gray-800 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
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
                    placeholder={token ? "Write a review..." : "Login to write a review"}
                    rows={2}
                    className="flex-1 p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
                  />
                  <button
                    onClick={submitReview}
                    disabled={!reviewText.trim()}
                    className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
                  >
                    Add
                  </button>
                </div>
                {!token ? (
                  <p className="text-xs text-gray-400 mt-2">
                    Protected endpoint: you need to login to create a review.
                  </p>
                ) : null}
              </div>

              <div className="mt-4">
                {reviewsLoading ? (
                  <Loader />
                ) : reviews.length === 0 ? (
                  <p className="text-gray-300">No reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => {
                      const isEditing = editing === r._id;
                      const userLabel = r?.user?.name || r?.user?.email || (r?.user?._id || r?.user);
                      return (
                        <div key={r._id} className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="text-sm text-gray-300">
                              <span className="text-teal-200 font-semibold">{userLabel}</span>{" "}
                              <span className="text-gray-400">
                                · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                              </span>
                            </div>
                            <div className="text-sm text-gray-200">Rating: {r.rating}</div>
                          </div>

                          {isEditing ? (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
                              <select
                                value={editRating}
                                onChange={(e) => setEditRating(e.target.value)}
                                className="sm:col-span-2 p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
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
                                className="sm:col-span-10 p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
                              />
                              <div className="sm:col-span-12 flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditing(null)}
                                  className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="px-3 py-2 rounded-md bg-teal-600 hover:bg-teal-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-gray-200 whitespace-pre-wrap">{r.review}</p>
                          )}

                          {canModifyReview(r) && !isEditing ? (
                            <div className="mt-3 flex gap-2 justify-end">
                              <button
                                onClick={() => startEdit(r)}
                                className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteReview(r._id)}
                                className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700"
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
          <p className="text-center text-gray-400 mt-20">Book not found.</p>
        )}
      </div>
    </div>
  );
};

export default ShowBook;
