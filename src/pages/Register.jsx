import React, { useState } from "react";
import { Container, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaArrowRight, FaEnvelope, FaLock, FaUser, FaSparkles, FaShieldAlt, FaRocket } from "react-icons/fa";
import api from "../api";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register/", formData);
      toast.success(t("register.success"));
      navigate("/login");
    } catch (error) {
      toast.error(t("register.fail"));
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
              <div className="auth-hero" style={{ background: 'linear-gradient(165deg, #0e7490 0%, #155e75 100%)' }}>
                <motion.div custom={0} variants={itemVariants} className="auth-badge">
                  <FaSparkles className="text-info" /> {t("register.heroBadge")}
                </motion.div>
                
                <motion.h1 custom={1} variants={itemVariants} className="auth-hero-title">
                  {t("register.joinThe")}
                  <span style={{ background: 'linear-gradient(135deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text' }}>{t("register.future")}</span>
                </motion.h1>
                
                <motion.p custom={2} variants={itemVariants} className="auth-hero-copy">
                  {t("register.subtitle")}
                </motion.p>
                
                <div className="auth-feature-list">
                  {[
                    { icon: <FaShieldAlt />, text: t("register.heroPointOne") },
                    { icon: <FaRocket />, text: t("register.heroPointTwo") },
                    { icon: <FaSparkles />, text: t("register.heroPointThree") }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      custom={3 + index} 
                      variants={itemVariants} 
                      className="auth-feature-item"
                    >
                      <div className="auth-feature-icon" style={{ background: 'rgba(34, 211, 238, 0.15)', color: '#22d3ee' }}>{item.icon}</div>
                      <div className="auth-feature-text">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Col>
            
            <Col lg={7}>
              <div className="auth-form-panel">
                <div className="auth-form-top">
                  <span className="auth-kicker">{t("register.startFree")}</span>
                  <h2 className="auth-form-title">{t("register.panelTitle")}</h2>
                  <p className="auth-form-copy">{t("register.panelSubtitle")}</p>
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
                    <Form.Label className="auth-label">{t("register.fullName")}</Form.Label>
                    <div className="auth-input-icon-wrap">
                      <FaUser className="auth-input-icon" />
                      <Form.Control
                        name="name"
                        placeholder="e.g. Salman Khan"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="auth-label">{t("register.emailLabel")}</Form.Label>
                    <div className="auth-input-icon-wrap">
                      <FaEnvelope className="auth-input-icon" />
                      <Form.Control
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="auth-label">{t("register.passwordLabel")}</Form.Label>
                    <div className="auth-input-icon-wrap">
                      <FaLock className="auth-input-icon" />
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder={t("register.passwordPlaceholder")}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" disabled={loading} className="btn-primary auth-submit-btn w-100">
                    {loading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        {t("register.startFree")} <FaArrowRight className="ms-2" size={14} />
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-switch-copy">
                  {t("register.alreadyMember")}{" "}
                  <Link to="/login" className="auth-switch-link">
                    {t("register.signIn")}
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

export default Register;
