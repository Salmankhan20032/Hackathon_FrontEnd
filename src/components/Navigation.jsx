import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button, Offcanvas } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaMoon,
  FaSun,
  FaGlobeAmericas,
  FaBars,
  FaThLarge,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import NotificationCenter from "./NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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
    <div className={`nav-island-container ${scrolled ? 'island-scrolled' : ''}`}>
      <motion.nav 
        initial={false}
        animate={{
          width: scrolled ? "92%" : "96%",
          y: scrolled ? 15 : 25,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="nav-island"
      >
        <Container fluid className="px-4 h-100 d-flex align-items-center justify-content-between">
          {/* BRAND/LOGO */}
          <Link to={token ? "/dashboard" : "/login"} className="island-brand">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="island-logo-wrap"
            >
              <img src={logo} alt="Logo" />
            </motion.div>
            <div className="island-brand-text d-none d-md-block">
              Everyday<span>Life</span>
            </div>
          </Link>

          {/* CENTER LINKS (DOCK STYLE) */}
          <div className="d-none d-lg-flex dock-links-wrap">
            {token && (
              <Nav className="dock-nav">
                <NavLinks />
              </Nav>
            )}
          </div>

          {/* ACTIONS WRAP */}
          <div className="island-actions">
            {token ? (
              <div className="d-flex align-items-center gap-2">
                <NotificationCenter />
                
                <div className="v-sep"></div>
                
                <div className="action-buttons-group">
                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLanguage} 
                    className="island-icon-btn"
                  >
                    <FaGlobeAmericas />
                    <span className="lang-tag">{language.toUpperCase()}</span>
                  </motion.button>

                  <motion.button 
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme} 
                    className="island-icon-btn"
                  >
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                  </motion.button>
                </div>

                <div className="v-sep d-none d-sm-block"></div>

                <Link to="/profile" className="island-profile-link">
                  <div className="island-avatar">
                    <FaUser />
                  </div>
                </Link>

                <button className="mobile-toggle-island d-lg-none" onClick={() => setShowMobile(true)}>
                  <FaThLarge />
                </button>

                <div className="v-sep d-none d-lg-block"></div>

                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={handleLogout} 
                  className="island-logout-btn"
                >
                  <FaSignOutAlt />
                </motion.button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <button onClick={toggleLanguage} className="island-icon-btn">
                  <FaGlobeAmericas />
                  <span className="lang-tag">{language.toUpperCase()}</span>
                </button>
                <button onClick={toggleTheme} className="island-icon-btn me-2">
                  {theme === "light" ? <FaMoon /> : <FaSun />}
                </button>
                <Link to="/login" className="island-login-link d-none d-sm-block">{t("nav.login")}</Link>
                <Button as={Link} to="/register" className="island-cta">{t("nav.joinNow")}</Button>
              </div>
            )}
          </div>
        </Container>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="end" className="island-offcanvas">
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
                   <button onClick={toggleTheme} className="island-icon-btn flex-grow-1 border p-3 rounded-4">
                      {theme === "light" ? <><FaMoon className="me-2" /> Dark</> : <><FaSun className="me-2" /> Light</>}
                   </button>
                </div>
                <Button variant="danger" className="mt-5 rounded-4 p-3 fw-800 border-0" onClick={handleLogout}>{t("nav.logout")}</Button>
               </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <style>{`
        .nav-island-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        
        .nav-island {
          height: 80px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 40px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
          pointer-events: auto;
          display: flex;
          align-items: center;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        [data-theme='dark'] .nav-island {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .island-brand { display: flex; align-items: center; gap: 15px; text-decoration: none; }
        .island-logo-wrap {
          width: 52px; height: 52px;
          background: #fff;
          border-radius: 20px;
          padding: 2px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .island-logo-wrap img { width: 100%; height: 100%; object-fit: cover; border-radius: 18px; }
        .island-brand-text { font-weight: 950; font-size: 1.4rem; letter-spacing: -0.06em; color: var(--text-main); }
        .island-brand-text span { color: var(--accent-primary); }

        .dock-links-wrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .dock-nav {
          background: rgba(0, 0, 0, 0.04);
          padding: 6px;
          border-radius: 100px;
          display: flex;
          gap: 5px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }
        [data-theme='dark'] .dock-nav { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.05); }

        .dock-nav .nav-link {
          font-weight: 800; font-size: 0.88rem; color: var(--text-muted);
          padding: 10px 22px !important; border-radius: 100px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dock-nav .nav-link:hover { color: var(--text-main); background: rgba(255, 255, 255, 0.5); }
        [data-theme='dark'] .dock-nav .nav-link:hover { background: rgba(255, 255, 255, 0.1); }
        
        .dock-nav .nav-link.active {
          background: #fff; color: var(--accent-primary);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        [data-theme='dark'] .dock-nav .nav-link.active { background: var(--accent-primary); color: #fff; }

        .island-actions { display: flex; align-items: center; }
        .island-icon-btn {
          width: 44px; height: 44px; border-radius: 16px; border: 1px solid transparent;
          background: transparent; color: var(--text-muted); font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center; position: relative;
          transition: all 0.2s ease;
        }
        .island-icon-btn:hover { background: rgba(0,0,0,0.04); color: var(--text-main); }
        [data-theme='dark'] .island-icon-btn:hover { background: rgba(255,255,255,0.08); }
        
        .lang-tag {
          position: absolute; top: -5px; right: -5px; font-size: 0.55rem;
          font-weight: 900; background: var(--accent-primary); color: white;
          padding: 2px 6px; border-radius: 8px; box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }

        .v-sep { width: 1px; height: 36px; background: var(--glass-border); margin: 0 12px; }
        
        .island-avatar {
          width: 48px; height: 48px; border-radius: 20px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 1.3rem; border: 3px solid #fff;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        [data-theme='dark'] .island-avatar { border-color: rgba(255,255,255,0.1); }
        .island-profile-link:hover .island-avatar { transform: rotate(10deg) scale(1.1); }

        .island-logout-btn {
          width: 44px; height: 44px; border: none;
          background: rgba(239, 68, 68, 0.08); color: #ef4444; border-radius: 16px;
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
        }

        .mobile-toggle-island {
          width: 48px; height: 48px; border: none; border-radius: 20px;
          background: var(--bg-card); color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
          margin-left: 10px;
        }

        .island-cta {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          border: none !important; border-radius: 100px !important;
          padding: 12px 30px !important; font-weight: 900 !important;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4) !important;
        }
        .island-login-link { font-weight: 800; color: var(--text-main); text-decoration: none; margin-right: 20px; }

        .island-offcanvas { background: var(--bg-card); backdrop-filter: blur(30px); border-radius: 35px 0 0 35px !important; border: none !important; }
        .island-offcanvas .nav-link { font-weight: 900; font-size: 1.5rem; color: var(--text-main); padding: 20px 0; border-bottom: 1px solid var(--glass-border); }
        .island-offcanvas .nav-link.active { color: var(--accent-primary); }

        @media (max-width: 991px) {
          .nav-island { height: 70px; }
          .island-logo-wrap { width: 44px; height: 44px; }
          .v-sep { margin: 0 8px; }
          .island-avatar { width: 40px; height: 40px; font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
};

export default Navigation;
