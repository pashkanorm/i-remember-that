import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // << using AuthContext instead

const Navbar: React.FC = () => {
  const tabs = [
    { name: "Movies", path: "/movies" },
    { name: "Games", path: "/games" },
    { name: "Books", path: "/books" },
  ];

  const { user, loading, signIn, signOut } = useAuth(); // << from AuthContext

  // Debug log, will help us see session state
  useEffect(() => {
    console.log("Navbar user:", user);
  }, [user]);

  return (
    <nav className="navbar" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Tabs */}
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          {tab.name}
        </NavLink>
      ))}

      {/* Push user block to right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            <span>Hello, {user.user_metadata?.full_name || user.email}</span>

            <span
              style={{
                backgroundColor: "#00aaff",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              ✓ Synced to your account
            </span>

            <button onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <button onClick={signIn}>Sign in with Google</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
