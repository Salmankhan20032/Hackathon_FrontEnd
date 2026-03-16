import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaHome,
  FaGraduationCap,
  FaStore,
  FaBriefcase,
  FaMapMarkerAlt,
  FaLanguage,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import NotificationCenter from "./NotificationCenter";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

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

  const navLinkStyle = (path) => {
    const active = isActive(path);
    return {
      fontWeight: 800,
      fontSize: "0.85rem",
      letterSpacing: "0.05em",
      padding: "8px 18px",
      borderRadius: "50rem",
      background: active ? "var(--glass-bg)" : "transparent",
      backdropFilter: active ? "blur(15px)" : "none",
      WebkitBackdropFilter: active ? "blur(15px)" : "none",
      border: active
        ? "1px solid var(--glass-border)"
        : "1px solid transparent",
      boxShadow: active ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
      color: active ? "var(--text-main)" : "var(--text-muted)",
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    };
  };

  const utilityButtonStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "16px",
    background: "var(--nav-utility-bg)",
    border: "1px solid var(--nav-utility-border)",
    color: "var(--text-main)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  };

  const renderLanguageControl = () => (
    <Button
      variant="link"
      onClick={toggleLanguage}
      className="nav-language-toggle border-0 text-decoration-none"
      title={language === "en" ? "Switch to Turkish" : "Switch to English"}
    >
      <span className="nav-language-icon">
        <FaLanguage size={14} />
      </span>
      <span className="nav-language-copy">
        <span className="nav-language-label">Language</span>
        <span className="nav-language-value">
          <span className={language === "en" ? "is-active" : ""}>EN</span>
          <span className="nav-language-separator">/</span>
          <span className={language === "tr" ? "is-active" : ""}>TR</span>
        </span>
      </span>
    </Button>
  );

  return (
    <div
      className="w-100 position-fixed pt-3 px-3 px-md-4"
      style={{ top: 0, zIndex: 1030 }}
    >
      <Navbar
        expand="lg"
        className="py-2 px-4 mx-auto shadow-lg"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(25px) saturate(200%)",
          border: "1px solid var(--glass-border)",
          borderRadius: "100px",
          maxWidth: "1200px",
        }}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to={token ? "/dashboard" : "/login"}
            className="fw-900 d-flex align-items-center gap-2 me-4"
            style={{ fontSize: "1.4rem" }}
          >
            <img
              src="/logo.png"
              alt="SkillX Logo"
              style={{ width: "36px", height: "36px", objectFit: "contain" }}
            />
            <span>
              <span className="text-main">Skill</span>
              <span className="text-gradient">X</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="main-nav"
            className="border-0 shadow-none"
          >
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>

          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto align-items-center gap-1">
              {token ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/dashboard"
                    style={navLinkStyle("/dashboard")}
                    className="text-uppercase"
                  >
                    <FaHome size={14} /> {t("nav.home")}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/internships"
                    style={navLinkStyle("/internships")}
                    className="text-uppercase"
                  >
                    <FaGraduationCap size={14} /> {t("nav.intern")}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/jobs"
                    style={navLinkStyle("/jobs")}
                    className="text-uppercase"
                  >
                    <FaBriefcase size={14} /> {t("nav.jobs")}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/marketplace"
                    style={navLinkStyle("/marketplace")}
                    className="text-uppercase"
                  >
                    <FaStore size={14} /> {t("nav.market")}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/discounts"
                    style={navLinkStyle("/discounts")}
                    className="text-uppercase"
                  >
                    <FaMapMarkerAlt size={14} /> {t("nav.local")}
                  </Nav.Link>

                  <div
                    className="vr mx-2 opacity-25 d-none d-lg-block"
                    style={{ height: "24px" }}
                  ></div>

                  <NotificationCenter />

                  {renderLanguageControl()}

                  <Button
                    variant="link"
                    onClick={toggleTheme}
                    className="border-0 p-2 d-flex align-items-center justify-content-center"
                    title="Toggle Theme"
                    style={utilityButtonStyle}
                  >
                    {theme === "light" ? (
                      <FaMoon size={16} />
                    ) : (
                      <FaSun size={16} />
                    )}
                  </Button>

                  <Nav.Link as={Link} to="/profile" className="p-0 ms-1">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "38px",
                        height: "38px",
                        background:
                          "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                      }}
                    >
                      <FaUserCircle size={20} className="text-white" />
                    </div>
                  </Nav.Link>

                  <Button
                    variant="link"
                    size="sm"
                    className="ms-2 p-0 d-flex align-items-center justify-content-center border-0"
                    onClick={handleLogout}
                    title={t("nav.logout")}
                    style={{
                      ...utilityButtonStyle,
                      width: "42px",
                      height: "42px",
                      borderRadius: "16px",
                      background: "rgba(220, 38, 38, 0.08)",
                      color: "#dc3545",
                    }}
                  >
                    <FaSignOutAlt size={14} />
                  </Button>
                </>
              ) : (
                <>
                  {renderLanguageControl()}

                  <Button
                    variant="link"
                    onClick={toggleTheme}
                    className="border-0 p-2 me-2 d-flex align-items-center justify-content-center"
                    style={utilityButtonStyle}
                  >
                    {theme === "light" ? (
                      <FaMoon size={16} />
                    ) : (
                      <FaSun size={16} />
                    )}
                  </Button>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    className="fw-800 text-main"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {t("nav.login")}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="p-0 ms-2">
                    <Button
                      className="rounded-pill px-4 fw-800 launch-btn border-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {t("nav.joinNow")}
                    </Button>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Navigation;
