import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { api, getApiErrorMessage } from "../api/client";
import { setSession } from "../utils/session";
import NavBar from "../components/NavBar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setSession({ token: res.data?.token, user: res.data?.user });
      navigate(from, { replace: true });
    } catch (err) {
      alert(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)] pbi-4">
        <NavBar />

        <div className="m-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Login</h1>
        </div>

        {loading && (
          <div className="mb-4 flex justify-center">
            <Loader />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-md rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-6 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <label className="text-sm text-[var(--text-soft)]">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-[var(--accent)] py-2 font-semibold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            Login
          </button>

          <p className="mt-4 text-center text-sm text-[var(--text-soft)]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[var(--text-link)] underline hover:text-[var(--text-brand)]">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
