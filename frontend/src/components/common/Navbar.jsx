import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCrestIcon } from '../icons';
import Button from './Button';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="navbar-wrapper">
      {/* Top Banner Stripe */}
      <div className="navbar-top-bar">
        <div className="container flex-between">
          <span className="navbar-motto">
            Motto: <em>Excellence, Integrity, Leadership</em>
          </span>
          <div className="flex items-center gap-4">
            <span>2026/2027 Academic Session</span>
            <span className="navbar-portal-tag">Secondary School Portal</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar-main">
        <div className="container flex-between">
          {/* School Brand & Crest Placeholder */}
          <Link to="/" className="flex items-center gap-3">
            <div className="school-crest" aria-label="School Crest Placeholder">
              <ShieldCrestIcon size={24} />
            </div>
            <div>
              <div className="school-title">Crestfield Academy</div>
              <div className="school-subtitle">Secondary Education • Nigeria</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action: Prominent Portal Login */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="gold" size="sm">
                Portal Login
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <div className="container flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="gold" size="md" className="w-full">
                  Portal Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
