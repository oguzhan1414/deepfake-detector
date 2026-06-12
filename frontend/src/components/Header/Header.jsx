import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

const NAV = [
  { to: '/', label: 'Ana Sayfa', end: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--solid' : 'navbar--clear'}`}>
      <div className="navbar-inner">

        {/* ── Logo (left) ── */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-mark">
            <svg viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" stroke="#f59e0b" strokeWidth="1.6"/>
              <circle cx="22" cy="17" r="6.5" stroke="#f59e0b" strokeWidth="1.6"/>
              <path d="M9 39c0-7.18 5.82-13 13-13s13 5.82 13 13" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="33" y1="10" x2="39" y2="4" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="33" y1="4"  x2="39" y2="10" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="logo-copy">
            <span className="logo-name">DeepFake<span className="logo-em">AI</span></span>
            <span className="logo-tagline">Tespit Sistemi</span>
          </div>
        </div>

        {/* ── Nav (center) ── */}
        <nav className={`navbar-nav ${menuOpen ? 'navbar-nav--open' : ''}`}>
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              {label}
              <span className="nav-underline"/>
            </NavLink>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="navbar-actions">
          <div className="live-chip">
            <span className="live-dot"/>
            API Canlı
          </div>
          <NavLink to="/analyze" className="cta-btn">
            Analiz Et
          </NavLink>
          <button
            className="burger"
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Menü"
          >
            <span className={menuOpen ? 'open' : ''}/>
            <span className={menuOpen ? 'open' : ''}/>
            <span className={menuOpen ? 'open' : ''}/>
          </button>
        </div>

      </div>
    </header>
  );
}
