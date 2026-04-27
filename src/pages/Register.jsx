import React, { useState } from "react";
import { Container, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { 
  FaArrowRight, 
  FaEnvelope, 
  FaLock, 
  FaUser,
  FaRocket, 
  FaChartLine, 
  FaUserShield,
  FaCompass 
} from "react-icons/fa";
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + i * 0.1, duration: 0.5 }
    })
  };

  const checkBoardingStatusAndRedirect = async () => {
    try {
      const res = await api.get("/user/me/");
      const user = res.data;
      if (user.is_boarding_completed) {
        toast.success(`${t("login.welcomeBack") || "Welcome back"}, ${user.first_name || "Love"}! ❤️`);
        navigate("/dashboard", { replace: true });
      } else {
        toast.info(t("login.setupProfile") || "Please complete your profile.");
        navigate("/boarding", { replace: true });
      }
    } catch (error) {
      console.error("Profile check failed", error);
      navigate("/dashboard", { replace: true });
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
      toast.success(t("register.success") || "Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(t("register.fail") || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
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
      toast.error(t("login.googleFail") || "Google sign-in failed");
    } finally {
      setLoading(false);
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
            <Col lg={6} className="auth-hero-col d-none d-lg-block">
              <div className="auth-hero" style={{ background: 'linear-gradient(165deg, #0e7490 0%, #155e75 100%)' }}>
                <div className="auth-compass-container">
                  <div className="auth-compass-glow" style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)' }}></div>
                  <FaCompass size={400} style={{ color: 'rgba(255,255,255,0.05)' }} />
                </div>

                <motion.div custom={0} variants={itemVariants} className="auth-badge">
                   ✨ {t("register.heroBadge") || "Join the Future"}
                </motion.div>
                
                <motion.h1 custom={1} variants={itemVariants} className="auth-hero-title">
                  {t("register.joinThe") || "Join the"}
                  <span style={{ background: 'linear-gradient(135deg, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text' }}>{t("register.future") || "Community"}</span>
                </motion.h1>
                
                <motion.p custom={2} variants={itemVariants} className="auth-hero-copy">
                  {t("register.subtitle") || "Create your account and start your journey with EverydayLife today."}
                </motion.p>
                
                <div className="auth-feature-list">
                  {[
                    { 
                      icon: <FaRocket />, 
                      title: t("register.heroPointOneTitle") || "Fast & Easy",
                      desc: t("register.heroPointOneDesc") || "Set up your profile in minutes and start exploring."
                    },
                    { 
                      icon: <FaChartLine />, 
                      title: t("register.heroPointTwoTitle") || "Global Reach",
                      desc: t("register.heroPointTwoDesc") || "Access opportunities from all over the world."
                    },
                    { 
                      icon: <FaUserShield />, 
                      title: t("register.heroPointThreeTitle") || "Secure Data",
                      desc: t("register.heroPointThreeDesc") || "Your privacy is our top priority. We use industry standards."
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      custom={3 + index} 
                      variants={itemVariants} 
                      className="auth-feature-item"
                    >
                      <div className="auth-feature-icon" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#22d3ee' }}>{item.icon}</div>
                      <div className="auth-feature-content">
                        <div className="auth-feature-text-main">{item.title}</div>
                        <div className="auth-feature-text-sub">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="auth-form-panel">
                <div className="auth-form-top">
                  <div className="auth-lock-icon">
                    <FaUser />
                  </div>
                  <span className="auth-kicker">{t("register.startFree") || "START FOR FREE"}</span>
                  <h2 className="auth-form-title">{t("register.panelTitle") || "Create your account"}</h2>
                  <p className="auth-form-copy">{t("register.panelSubtitle") || "Join thousands of users and take control of your career journey."}</p>
                </div>

                <div className="auth-google-wrap">
                  {GOOGLE_CLIENT_ID ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error(t("login.googleFail") || "Google sign-in failed")}
                        theme={theme === "dark" ? "filled_black" : "outline"}
                        shape="pill"
                        size="large"
                        width="100%"
                        logo_alignment="left"
                      />
                    </div>
                  ) : (
                    <div className="text-center small text-muted fw-600">{t("login.googleUnavailable") || "Google login unavailable"}</div>
                  )}
                </div>

                <div className="auth-divider">
                  <span>{t("login.orEmail") || "OR"}</span>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="auth-label">{t("register.fullName") || "Full Name"}</Form.Label>
                    <div className="auth-input-wrapper">
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
                    <Form.Label className="auth-label">{t("register.emailLabel") || "Email Address"}</Form.Label>
                    <div className="auth-input-wrapper">
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
                    <Form.Label className="auth-label">{t("register.passwordLabel") || "Password"}</Form.Label>
                    <div className="auth-input-wrapper">
                      <FaLock className="auth-input-icon" />
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder={t("register.passwordPlaceholder") || "Create a password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </Form.Group>

                  <Button type="submit" disabled={loading} className="auth-submit-btn w-100">
                    {loading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        {t("register.startFree") || "Get Started"} <FaArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-footer">
                  {t("register.alreadyMember") || "Already have an account?"}{" "}
                  <Link to="/login" className="auth-switch-link">
                    {t("register.signIn") || "Sign In"}
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
