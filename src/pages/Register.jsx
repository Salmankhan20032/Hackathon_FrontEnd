import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  User,
  Compass,
  Rocket,
  Shield,
  Layers
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
      toast.success("Welcome aboard!");
      navigate("/boarding");
    } catch (err) {
      toast.error("Google Registration Failed");
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
              Start Your <br />
              <span className="text-white opacity-75">Future Now.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="visual-description"
            >
              Join the elite circle of professionals using EverydayLife to streamline their journey. 
              Your neural workspace is ready.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="d-flex flex-column gap-3 mt-5 pt-2"
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-white bg-opacity-10">
                  <Shield size={18} className="text-white" />
                </div>
                <span className="fw-600 text-sm opacity-90">Enterprise-grade security</span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-circle bg-white bg-opacity-10">
                  <Layers size={18} className="text-white" />
                </div>
                <span className="fw-600 text-sm opacity-90">Unified platform experience</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-form-side">
          <div className="auth-header-modern">
            <h2>Create Account</h2>
            <p>Get started with your free account today.</p>
          </div>

          <div className="google-auth-modern">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google register error")}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              shape="pill"
              width="100%"
            />
          </div>

          <div className="divider-modern">
            <span>or register with email</span>
          </div>

          <form onSubmit={handleRegister}>
            <div className="modern-input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={20} />
                <input 
                  type="text"
                  className="modern-input"
                  placeholder="John Doe"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
            </div>

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
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input 
                  type="password"
                  className="modern-input"
                  placeholder="Create a strong password"
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
                  <span>Get Started</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-modern">
            <p className="text-muted mb-0">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
