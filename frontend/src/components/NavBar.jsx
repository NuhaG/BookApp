import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getToken, getUser } from "../utils/session";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md hover:bg-gray-800 ${
    isActive ? "bg-gray-800 text-teal-200" : "text-teal-300"
  }`;

const NavBar = () => {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="text-teal-300 font-semibold tracking-wide">
          MERN Book App
        </Link>

        <nav className="flex items-center gap-2 flex-wrap justify-end">
          <NavLink to="/" className={linkClass} end>
            Books
          </NavLink>
          <NavLink to="/reviews" className={linkClass}>
            Reviews
          </NavLink>

          {token ? (
            <>
              <span className="hidden sm:inline text-gray-300 px-2">
                {user?.email ? user.email : "Logged in"}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-teal-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;

