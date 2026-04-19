import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button, Offcanvas } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaMoon,
  FaSun,
  FaLanguage,
  FaGlobeAmericas,
  FaCompass,
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

  return (
    <div className={`nav-wrapper ${scrolled ? 'nav-scrolled' : ''}`}>
      <Navbar expand="lg" className="main-navbar">
        <Container fluid className="px-lg-5">
          <Navbar.Brand as={Link} to={token ? "/dashboard" : "/login"} className="brand-wrap">
            <div className="brand-logo">
              <FaCompass />
            </div>
            <div className="brand-text">
              Everyday<span>Life</span>
            </div>
          </Navbar.Brand>

          <div className="d-flex align-items-center gap-2 d-lg-none">
            <NotificationCenter />
            <Navbar.Toggle aria-controls="mobile-nav" className="mobile-toggle" />
          </div>

          <Navbar.Collapse id="desktop-nav" className="d-none d-lg-flex">
            <Nav className="mx-auto nav-links-center">
              {token ? (
                <>
                  <Nav.Link as={Link} to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                    {t("nav.home")}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/internships" className={isActive("/internships") ? "active" : ""}>
                    {t("nav.intern")}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/jobs" className={isActive("/jobs") ? "active" : ""}>
                    {t("nav.jobs")}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/marketplace" className={isActive("/marketplace") ? "active" : ""}>
                    {t("nav.market")}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/discounts" className={isActive("/discounts") ? "active" : ""}>
                    {t("nav.local")}
                  </Nav.Link>
                </>
              ) : null}
            </Nav>

            <div className="nav-actions">
              {token ? (
                <>
                  <NotificationCenter />
                  
                  <div className="utility-sep"></div>
                  
                  <button onClick={toggleLanguage} className="nav-icon-btn" title="Toggle Language">
                    <FaGlobeAmericas />
                    <span className="lang-code">{language.toUpperCase()}</span>
                  </button>

                  <button onClick={toggleTheme} className="nav-icon-btn" title="Toggle Theme">
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                  </button>

                  <Link to="/profile" className="nav-profile-link">
                    <div className="nav-avatar">
                      <FaUser />
                    </div>
                  </Link>

                  <button onClick={handleLogout} className="nav-logout-btn" title={t("nav.logout")}>
                    <FaSignOutAlt />
                  </button>
                </>
              ) : (
                <>
                   <button onClick={toggleLanguage} className="nav-icon-btn me-2">
                    <FaGlobeAmericas />
                    <span className="lang-code">{language.toUpperCase()}</span>
                  </button>
                  <button onClick={toggleTheme} className="nav-icon-btn me-3">
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                  </button>
                  <Nav.Link as={Link} to="/login" className="login-link me-3">
                    {t("nav.login")}
                  </Nav.Link>
                  <Button as={Link} to="/register" className="btn-primary rounded-pill px-4 nav-cta">
                    {t("nav.joinNow")}
                  </Button>
                </>
              )}
            </div>
          </Navbar.Collapse>

          {/* MOBILE NAV */}
          <Navbar.Offcanvas id="mobile-nav" placement="end">
            <Offcanvas.Header closeButton className="border-bottom">
              <Offcanvas.Title className="fw-800">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="gap-3">
                {token ? (
                  <>
                    <Nav.Link as={Link} to="/dashboard" onClick={() => document.querySelector('.btn-close').click()}>{t("nav.home")}</Nav.Link>
                    <Nav.Link as={Link} to="/internships" onClick={() => document.querySelector('.btn-close').click()}>{t("nav.intern")}</Nav.Link>
                    <Nav.Link as={Link} to="/jobs" onClick={() => document.querySelector('.btn-close').click()}>{t("nav.jobs")}</Nav.Link>
                    <Nav.Link as={Link} to="/marketplace" onClick={() => document.querySelector('.btn-close').click()}>{t("nav.market")}</Nav.Link>
                    <Nav.Link as={Link} to="/discounts" onClick={() => document.querySelector('.btn-close').click()}>{t("nav.local")}</Nav.Link>
                    <hr />
                    <Nav.Link as={Link} to="/profile" onClick={() => document.querySelector('.btn-close').click()}>{t("profile.title")}</Nav.Link>
                    <Nav.Link onClick={handleLogout} className="text-danger">{t("nav.logout")}</Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login">{t("nav.login")}</Nav.Link>
                    <Nav.Link as={Link} to="/register">{t("nav.joinNow")}</Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <style>{`
        .nav-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-scrolled {
          padding: 10px 0;
        }
        .main-navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          margin: 0 40px;
          padding: 8px 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        @media (max-width: 991px) {
          .main-navbar { margin: 0 15px; }
          .nav-wrapper { padding: 15px 0; }
        }

        .brand-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        .brand-text {
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          color: var(--text-main);
        }
        .brand-text span { color: var(--accent-primary); }

        .nav-links-center {
          background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 50px;
          padding: 4px 8px !important;
          gap: 4px;
        }
        .nav-links-center .nav-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          padding: 8px 18px !important;
          border-radius: 50px;
          transition: all 0.2s ease;
        }
        .nav-links-center .nav-link:hover {
          color: var(--text-main);
          background: rgba(0,0,0,0.03);
        }
        .nav-links-center .nav-link.active {
          background: white;
          color: var(--accent-primary);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        [data-theme='dark'] .nav-links-center .nav-link.active {
          background: rgba(255,255,255,0.05);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-icon-btn {
          width: 38px;
          height: 38px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-icon-btn:hover {
          background: rgba(0,0,0,0.03);
          color: var(--text-main);
        }
        .lang-code {
          position: absolute;
          bottom: 4px;
          right: 4px;
          font-size: 0.55rem;
          font-weight: 800;
          background: var(--accent-primary);
          color: white;
          border-radius: 4px;
          padding: 1px 3px;
        }

        .utility-sep {
          width: 1px;
          height: 24px;
          background: var(--glass-border);
          margin: 0 5px;
        }

        .nav-profile-link {
          margin-left: 5px;
          text-decoration: none;
        }
        .nav-avatar {
          width: 38px;
          height: 38px;
          background: var(--bg-body);
          border: 2px solid var(--glass-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .nav-profile-link:hover .nav-avatar {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .nav-logout-btn {
          width: 38px;
          height: 38px;
          border: none;
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .nav-logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        .login-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          text-decoration: none;
        }
        .nav-cta {
          font-size: 0.85rem;
          font-weight: 800;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
        }
        
        .mobile-toggle {
          padding: 4px;
          border-radius: 8px;
          background: rgba(0,0,0,0.03);
        }
      `}</style>
    </div>
  );
};

export default Navigation;
