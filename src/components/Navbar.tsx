import React from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const tabs = [
    { name: "Films", path: "/films" },
    { name: "Games", path: "/games" },
    { name: "Books", path: "/books" },
  ];

  return (
    <nav className="navbar">
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
    </nav>
  );
};

export default Navbar;
