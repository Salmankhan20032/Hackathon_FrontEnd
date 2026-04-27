import React, { useState, useEffect } from "react";
import { Navbar, Container, Nav, Button, Offcanvas } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  GraduationCap, 
  Briefcase, 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  Languages, 
  Menu
} from "lucide-react";
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
        <Home size={18} className="nav-icon-lucide" /> {t("nav.home")}
      </Nav.Link>
      <Nav.Link as={Link} to="/internships" className={isActive("/internships") ? "active" : ""} onClick={() => setShowMobile(false)}>
        <GraduationCap size={18} className="nav-icon-lucide" /> {t("nav.intern")}
      </Nav.Link>
      <Nav.Link as={Link} to="/jobs" className={isActive("/jobs") ? "active" : ""} onClick={() => setShowMobile(false)}>
        <Briefcase size={18} className="nav-icon-lucide" /> {t("nav.jobs")}
      </Nav.Link>
      <Nav.Link as={Link} to="/marketplace" className={isActive("/marketplace") ? "active" : ""} onClick={() => setShowMobile(false)}>
        <ShoppingBag size={18} className="nav-icon-lucide" /> {t("nav.market")}
      </Nav.Link>
      <Nav.Link as={Link} to="/discounts" className={isActive("/discounts") ? "active" : ""} onClick={() => setShowMobile(false)}>
        <MapPin size={18} className="nav-icon-lucide" /> {t("nav.local")}
      </Nav.Link>
    </>
  );

  return (
    <div className={`navigation-shell ${scrolled ? 'is-scrolled' : ''}`}>
      <Navbar expand="lg" className="premium-navbar">
        <Container fluid className="px-lg-5">
          {/* BRAND */}
          <Navbar.Brand as={Link} to={token ? "/dashboard" : "/login"} className="brand-group">
            <div className="brand-logo-container">
              <img src={logo} alt="Logo" />
            </div>
            <div className="brand-name d-none d-sm-block">
              Skill<span>X</span>
            </div>
          </Navbar.Brand>

          {/* DESKTOP NAV */}
          <div className="d-none d-lg-flex mx-auto">
            {token && (
              <Nav className="navbar-links-group">
                <NavLinks />
              </Nav>
            )}
          </div>

          {/* ACTIONS */}
          <div className="actions-group">
            {token ? (
              <div className="d-flex align-items-center gap-2">
                <div className="util-buttons">
                  <NotificationCenter />
                  
                  <button onClick={toggleLanguage} className="util-btn" title="Language">
                    <Languages size={20} />
                    <span className="lang-indicator">{language.toUpperCase()}</span>
                  </button>

                  <button onClick={toggleTheme} className="util-btn" title="Theme">
                    {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                  </button>

                  <Link to="/profile" className="profile-btn">
                    <User size={20} />
                  </Link>
                </div>

                <button className="mobile-toggle-btn d-lg-none" onClick={() => setShowMobile(true)}>
                  <Menu size={24} />
                </button>

                <div className="action-divider"></div>

                <button onClick={handleLogout} className="logout-btn-lucide" title={t("nav.logout")}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                 <button onClick={toggleLanguage} className="util-btn">
                  <Languages size={20} />
                  <span className="lang-indicator">{language.toUpperCase()}</span>
                </button>
                <button onClick={toggleTheme} className="util-btn me-2">
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <Link to="/login" className="login-text-btn d-none d-sm-block">{t("nav.login")}</Link>
                <Button as={Link} to="/register" className="join-cta-btn">{t("nav.joinNow")}</Button>
              </div>
            )}
          </div>

          {/* MOBILE MENU */}
          <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} placement="end" className="mobile-drawer-lucide">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="fw-900 fs-4">Skill<span>X</span></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column gap-3 mb-5">
                <NavLinks />
                {token && (
                   <>
                    <hr className="opacity-10" />
                    <Nav.Link as={Link} to="/profile" onClick={() => setShowMobile(false)}><User size={18} className="me-2" /> {t("profile.title")}</Nav.Link>
                    <div className="d-flex gap-2 mt-3">
                       <button onClick={toggleTheme} className="util-btn flex-grow-1 border p-3 rounded-4">
                          {theme === "light" ? <><Moon size={18} className="me-2" /> Dark</> : <><Sun size={18} className="me-2" /> Light</>}
                       </button>
                    </div>
                    <Button variant="danger" className="mt-5 rounded-4 p-3 fw-800 border-0" onClick={handleLogout}><LogOut size={18} className="me-2" /> {t("nav.logout")}</Button>
                   </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

        </Container>
      </Navbar>

      <style>{`
        .navigation-shell {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        
        .is-scrolled {
          padding: 10px 0;
        }

        .premium-navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          padding: 12px 0;
          transition: all 0.3s ease;
        }
        
        .is-scrolled .premium-navbar {
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          background: rgba(255, 255, 255, 0.9);
        }
        [data-theme='dark'] .is-scrolled .premium-navbar {
          background: rgba(15, 23, 42, 0.9);
        }

        .brand-group { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-logo-container {
          width: 44px; height: 44px;
          background: #fff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .brand-logo-container img { width: 100%; height: 100%; object-fit: cover; }
        
        .brand-name { font-weight: 950; font-size: 1.4rem; letter-spacing: -0.04em; color: var(--text-main); }
        .brand-name span { color: var(--accent-primary); }

        .navbar-links-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .navbar-links-group .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-muted);
          padding: 10px 20px !important;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .navbar-links-group .nav-link:hover {
          color: var(--text-main);
          background: rgba(0,0,0,0.03);
        }
        [data-theme='dark'] .navbar-links-group .nav-link:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .navbar-links-group .nav-link.active {
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.08);
        }

        .actions-group { display: flex; align-items: center; gap: 8px; }
        
        .util-buttons { display: flex; align-items: center; gap: 6px; }
        
        .util-btn {
          width: 42px; height: 42px; border-radius: 12px; border: 1px solid transparent;
          background: transparent; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          position: relative; transition: all 0.2s ease;
        }
        .util-btn:hover { background: rgba(0,0,0,0.03); color: var(--text-main); }
        [data-theme='dark'] .util-btn:hover { background: rgba(255,255,255,0.05); }
        
        .lang-indicator {
          position: absolute; top: -2px; right: -2px; font-size: 0.5rem;
          font-weight: 900; background: var(--accent-primary); color: white;
          padding: 1px 4px; border-radius: 4px;
        }

        .action-divider { width: 1px; height: 24px; background: var(--glass-border); margin: 0 8px; }
        
        .profile-btn {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex; align-items: center; justify-content: center;
          color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          transition: all 0.2s ease;
        }
        .profile-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3); }

        .logout-btn-lucide {
          width: 42px; height: 42px; border-radius: 12px; border: none;
          background: rgba(239, 68, 68, 0.08); color: #ef4444;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .logout-btn-lucide:hover { background: #ef4444; color: white; }

        .mobile-toggle-btn {
          width: 42px; height: 42px; border-radius: 12px; border: none;
          background: var(--bg-card); color: var(--text-main);
          display: flex; align-items: center; justify-content: center;
        }

        .mobile-drawer-lucide { background: var(--bg-card); border-radius: 24px 0 0 24px !important; }
        
        .join-cta-btn {
          background: var(--accent-primary) !important; border: none !important;
          font-weight: 800; border-radius: 12px !important; padding: 10px 24px !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2) !important;
        }
        
        .login-text-btn { font-weight: 700; color: var(--text-main); text-decoration: none; margin-right: 8px; }

        @media (max-width: 991px) {
          .navigation-shell { padding: 10px 0; }
        }
      `}</style>
    </div>
  );
};

export default Navigation;
