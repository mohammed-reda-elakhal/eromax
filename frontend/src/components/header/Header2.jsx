import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLogIn, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';

function Header2() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  const toggleMenu = () => setOpen((v) => !v);
  const closeMenu = () => setOpen(false);

  // Close on outside click for mobile viewports
  useEffect(() => {
    function handleOutside(e) {
      if (!open) return;
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      if (!isMobile) return;
      const t = e.target;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        toggleRef.current && !toggleRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={`header2 ${open ? 'is-open' : ''}`} dir="rtl">
      <div className="h2-container">
        {/* Brand / Logo */}
        <div className="h2-brand">
          <Link to="/" onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Eromax">
            <img src="/image/logo_2.png" alt="Eromax" className="h2-logo" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="h2-toggle"
          aria-label={open ? 'اغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
          aria-controls="h2-menu"
          onClick={toggleMenu}
          ref={toggleRef}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

        {/* Right side: nav + ctas */}
        <div id="h2-menu" className="h2-right" ref={menuRef}>
          {/* Nav links */}
          <nav className="h2-nav" aria-label="التنقل الرئيسي">
            <ul className="h2-links" onClick={closeMenu}>
              <li><a href="#about" className="h2-link">من نحن</a></li>
              <li><a href="#tarif" className="h2-link">الأثمنة</a></li>
              <li><a href="#contact" className="h2-link">تواصل معنا</a></li>
              <li>
                <a href="https://eromaxdelivery.com/" className="h2-link" target="_blank" rel="noopener noreferrer">المدونة</a>
              </li>
            </ul>
          </nav>

          {/* CTAs */}
          <div className="h2-ctas" onClick={closeMenu}>
            <Link to="/login" className="h2-btn h2-btn-outline">
              <FiLogIn className="h2-ic" />
              <span>تسجيل الدخول</span>
            </Link>
            <Link to="/register" className="h2-btn h2-btn-primary">
              <FiUserPlus className="h2-ic" />
              <span>انضم إلينا</span>
            </Link>
          </div>
        </div>

        {/* Screen overlay (mobile) */}
        {open && <button type="button" className="h2-overlay" aria-label="إغلاق القائمة" onClick={closeMenu} />}
      </div>
    </header>
  );
}

export default Header2;
