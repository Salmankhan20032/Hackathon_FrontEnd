import React, { useState } from "react";
import { Container, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  User,
  Rocket, 
  LineChart, 
  ShieldCheck,
  Compass 
} from "lucide-react";
import api from "../api";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register/", formData);
      toast.success(t("register.success"));
      navigate("/login");
    } catch (err) {
      toast.error(t("register.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google/", { token: credentialResponse.credential });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      toast.success("Google Register Success!");
      navigate("/boarding");
    } catch (err) {
      toast.error("Google Registration Failed");
    }
  };

  return (
    <div className="auth-page premium-design">
      <Row className="g-0 min-vh-100">
        {/* LEFT PANEL: HERO */}
        <Col lg={6} className="d-none d-lg-flex auth-hero-panel">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hero-content"
          >
             <div className="floating-icons">
               <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="f-icon"><Rocket size={40} /></motion.div>
               <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="f-icon secondary"><LineChart size={30} /></motion.div>
            </div>

            <div className="auth-logo-large">
               <Compass size={80} />
            </div>
            <h1 className="hero-title mt-4">
              Start Your <br /> <span className="gradient-text">Future.</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands of students and professionals in the world's most advanced neural career platform.
            </p>

            <div className="auth-features mt-5">
               <div className="feature-item">
                  <div className="fi-icon"><ShieldCheck /></div>
                  <div className="fi-text">Secure Identity</div>
               </div>
            </div>
          </motion.div>
          <div className="hero-backdrop-glow"></div>
        </Col>

        {/* RIGHT PANEL: FORM */}
        <Col lg={6} className="auth-form-panel d-flex align-items-center justify-content-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-card"
          >
            <div className="text-center mb-5">
              <h2 className="fw-900">{t("register.title")}</h2>
              <p className="text-muted fw-600">{t("register.subtitle")}</p>
            </div>

            <div className="google-auth-wrapper mb-4">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google register error")}
                  theme={theme === 'dark' ? 'filled_black' : 'outline'}
                  shape="pill"
                  width="100%"
               />
            </div>

            <div className="auth-separator mb-4">
               <span>{t("register.orEmail")}</span>
            </div>

            <Form onSubmit={handleRegister}>
              <Form.Group className="custom-input-group mb-4">
                <div className="input-icon"><User size={18} /></div>
                <Form.Control
                  type="text"
                  placeholder={t("register.namePlaceholder")}
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="custom-input-group mb-4">
                <div className="input-icon"><Mail size={18} /></div>
                <Form.Control
                  type="email"
                  placeholder={t("register.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="custom-input-group mb-4">
                <div className="input-icon"><Lock size={18} /></div>
                <Form.Control
                  type="password"
                  placeholder={t("register.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="auth-btn w-100"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <span>{t("register.btn")}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </Form>

            <div className="text-center mt-5">
              <p className="mb-0 text-muted fw-600">
                {t("register.alreadyAccount")}{" "}
                <Link to="/login" className="auth-link-alt">
                  {t("register.loginLink")}
                </Link>
              </p>
            </div>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Register;
