import React, { useState } from "react";
import { Container, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaArrowRight, FaEnvelope, FaLock, FaSparkles, FaShieldAlt, FaRocket } from "react-icons/fa";
import api from "../api";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.2 + i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const checkBoardingStatusAndRedirect = async () => {
    try {
      const res = await api.get("/user/me/");
      const user = res.data;
      if (user.is_boarding_completed) {
        toast.success(`${t("login.welcomeBack")}, ${user.first_name || "Love"}! ❤️`);
        navigate("/dashboard");
      } else {
        toast.info(t("login.setupProfile"));
        navigate("/boarding");
      }
    } catch (error) {
      console.error("Profile check failed", error);
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/token/", {
        username: email,
        password,
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      await checkBoardingStatusAndRedirect();
    } catch (error) {
      toast.error(t("login.invalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email: googleEmail, name, picture } = decoded;
      const res = await api.post("/auth/google/", {
        email: googleEmail,
        name,
        picture,
        google_token: credentialResponse.credential,
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      await checkBoardingStatusAndRedirect();
    } catch (error) {
      console.error(error);
      toast.error(t("login.googleFail"));
    }
  };

  return (
    <Container fluid className="auth-shell">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="auth-wrap"
      >
        <div className="auth-card">
          <Row className="g-0 auth-grid">
            <Col lg={5} className="auth-hero-col d-none d-lg-block">
              <div className="auth-hero">
                <motion.div custom={0} variants={itemVariants} className="auth-badge">
                  <FaSparkles className="text-primary" /> {t("login.heroBadge")}
                </motion.div>
                
                <motion.h1 custom={1} variants={itemVariants} className="auth-hero-title">
                  {t("login.welcome")}
                  <span>{t("login.back")}</span>
                </motion.h1>
                
                <motion.p custom={2} variants={itemVariants} className="auth-hero-copy">
                  {t("login.subtitle")}
                </motion.p>
                
                <div className="auth-feature-list">
                  {[
                    { icon: <FaShieldAlt />, text: t("login.heroPointOne") },
                    { icon: <FaRocket />, text: t("login.heroPointTwo") },
                    { icon: <FaSparkles />, text: t("login.heroPointThree") }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      custom={3 + index} 
                      variants={itemVariants} 
                      className="auth-feature-item"
                    >
                      <div className="auth-feature-icon">{item.icon}</div>
                      <div className="auth-feature-text">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Col>
            
            <Col lg={7}>
              <div className="auth-form-panel">
                <div className="auth-form-top">
                  <span className="auth-kicker">{t("login.signIn")}</span>
                  <h2 className="auth-form-title">{t("login.panelTitle")}</h2>
                  <p className="auth-form-copy">{t("login.panelSubtitle")}</p>
                </div>

                <div className="auth-google-wrap">
                  {GOOGLE_CLIENT_ID ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t("login.googleFail"))}
                      theme={theme === "dark" ? "filled_black" : "outline"}
                      shape="pill"
                      size="large"
                      width="380"
                      logo_alignment="left"
                    />
                  ) : (
                    <div className="small text-muted fw-600">{t("login.googleUnavailable")}</div>
                  )}
                </div>

                <div className="auth-divider">
                  <span>{t("login.orEmail")}</span>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="auth-label">{t("login.emailLabel")}</Form.Label>
                    <div className="auth-input-icon-wrap">
                      <FaEnvelope className="auth-input-icon" />
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="auth-label mb-0">{t("login.passwordLabel")}</Form.Label>
                      <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="auth-switch-link">
                        {t("login.forgot")}
                      </Link>
                    </div>
                    <div className="auth-input-icon-wrap">
                      <FaLock className="auth-input-icon" />
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" disabled={loading} className="btn-primary auth-submit-btn w-100">
                    {loading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        {t("login.signIn")} <FaArrowRight className="ms-2" size={14} />
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-switch-copy">
                  {t("login.noAccount")}{" "}
                  <Link to="/register" className="auth-switch-link">
                    {t("login.getStarted")}
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </motion.div>
    </Container>
  );
};

export default Login;
