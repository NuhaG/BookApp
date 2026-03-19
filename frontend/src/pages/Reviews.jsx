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
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5 text-[var(--text-main)]">
      <NavBar />
      <div className="max-w-7xl mx-auto rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] p-6">
        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-6">Reviews</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--line)] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--text-brand)]">Stats</h2>
              <button
                onClick={loadStats}
                className="px-3 py-2 rounded-md bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-hover)]"
              >
                Refresh
              </button>
            </div>

            {statsLoading ? (
              <div className="mt-4">
                <Loader />
              </div>
            ) : stats.length === 0 ? (
              <p className="text-[var(--text-main)] mt-3">No stats yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {stats.map((s) => (
                  <div
                    key={String(s._id)}
                    className="flex items-center justify-between bg-[var(--bg-deep)] border border-[var(--line)] rounded-lg px-3 py-2"
                  >
                    <div className="text-[var(--text-main)]">Rating {s._id}</div>
                    <div className="text-[var(--text-main)] text-sm">{s.numReviews} reviews</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--line)] rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-[var(--text-brand)]">All Reviews</h2>
              <button
                onClick={loadReviews}
                className="px-3 py-2 rounded-md bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-hover)]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-4">
                <Loader />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-[var(--text-main)] mt-3">No reviews found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => {
                  const isEditing = editing === r._id;
                  const userLabel = r?.user?.name || r?.user?.email || (r?.user?._id || r?.user);
                  const bookLabel = r?.book?.title ? `${r.book.title} (${r.book.publishedYear ?? "-"})` : String(r.book);
                  return (
                    <div key={r._id} className="bg-[var(--bg-deep)] border border-[var(--line)] rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-sm text-[var(--text-main)]">
                          <span className="text-[var(--text-brand)] font-semibold">{userLabel}</span>{" "}
                          <span className="text-[var(--text-muted-2)]">·</span>{" "}
                          <span className="text-[var(--text-main)]">{bookLabel}</span>{" "}
                          <span className="text-[var(--text-soft)]">
                            {r.createdAt ? `· ${new Date(r.createdAt).toLocaleString()}` : ""}
                          </span>
                        </div>
                        <div className="text-sm text-[var(--text-main)]">Rating: {r.rating}</div>
                      </div>

                      {isEditing ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <select
                            value={editRating}
                            onChange={(e) => setEditRating(e.target.value)}
                            className="sm:col-span-2 p-2 rounded-md bg-[var(--card-bg)] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
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
                            className="sm:col-span-10 p-2 rounded-md bg-[var(--card-bg)] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
                          />
                          <div className="sm:col-span-12 flex gap-2 justify-end">
                            <button
                              onClick={() => setEditing(null)}
                              className="px-3 py-2 rounded-md bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-hover)]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-[var(--text-main)] whitespace-pre-wrap">{r.review}</p>
                      )}

                      {canModifyReview(r) && !isEditing ? (
                        <div className="mt-3 flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(r)}
                            className="px-3 py-2 rounded-md bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-hover)]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteReview(r._id)}
                            className="px-3 py-2 rounded-md bg-[var(--danger)] hover:bg-[var(--danger-hover)]"
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
          <p className="text-xs text-[var(--text-soft)] mt-4">
            Edit/delete review endpoints are protected; login to manage your reviews.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Reviews;
