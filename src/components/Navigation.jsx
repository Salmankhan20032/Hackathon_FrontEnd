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
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import NotificationCenter from "./NotificationCenter";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

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
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="brand-logo"
            >
              <img src={logo} alt="EverydayLife Logo" />
            </motion.div>
            <div className="brand-text d-none d-sm-block">
              Everyday<span>Life</span>
            </div>
          </Navbar.Brand>

          {/* DESKTOP LINKS (CENTERED PILL) */}
          <div className="d-none d-lg-flex mx-auto align-items-center">
             {token && (
               <Nav className="nav-links-center-pill">
                 <NavLinks />
               </Nav>
             )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="nav-actions">
            {token ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <NotificationCenter />
                  
                  <div className="utility-sep d-none d-md-block"></div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLanguage} 
                    className="nav-icon-btn-v2" 
                    title="Toggle Language"
                  >
                    <FaGlobeAmericas />
                    <span className="lang-code-v2">{language.toUpperCase()}</span>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme} 
                    className="nav-icon-btn-v2" 
                    title="Toggle Theme"
                  >
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                  </motion.button>

                  <Link to="/profile" className="nav-profile-trigger">
                    <div className="nav-avatar-v2">
                      <FaUser />
                    </div>
                  </Link>
                </div>

                <button className="mobile-toggle-v2 d-lg-none ms-2" onClick={() => setShowMobile(true)}>
                  <FaBars />
                </button>

                <div className="utility-sep d-none d-lg-block"></div>

                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: 'white' }}
                  onClick={handleLogout} 
                  className="nav-logout-btn-v2" 
                  title={t("nav.logout")}
                >
                  <FaSignOutAlt />
                </motion.button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-3">
                 <button onClick={toggleLanguage} className="nav-icon-btn-v2">
                  <FaGlobeAmericas />
                  <span className="lang-code-v2">{language.toUpperCase()}</span>
                </button>
                <button onClick={toggleTheme} className="nav-icon-btn-v2 me-2">
                  {theme === "light" ? <FaMoon /> : <FaSun />}
                </button>
                <Link to="/login" className="login-link-v2 d-none d-sm-block me-1">{t("nav.login")}</Link>
                <Button as={Link} to="/register" className="btn-primary-v2 rounded-pill px-4">{t("nav.joinNow")}</Button>
              </div>
            )}
          </div>

          {/* MOBILE MENU (OFFCANVAS) */}
          <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="end" className="premium-offcanvas">
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
                       <button onClick={toggleTheme} className="nav-icon-btn-v2 flex-grow-1 border p-3 rounded-4">
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
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-scrolled {
          padding: 12px 0;
        }
        .nav-scrolled .main-navbar {
           background: rgba(255, 255, 255, 0.85);
           box-shadow: 0 15px 40px rgba(0,0,0,0.08);
           margin: 0 20px;
        }
        [data-theme='dark'] .nav-scrolled .main-navbar {
           background: rgba(15, 23, 42, 0.85);
        }

        .main-navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          margin: 0 40px;
          padding: 12px 0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          transition: all 0.4s ease;
        }
        @media (max-width: 991px) {
          .main-navbar { margin: 0 15px; border-radius: 24px; }
          .nav-wrapper { padding: 15px 0; }
        }

        .brand-wrap { display: flex; align-items: center; gap: 14px; text-decoration: none; }
        .brand-logo {
          width: 48px; height: 48px;
          background: #fff;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .brand-logo img { width: 100%; height: 100%; object-fit: cover; }
        
        .brand-text { font-weight: 950; font-size: 1.5rem; letter-spacing: -0.05em; color: var(--text-main); }
        .brand-text span { color: var(--accent-primary); }

        .nav-links-center-pill {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
          padding: 6px !important;
          gap: 4px;
        }
        [data-theme='dark'] .nav-links-center-pill { background: rgba(255, 255, 255, 0.05); }

        .nav-links-center-pill .nav-link {
          font-size: 0.9rem; font-weight: 800; color: var(--text-muted);
          padding: 10px 24px !important; border-radius: 100px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .nav-links-center-pill .nav-link:hover { color: var(--text-main); }
        .nav-links-center-pill .nav-link.active {
          background: #fff; color: var(--accent-primary);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        [data-theme='dark'] .nav-links-center-pill .nav-link.active {
           background: var(--bg-card);
        }

        .nav-actions { display: flex; align-items: center; gap: 10px; }
        
        .nav-icon-btn-v2 {
          width: 44px; height: 44px; border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.5); color: var(--text-muted); border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; transition: all 0.2s ease; position: relative;
        }
        [data-theme='dark'] .nav-icon-btn-v2 { background: rgba(255, 255, 255, 0.05); }
        
        .nav-icon-btn-v2:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        
        .lang-code-v2 {
          position: absolute; top: -5px; right: -5px; font-size: 0.55rem;
          font-weight: 900; background: var(--accent-primary); color: white;
          border-radius: 6px; padding: 2px 5px; box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }

        .utility-sep { width: 1px; height: 32px; background: var(--glass-border); margin: 0 8px; }

        .nav-profile-trigger { text-decoration: none; }
        .nav-avatar-v2 {
          width: 44px; height: 44px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: 2px solid #fff; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: white; transition: all 0.3s ease;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        [data-theme='dark'] .nav-avatar-v2 { border-color: var(--glass-border); }
        .nav-profile-trigger:hover .nav-avatar-v2 { transform: scale(1.1) rotate(5deg); }

        .nav-logout-btn-v2 {
          width: 44px; height: 44px; border: none;
          background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 16px;
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .mobile-toggle-v2 {
          width: 44px; height: 44px; border-radius: 14px; border: 1px solid var(--glass-border);
          background: var(--bg-card); color: var(--text-main);
          display: flex; align-items: center; justify-content: center;
        }

        .premium-offcanvas { background: var(--bg-card); backdrop-filter: blur(25px); border-radius: 32px 0 0 32px !important; border: none !important; }
        .premium-offcanvas .nav-link { font-weight: 900; font-size: 1.4rem; color: var(--text-main); padding: 18px 0; border-bottom: 1px solid var(--glass-border); }
        .premium-offcanvas .nav-link.active { color: var(--accent-primary); }
        
        .btn-primary-v2 { 
           background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
           border: none !important; font-weight: 800; font-size: 0.95rem; 
           padding: 12px 28px !important; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3) !important;
           transition: all 0.3s ease !important;
        }
        .btn-primary-v2:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4) !important; }
        
        .login-link-v2 { font-weight: 800; color: var(--text-main); text-decoration: none; font-size: 0.95rem; }
        .login-link-v2:hover { color: var(--accent-primary); }
      `}</style>
    </div>
  );
};

export default Navigation;
