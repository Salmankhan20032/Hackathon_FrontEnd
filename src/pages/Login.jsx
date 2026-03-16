import React, { useState } from "react";
import { Container, Card, Form, Button, Spinner, Row, Col, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaArrowRight, FaCheckCircle, FaLock, FaStar } from "react-icons/fa";
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
    <Container fluid className="auth-shell py-4 py-lg-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-wrap"
      >
        <Card className="auth-card border-0">
          <Row className="g-0 auth-grid">
            <Col lg={5} className="auth-hero-col">
              <div className="auth-hero">
                <Badge className="auth-badge">
                  <FaStar size={12} /> {t("login.heroBadge")}
                </Badge>
                <h1 className="auth-hero-title">
                  {t("login.welcome")} <span>{t("login.back")}</span>
                </h1>
                <p className="auth-hero-copy">{t("login.subtitle")}</p>
                <div className="auth-feature-list">
                  {[t("login.heroPointOne"), t("login.heroPointTwo"), t("login.heroPointThree")].map((item) => (
                    <div key={item} className="auth-feature-item">
                      <FaCheckCircle size={14} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="auth-hero-footer">
                  <div className="auth-hero-metric">
                    <strong>24/7</strong>
                    <span>{t("login.metricOne")}</span>
                  </div>
                  <div className="auth-hero-metric">
                    <strong>AI</strong>
                    <span>{t("login.metricTwo")}</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={7}>
              <Card.Body className="auth-form-panel">
                <div className="auth-form-top">
                  <div>
                    <span className="auth-kicker">{t("login.signIn")}</span>
                    <h2 className="auth-form-title">{t("login.panelTitle")}</h2>
                    <p className="auth-form-copy">{t("login.panelSubtitle")}</p>
                  </div>
                  <div className="auth-lock-chip">
                    <FaLock size={14} />
                    <span>{t("login.secureLabel")}</span>
                  </div>
                </div>

                <div className="auth-google-wrap">
                  {GOOGLE_CLIENT_ID ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t("login.googleFail"))}
                      theme={theme === "dark" ? "filled_black" : "outline"}
                      shape="pill"
                      size="large"
                      width="350"
                      logo_alignment="left"
                    />
                  ) : (
                    <div className="small text-muted fw-600">{t("login.googleUnavailable")}</div>
                  )}
                </div>

                <div className="auth-divider">
                  <span>{t("login.orEmail")}</span>
                </div>

                <Form onSubmit={handleSubmit} className="auth-form-fields">
                  <Form.Group>
                    <Form.Label className="auth-label">{t("login.emailLabel")}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="auth-label mb-0">{t("login.passwordLabel")}</Form.Label>
                      <Link to="/forgot-password" className="auth-inline-link">
                        {t("login.forgot")}
                      </Link>
                    </div>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? <Spinner size="sm" animation="grow" /> : <>{t("login.signIn")} <FaArrowRight size={12} /></>}
                  </Button>
                </Form>

                <div className="auth-switch-copy">
                  {t("login.noAccount")}{" "}
                  <Link to="/register" className="auth-inline-link fw-800">
                    {t("login.getStarted")}
                  </Link>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;
