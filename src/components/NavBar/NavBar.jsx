// src/components/NavBar/NavBar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NavBar.css";

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const profileHref = user?.username ? `/profile/${user.username}` : "/login";
  const homeHref = isAuthenticated ? "/home" : "/";

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav>
      <div className="logo" onClick={() => navigate(homeHref)} style={{ cursor: "pointer" }}>
        <h1>Gapp'd</h1>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to={homeHref} end className={linkClass}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/search" className={linkClass}>
            Search
          </NavLink>
        </li>

        <li>
          <NavLink to="/explore/events" className={linkClass}>
            Explore Events
          </NavLink>
        </li>

        {isAuthenticated && (
          <>
            <li>
              <NavLink to="/create" className={linkClass}>
                Create
              </NavLink>
            </li>
            <li>
              <NavLink to={profileHref} className={linkClass}>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="linklike"
              >
                Logout
              </button>
            </li>
          </>
        )}

        {!isAuthenticated && (
          <>
            <li>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
