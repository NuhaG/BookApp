import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { api, getApiErrorMessage } from "../api/client";
import { setSession } from "../utils/session";
import NavBar from "../components/NavBar";

const Register = () => {
  const [name, setName] = useState("");
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
      const res = await api.post("/auth/register", { name, email, password });
      setSession({ token: res.data?.token, user: res.data?.user });
      navigate(from, { replace: true });
    } catch (err) {
      alert(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center md:text-left">
          Register
        </h1>

      {loading && (
        <div className="flex justify-center mb-4">
          <Loader />
        </div>
      )}

        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-teal-500"
        >
        <div className="flex flex-col gap-4">
          <label className="text-sm text-gray-300">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Create account
        </button>

        <p className="text-sm text-gray-300 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-300 hover:text-teal-200 underline">
            Login
          </Link>
        </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
