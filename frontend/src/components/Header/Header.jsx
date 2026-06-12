import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

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

        {/* ── Logo ── */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-mark">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#00d4ff" strokeWidth="1.4"/>
              <circle cx="20" cy="20" r="11" stroke="#00d4ff" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
              <circle cx="20" cy="20" r="4"  fill="#00d4ff" opacity="0.9"/>
              <line x1="2"  y1="20" x2="9"  y2="20" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="31" y1="20" x2="38" y2="20" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="20" y1="2"  x2="20" y2="9"  stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="20" y1="31" x2="20" y2="38" stroke="#00d4ff" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="logo-copy">
            <span className="logo-name">DeepFake<span className="logo-em">AI</span></span>
            <span className="logo-tagline">Tespit Sistemi</span>
          </div>
        </div>

        {/* ── Right — nav + actions ── */}
        <div className="navbar-right">
          <nav className={`navbar-nav ${menuOpen ? 'navbar-nav--open' : ''}`}>
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              Ana Sayfa
              <span className="nav-underline"/>
            </NavLink>
          </nav>

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

      </div>
    </header>
  );
}
