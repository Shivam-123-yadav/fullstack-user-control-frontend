import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <nav className={isScrolled ? 'scrolled' : ''}>
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand" onClick={closeMenu}>
          MyApp
        </Link>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          {(user.role === 'admin' || user.role === 'manager') && (
            <Link to="/tasks" onClick={closeMenu}>Tasks</Link>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu}>Admin Panel</Link>
          )}
        </div>

        <div className="navbar-user">
          <span>
            {user.first_name || user.username}
            <span className={`role-badge ${user.role}`}>
              {user.role}
            </span>
          </span>
          <button onClick={logout}>Logout</button>
        </div>

        <div
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;