import React, { useState } from "react";
import { Container, Card, Form, Button, Spinner, Row, Col, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FaArrowRight, FaBolt, FaCheckCircle, FaLock, FaUserPlus } from "react-icons/fa";
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
    <Container fluid className="auth-shell py-4 py-lg-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="auth-wrap"
      >
        <Card className="auth-card border-0">
          <Row className="g-0 auth-grid">
            <Col lg={5} className="auth-hero-col">
              <div className="auth-hero auth-hero-register">
                <Badge className="auth-badge">
                  <FaBolt size={12} /> {t("register.heroBadge")}
                </Badge>
                <h1 className="auth-hero-title">
                  {t("register.joinThe")} <span>{t("register.future")}</span>
                </h1>
                <p className="auth-hero-copy">{t("register.subtitle")}</p>
                <div className="auth-feature-list">
                  {[t("register.heroPointOne"), t("register.heroPointTwo"), t("register.heroPointThree")].map((item) => (
                    <div key={item} className="auth-feature-item">
                      <FaCheckCircle size={14} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="auth-hero-footer">
                  <div className="auth-hero-metric">
                    <strong>3</strong>
                    <span>{t("register.metricOne")}</span>
                  </div>
                  <div className="auth-hero-metric">
                    <strong>1</strong>
                    <span>{t("register.metricTwo")}</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={7}>
              <Card.Body className="auth-form-panel">
                <div className="auth-form-top">
                  <div>
                    <span className="auth-kicker">{t("register.startFree")}</span>
                    <h2 className="auth-form-title">{t("register.panelTitle")}</h2>
                    <p className="auth-form-copy">{t("register.panelSubtitle")}</p>
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

                <Form onSubmit={handleSubmit} className="auth-form-fields auth-register-fields">
                  <Form.Group>
                    <Form.Label className="auth-label">{t("register.fullName")}</Form.Label>
                    <Form.Control
                      name="name"
                      placeholder="e.g. Salman Khan"
                      onChange={handleChange}
                      value={formData.name}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="auth-label">{t("register.emailLabel")}</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      onChange={handleChange}
                      value={formData.email}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="auth-label">{t("register.passwordLabel")}</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder={t("register.passwordPlaceholder")}
                      onChange={handleChange}
                      value={formData.password}
                      required
                    />
                  </Form.Group>

                  <div className="auth-terms-copy">{t("register.termsHint")}</div>

                  <Button type="submit" disabled={loading} className="auth-submit-btn">
                    {loading ? <Spinner size="sm" animation="grow" /> : <><FaUserPlus size={13} /> {t("register.startFree")} <FaArrowRight size={12} /></>}
                  </Button>
                </Form>

                <div className="auth-switch-copy">
                  {t("register.alreadyMember")}{" "}
                  <Link to="/login" className="auth-inline-link fw-800">
                    {t("register.signIn")}
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

export default Register;
