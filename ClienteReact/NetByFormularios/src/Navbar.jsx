// Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // manejar logout, remover clave valor relacionados a token y navegar a pg principal
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    setLoggedIn(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="navbar-logo" onClick={() => handleNavClick("/")}>
          NetByForms
        </button>
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          {!loggedIn && (
            <li className="nav-item">
              <button className="nav-link" onClick={() => handleNavClick("/")}>
                Login
              </button>
            </li>
          )}
          {loggedIn && (
            <>
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleNavClick("/crear")}
                >
                  Crear
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleNavClick("/todos")}
                >
                  Todos
                </button>
              </li>
              <li className="nav-item">
                <button className="nav-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
