import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
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
  Compass,
  Languages,
} from "lucide-react";
import api from "../api";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, language } = useLanguage();

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
      const credential = credentialResponse?.credential;
      if (!credential) {
        throw new Error("Missing Google credential");
      }
      const decoded = jwtDecode(credential);
      const payload = {
        email: decoded?.email || "",
        first_name: decoded?.given_name || decoded?.name || "",
        last_name: decoded?.family_name || "",
        avatar: decoded?.picture || "",
        google_sub: decoded?.sub || "",
        google_token: credential,
      };
      const res = await api.post("/auth/google/", payload);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      toast.success(t("register.success"));
      navigate("/boarding");
    } catch (err) {
      toast.error(t("register.error"));
    }
  };

  return (
    <div className="auth-page auth-page-minimal">
      <div className="auth-min-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="auth-min-card"
        >
          <div className="auth-min-logo">
            <Compass size={24} />
          </div>
          <div className="auth-min-lang">
            <Languages size={14} />
            <span>{language === "en" ? "EN" : "TR"}</span>
          </div>

          <h1>{t("register.panelTitle")}</h1>
          <p>{t("register.panelSubtitle")}</p>

          <div className="google-auth-modern auth-min-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t("register.error"))}
              theme={theme === "dark" ? "filled_black" : "outline"}
              shape="pill"
              width="100%"
            />
          </div>

          <div className="divider-modern">
            <span>{t("register.orEmail")}</span>
          </div>

          <form onSubmit={handleRegister}>
            <div className="modern-input-group auth-min-input">
              <label>{t("register.fullName")}</label>
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  className="modern-input"
                  placeholder={t("register.namePlaceholder")}
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modern-input-group auth-min-input">
              <label>{t("register.emailLabel")}</label>
              <div className="input-wrapper">
                <Mail size={20} />
                <input
                  type="email"
                  className="modern-input"
                  placeholder={t("register.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="modern-input-group auth-min-input">
              <label>{t("register.passwordLabel")}</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input
                  type="password"
                  className="modern-input"
                  placeholder={t("register.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-modern-primary auth-min-btn" disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <span>{t("register.btn")}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-modern auth-min-footer">
            <p className="text-muted fw-bold mb-0">
              {t("register.alreadyAccount")}{" "}
              <Link to="/login" className="auth-link">
                {t("register.loginLink")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
