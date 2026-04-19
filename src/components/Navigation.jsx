import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button, Offcanvas } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaMoon,
  FaSun,
  FaGlobeAmericas,
  FaCompass,
  FaBars,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import NotificationCenter from "./NotificationCenter";
import { motion } from "framer-motion";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const token = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.includes(path);
  };

  const NavLinks = () => (
    <>
      <Nav.Link as={Link} to="/dashboard" className={isActive("/dashboard") ? "active" : ""} onClick={() => setShowMobile(false)}>
        {t("nav.home")}
      </Nav.Link>
      <Nav.Link as={Link} to="/internships" className={isActive("/internships") ? "active" : ""} onClick={() => setShowMobile(false)}>
        {t("nav.intern")}
      </Nav.Link>
      <Nav.Link as={Link} to="/jobs" className={isActive("/jobs") ? "active" : ""} onClick={() => setShowMobile(false)}>
        {t("nav.jobs")}
      </Nav.Link>
      <Nav.Link as={Link} to="/marketplace" className={isActive("/marketplace") ? "active" : ""} onClick={() => setShowMobile(false)}>
        {t("nav.market")}
      </Nav.Link>
      <Nav.Link as={Link} to="/discounts" className={isActive("/discounts") ? "active" : ""} onClick={() => setShowMobile(false)}>
        {t("nav.local")}
      </Nav.Link>
    </>
  );

  return (
    <div className={`nav-wrapper ${scrolled ? 'nav-scrolled' : ''}`}>
      <Navbar expand="lg" className="main-navbar">
        <Container fluid className="px-lg-5">
          {/* BRAND */}
          <Navbar.Brand as={Link} to={token ? "/dashboard" : "/login"} className="brand-wrap">
            <div className="brand-logo">
              <FaCompass />
            </div>
            <div className="brand-text d-none d-sm-block">
              Everyday<span>Life</span>
            </div>
          </Navbar.Brand>

          {/* DESKTOP LINKS (CENTERED) */}
          <div className="d-none d-lg-flex mx-auto align-items-center">
             {token && (
               <Nav className="nav-links-center">
                 <NavLinks />
               </Nav>
             )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="nav-actions">
            {token ? (
              <>
                <div className="d-flex align-items-center gap-1">
                  <NotificationCenter />
                  
                  <div className="utility-sep d-none d-md-block"></div>
                  
                  <button onClick={toggleLanguage} className="nav-icon-btn d-none d-md-flex" title="Toggle Language">
                    <FaGlobeAmericas />
                    <span className="lang-code">{language.toUpperCase()}</span>
                  </button>

                  <button onClick={toggleTheme} className="nav-icon-btn d-none d-md-flex" title="Toggle Theme">
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                  </button>

                  <Link to="/profile" className="nav-profile-link d-none d-sm-block">
                    <div className="nav-avatar">
                      <FaUser />
                    </div>
                  </Link>
                </div>

                <button className="mobile-toggle d-lg-none ms-2" onClick={() => setShowMobile(true)}>
                  <FaBars />
                </button>

                <div className="utility-sep d-none d-lg-block"></div>

                <button onClick={handleLogout} className="nav-logout-btn d-none d-lg-flex" title={t("nav.logout")}>
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                 <button onClick={toggleLanguage} className="nav-icon-btn">
                  <FaGlobeAmericas />
                  <span className="lang-code">{language.toUpperCase()}</span>
                </button>
                <button onClick={toggleTheme} className="nav-icon-btn me-2">
                  {theme === "light" ? <FaMoon /> : <FaSun />}
                </button>
                <Link to="/login" className="login-link d-none d-sm-block me-2">{t("nav.login")}</Link>
                <Button as={Link} to="/register" className="btn-primary rounded-pill px-4 nav-cta">{t("nav.joinNow")}</Button>
              </div>
            )}
          </div>

          {/* MOBILE MENU (OFFCANVAS) */}
          <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="end" className="studio-offcanvas">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="fw-900 fs-4">Everyday<span>Life</span></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column gap-3 mb-5">
                <NavLinks />
                {token && (
                   <>
                    <hr className="opacity-10" />
                    <Nav.Link as={Link} to="/profile" onClick={() => setShowMobile(false)}>{t("profile.title")}</Nav.Link>
                    <div className="d-flex gap-2 mt-3">
                       <button onClick={toggleTheme} className="nav-icon-btn flex-grow-1 border p-3 rounded-4">
                          {theme === "light" ? <><FaMoon className="me-2" /> Dark</> : <><FaSun className="me-2" /> Light</>}
                       </button>
                    </div>
                    <Button variant="danger" className="mt-5 rounded-4 p-3 fw-800 border-0" onClick={handleLogout}>{t("nav.logout")}</Button>
                   </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

        </Container>
      </Navbar>

      <style>{`
        .nav-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 24px 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-scrolled {
          padding: 12px 0;
        }
        .main-navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(25px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          margin: 0 40px;
          padding: 10px 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
        }
        @media (max-width: 991px) {
          .main-navbar { margin: 0 15px; border-radius: 18px; }
          .nav-wrapper { padding: 15px 0; }
        }

        .brand-wrap { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-logo {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }
        .brand-text { font-weight: 900; font-size: 1.3rem; letter-spacing: -0.04em; color: var(--text-main); }
        .brand-text span { color: var(--accent-primary); }

        .nav-links-center {
          background: rgba(var(--accent-primary-rgb), 0.04);
          border: 1px solid var(--glass-border);
          border-radius: 60px;
          padding: 5px !important;
          gap: 5px;
        }
        .nav-links-center .nav-link {
          font-size: 0.85rem; font-weight: 700; color: var(--text-muted);
          padding: 8px 20px !important; border-radius: 50px;
          transition: all 0.2s ease;
        }
        .nav-links-center .nav-link:hover { color: var(--text-main); background: rgba(0,0,0,0.04); }
        .nav-links-center .nav-link.active {
          background: white; color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        [data-theme='dark'] .nav-links-center .nav-link.active { background: rgba(255,255,255,0.08); }

        .nav-actions { display: flex; align-items: center; gap: 8px; }
        .nav-icon-btn {
          width: 40px; height: 40px; border: 1px solid var(--glass-border);
          background: transparent; color: var(--text-muted); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; transition: all 0.2s ease; position: relative;
        }
        .nav-icon-btn:hover { background: var(--bg-body); color: var(--text-main); border-color: var(--accent-primary); }
        .lang-code {
          position: absolute; bottom: 4px; right: 4px; font-size: 0.5rem;
          font-weight: 900; background: var(--accent-primary); color: white;
          border-radius: 3px; padding: 1px 3px;
        }

        .utility-sep { width: 1px; height: 28px; background: var(--glass-border); margin: 0 5px; }

        .nav-avatar {
          width: 40px; height: 40px; background: var(--bg-body);
          border: 2px solid var(--glass-border); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); transition: all 0.2s ease;
        }
        .nav-profile-link:hover .nav-avatar { border-color: var(--accent-primary); color: var(--accent-primary); }

        .nav-logout-btn {
          width: 40px; height: 40px; border: none;
          background: rgba(239, 68, 68, 0.08); color: #ef4444; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
        }
        .nav-logout-btn:hover { background: #ef4444; color: white; }

        .mobile-toggle {
          width: 40px; height: 40px; border-radius: 12px; border: none;
          background: var(--bg-body); color: var(--text-main);
          display: flex; align-items: center; justify-content: center;
        }

        .studio-offcanvas { background: var(--bg-card); backdrop-filter: blur(20px); border-radius: 32px 0 0 32px !important; }
        .studio-offcanvas .nav-link { font-weight: 800; font-size: 1.25rem; color: var(--text-main); padding: 15px 0; border-bottom: 1px solid var(--glass-border); }
        .studio-offcanvas .nav-link.active { color: var(--accent-primary); }
        
        .nav-cta { font-weight: 800; font-size: 0.9rem; padding: 10px 24px !important; }
      `}</style>
    </div>
  );
};

export default Navigation;
