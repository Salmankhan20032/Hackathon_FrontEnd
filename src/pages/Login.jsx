import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  Compass,
  Zap,
  Globe,
  Layout,
  Github
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

  const checkBoardingStatusAndRedirect = async () => {
    try {
      const userRes = await api.get("/user/me/");
      if (userRes.data.is_boarded) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/boarding", { replace: true });
      }
    } catch (error) {
      console.error("Boarding check failed", error);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", formData);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      toast.success(t("login.success"));
      await checkBoardingStatusAndRedirect();
    } catch (err) {
      toast.error(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google/", { token: credentialResponse.credential });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      toast.success("Welcome back!");
      await checkBoardingStatusAndRedirect();
    } catch (err) {
      toast.error("Google Login Failed");
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-container-modern"
      >
        {/* Visual Side */}
        <div className="auth-visual-side">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          
          <div className="visual-content">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="auth-logo-box"
            >
              <Compass size={32} className="text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="visual-title"
            >
              Elevate Your <br />
              <span className="text-white opacity-75">Everyday.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="visual-description"
            >
              The ultimate workspace for productivity, growth, and seamless life management. 
              Join thousands of creators worldwide.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="d-flex gap-4 mt-5 pt-4"
            >
              <div className="d-flex align-items-center gap-2">
                <Zap size={20} className="text-warning" />
                <span className="fw-700 text-sm">Ultra Fast</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Globe size={20} className="text-info" />
                <span className="fw-700 text-sm">Global Sync</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <div className="auth-header-modern">
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in.</p>
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
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleLogin}>
            <div className="modern-input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} />
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
                <Link to="/forgot-password" style={{fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none'}}>
                  Forgot Password?
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock size={20} />
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
              className="btn-modern-primary mt-4"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-modern">
            <p className="text-muted mb-0">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Sign Up for Free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
