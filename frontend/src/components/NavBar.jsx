import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getToken, getUser } from "../utils/session";

const linkClass = ({ isActive }) =>
  `rounded-sm border-b-2 px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "border-[var(--accent)] text-white"
      : "border-transparent text-[var(--text-soft)] hover:text-white"
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
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#0b1424]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-sm font-bold tracking-wide text-[#bfdbfe]">
          MERN Book App
        </Link>

        <nav className="flex items-center gap-1 flex-wrap justify-end">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/my-books" className={linkClass}>
            My Books
          </NavLink>
          <NavLink to="/books/create" className={linkClass}>
            Add Book
          </NavLink>

          {token ? (
            <>
              <button
                onClick={logout}
                className="rounded-md border border-[var(--line)] bg-[#111b2d] px-3 py-2 text-sm font-semibold text-[#dbeafe] hover:bg-[#1a2940]"
                title={user?.email || "Logout"}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
