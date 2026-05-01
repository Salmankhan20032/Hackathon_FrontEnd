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
      <div className="auth-container-modern">
        {/* Visual Side */}
        <div className="auth-visual-side">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          
          <div className="visual-content">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: 15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="auth-logo-box mb-5"
              style={{ width: '70px', height: '70px', borderRadius: '24px' }}
            >
              <Rocket size={38} className="text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="visual-title"
              style={{ fontSize: '4.5rem', marginBottom: '2rem' }}
            >
              Join the <br />
              <span className="gradient-text" style={{ filter: 'brightness(1.5)' }}>Revolution.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="visual-description mb-5"
              style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px' }}
            >
              Create your account and unlock the full potential of your career. Experience a workspace that learns and grows with you.
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
                  <Shield size={24} className="text-warning" />
                </div>
                <div>
                  <div className="fw-800 text-white">Security</div>
                  <div className="text-white text-opacity-50 text-sm">Enterprise grade</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Layers size={24} className="text-info" />
                </div>
                <div>
                  <div className="fw-800 text-white">Modules</div>
                  <div className="text-white text-opacity-50 text-sm">Infinite scale</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Zap size={24} className="text-success" />
                </div>
                <div>
                  <div className="fw-800 text-white">Instant</div>
                  <div className="text-white text-opacity-50 text-sm">Zero lag UX</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-white bg-opacity-10">
                  <Globe size={24} className="text-danger" />
                </div>
                <div>
                  <div className="fw-800 text-white">Sync</div>
                  <div className="text-white text-opacity-50 text-sm">Cloud native</div>
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
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Create Account</h2>
              <p className="text-muted fs-5">Join our community of future-makers today.</p>
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
                  <User size={22} />
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
                <label>Password</label>
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
                    <span>Create Account</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-modern mt-5 pt-4">
              <p className="text-muted fw-bold">
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
