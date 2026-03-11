import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Loader from "../components/Loader";
import { api, getApiErrorMessage } from "../api/client";
import { getToken, getUser } from "../utils/session";
import { useLocation, useNavigate } from "react-router-dom";

const Reviews = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState("5");

  const token = getToken();
  const me = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  const requireLogin = () => {
    navigate("/login", { replace: true, state: { from: location.pathname } });
  };

  const canModifyReview = (r) => {
    if (!me) return false;
    if (me.role === "admin") return true;
    const reviewUserId = r?.user?._id || r?.user;
    return String(reviewUserId) === String(me.id);
  };

  const loadReviews = () => {
    setLoading(true);
    api
      .get("/reviews")
      .then((res) => setReviews(res.data?.data?.reviews || []))
      .catch((err) => alert(getApiErrorMessage(err, "Failed to load reviews")))
      .finally(() => setLoading(false));
  };

  const loadStats = () => {
    setStatsLoading(true);
    api
      .get("/reviews/review-stats")
      .then((res) => setStats(res.data?.data?.stats || []))
      .catch((err) => console.log(err))
      .finally(() => setStatsLoading(false));
  };

  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

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
      loadStats();
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
      loadStats();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete review"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-teal-400 mb-6">Reviews</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-teal-200">Stats</h2>
              <button
                onClick={loadStats}
                className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>

            {statsLoading ? (
              <div className="mt-4">
                <Loader />
              </div>
            ) : stats.length === 0 ? (
              <p className="text-gray-300 mt-3">No stats yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {stats.map((s) => (
                  <div
                    key={String(s._id)}
                    className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg px-3 py-2"
                  >
                    <div className="text-gray-200">Rating {s._id}</div>
                    <div className="text-gray-300 text-sm">{s.numReviews} reviews</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-teal-200">All Reviews</h2>
              <button
                onClick={loadReviews}
                className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-4">
                <Loader />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-300 mt-3">No reviews found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => {
                  const isEditing = editing === r._id;
                  const userLabel = r?.user?.name || r?.user?.email || (r?.user?._id || r?.user);
                  const bookLabel = r?.book?.title ? `${r.book.title} (${r.book.publishedYear ?? "-"})` : String(r.book);
                  return (
                    <div key={r._id} className="bg-gray-950 border border-gray-800 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-sm text-gray-300">
                          <span className="text-teal-200 font-semibold">{userLabel}</span>{" "}
                          <span className="text-gray-500">·</span>{" "}
                          <span className="text-gray-300">{bookLabel}</span>{" "}
                          <span className="text-gray-400">
                            {r.createdAt ? `· ${new Date(r.createdAt).toLocaleString()}` : ""}
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

        {!token ? (
          <p className="text-xs text-gray-400 mt-4">
            Edit/delete review endpoints are protected; login to manage your reviews.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Reviews;

