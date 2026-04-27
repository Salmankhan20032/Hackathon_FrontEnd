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
  FaRocket, 
  FaChartLine, 
  FaUserShield,
  FaCompass 
} from "react-icons/fa";
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
      toast.error(t("login.invalid") || "Invalid credentials");
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
      
      // Automatic move to home screen
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
              <div className="auth-hero">
                <div className="auth-compass-container">
                  <div className="auth-compass-glow"></div>
                  <FaCompass size={400} style={{ color: 'rgba(255,255,255,0.05)' }} />
                </div>

                <motion.div custom={0} variants={itemVariants} className="auth-badge">
                   🚀 {t("login.heroBadge") || "Career Cockpit"}
                </motion.div>
                
                <motion.h1 custom={1} variants={itemVariants} className="auth-hero-title">
                  {t("login.welcome") || "Welcome"}
                  <span>{t("login.back") || "Back"}</span>
                </motion.h1>
                
                <motion.p custom={2} variants={itemVariants} className="auth-hero-copy">
                  {t("login.subtitle") || "Log in to your intelligent life assistant."}
                </motion.p>
                
                <div className="auth-feature-list">
                  {[
                    { 
                      icon: <FaRocket />, 
                      title: t("login.heroPointOneTitle") || "Track opportunities",
                      desc: t("login.heroPointOneDesc") || "Internships, jobs, and local opportunities in one place."
                    },
                    { 
                      icon: <FaChartLine />, 
                      title: t("login.heroPointTwoTitle") || "Your progress, everywhere",
                      desc: t("login.heroPointTwoDesc") || "Continue from where you left off, across every device."
                    },
                    { 
                      icon: <FaUserShield />, 
                      title: t("login.heroPointThreeTitle") || "Seamless & secure",
                      desc: t("login.heroPointThreeDesc") || "One click sign-in with Google or email—your data stays safe."
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      custom={3 + index} 
                      variants={itemVariants} 
                      className="auth-feature-item"
                    >
                      <div className="auth-feature-icon">{item.icon}</div>
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
                    <FaLock />
                  </div>
                  <span className="auth-kicker">{t("login.signIn") || "SIGN IN"}</span>
                  <h2 className="auth-form-title">{t("login.panelTitle") || "Sign in to your workspace"}</h2>
                  <p className="auth-form-copy">{t("login.panelSubtitle") || "Pick up your roadmap, saved jobs, and active missions where you left them."}</p>
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
                    <Form.Label className="auth-label">{t("login.emailLabel") || "Email Address"}</Form.Label>
                    <div className="auth-input-wrapper">
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
                      <Form.Label className="auth-label mb-0">{t("login.passwordLabel") || "Password"}</Form.Label>
                      <Link to="/forgot-password" title="Forgot Password" className="auth-forgot-link">
                        {t("login.forgot") || "Forgot password?"}
                      </Link>
                    </div>
                    <div className="auth-input-wrapper">
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

                  <div className="d-flex align-items-center mb-4">
                    <Form.Check 
                      type="checkbox" 
                      id="remember-me" 
                      label={t("login.rememberMe") || "Remember me"} 
                      className="auth-checkbox"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="auth-submit-btn w-100">
                    {loading ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <>
                        {t("login.signIn") || "Sign In"} <FaArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </Form>

                <div className="auth-footer">
                  {t("login.noAccount") || "Don't have an account?"}{" "}
                  <Link to="/register" className="auth-switch-link">
                    {t("login.getStarted") || "Get Started for Free"}
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
