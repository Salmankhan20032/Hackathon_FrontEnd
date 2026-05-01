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
  Compass,
  Zap,
  Globe,
  Layout,
  Shield
} from "lucide-react";
import api from "../api";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const saveSessionAndEnterHome = (payload) => {
    localStorage.setItem("access_token", payload.access);
    localStorage.setItem("refresh_token", payload.refresh);
    navigate("/dashboard", { replace: true });
  };

  const loginWithGoogleCredential = async (credential) => {
    let decoded = {};
    try {
      decoded = jwtDecode(credential);
    } catch (error) {
      console.warn("Could not decode Google credential", error);
    }

    const profilePayload = {
      email: decoded?.email || "",
      first_name: decoded?.given_name || decoded?.name || "",
      last_name: decoded?.family_name || "",
      avatar: decoded?.picture || "",
      google_sub: decoded?.sub || "",
    };

    const payloadVariants = [
      { ...profilePayload, google_token: credential },
      profilePayload,
      { ...profilePayload, token: credential },
      { ...profilePayload, id_token: credential },
      { email: profilePayload.email, google_token: credential },
      { token: credential },
      { id_token: credential },
      { credential },
    ];

    let lastError = null;
    for (const body of payloadVariants) {
      try {
        const res = await api.post("/auth/google/", body);
        return res;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", formData);
      saveSessionAndEnterHome(res.data);
      toast.success(t("login.success"));
    } catch (err) {
      toast.error(t("login.error"));
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
      const res = await loginWithGoogleCredential(credential);
      saveSessionAndEnterHome(res.data);
      toast.success("Welcome back!");
    } catch (err) {
      console.error("Google login failed", err?.response?.data || err?.message || err);
      toast.error("Google Login Failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-modern">
        {/* Visual Side */}
        <div className="auth-visual-side">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          
          <div className="visual-content">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="auth-logo-box mb-5"
              style={{ width: '70px', height: '70px', borderRadius: '24px' }}
            >
              <Compass size={38} className="text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="visual-title"
              style={{ fontSize: '4.5rem', marginBottom: '2rem' }}
            >
              Work <br />
              <span className="gradient-text" style={{ filter: 'brightness(1.5)' }}>Smarter.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="visual-description mb-5"
              style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px' }}
            >
              Welcome to the neural workspace of the future. Seamlessly manage your career, productivity, and growth in one unified platform.
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="feature-list pt-4"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Zap size={24} className="text-warning" />
                </div>
                <div>
                  <div className="fw-800 text-white">Ultra Fast</div>
                  <div className="text-white text-opacity-50 text-sm">Real-time sync</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Globe size={24} className="text-info" />
                </div>
                <div>
                  <div className="fw-800 text-white">Global</div>
                  <div className="text-white text-opacity-50 text-sm">Access anywhere</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Layout size={24} className="text-success" />
                </div>
                <div>
                  <div className="fw-800 text-white">Intuitive</div>
                  <div className="text-white text-opacity-50 text-sm">Neural design</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Shield size={24} className="text-danger" />
                </div>
                <div>
                  <div className="fw-800 text-white">Secure</div>
                  <div className="text-white text-opacity-50 text-sm">E2E Encryption</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}
          >
            <div className="auth-header-modern mb-5">
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Welcome Back</h2>
              <p className="text-muted fs-5">Please enter your credentials to access your workspace.</p>
            </div>

            <div className="google-auth-modern">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login error")}
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                shape="pill"
                width="100%"
              />
            </div>

            <div className="divider-modern">
              <span>or connect with email</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="modern-input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={22} />
                  <input 
                    type="email"
                    className="modern-input"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modern-input-group">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="mb-0">Password</label>
                  <Link to="/forgot-password" style={{fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '800', textDecoration: 'none'}}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={22} />
                  <input 
                    type="password"
                    className="modern-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-modern-primary mt-5"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-modern mt-5 pt-4">
              <p className="text-muted fw-bold">
                New to SkillX?{" "}
                <Link to="/register" className="auth-link">
                  Create Account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
