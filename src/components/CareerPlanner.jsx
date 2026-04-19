import React, { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { FaRobot, FaMagic, FaSparkles } from "react-icons/fa";
import api from "../api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

const CareerPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [extraInfo, setExtraInfo] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await api.post("/career-plan/", { extra_info: extraInfo });
      if (res.data.career_plan && Array.isArray(res.data.career_plan)) {
        navigate("/career-roadmap", { state: { roadmap: res.data.career_plan } });
      } else {
        console.error("Invalid response format from AI");
      }
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-embedded p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="planner-ai-icon">
          <FaRobot />
        </div>
        <div>
          <h5 className="fw-900 mb-0">{t("planner.title")}</h5>
          <span className="small text-muted fw-700">Neural Engine v4.2</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="description-text mb-4">
          {t("planner.desc")}
        </p>
        
        <Form.Group className="mb-4">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={t("planner.placeholder")}
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
            className="planner-input"
          />
        </Form.Group>
        
        <button
          onClick={generatePlan}
          disabled={loading}
          className="planner-btn"
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" /> <span>{t("planner.thinking")}</span>
            </>
          ) : (
            <>
              <FaMagic className="me-2" /> <span>{t("planner.generateBtn")}</span>
            </>
          )}
        </button>
      </motion.div>

      <style>{`
        .planner-embedded {
          background: transparent;
        }
        .planner-ai-icon {
          width: 48px;
          height: 48px;
          background: var(--accent-primary);
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
        }
        .description-text {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .planner-input {
          background: var(--bg-body) !important;
          border: 1px solid var(--glass-border) !important;
          border-radius: 20px !important;
          padding: 1.2rem !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          color: var(--text-main) !important;
          transition: all 0.3s ease !important;
          resize: none;
        }
        .planner-input:focus {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.05) !important;
          background: var(--bg-card) !important;
        }
        .planner-btn {
          width: 100%;
          padding: 16px;
          border-radius: 20px;
          border: none;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-weight: 800;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
        }
        .planner-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
        }
        .planner-btn:active { transform: scale(0.98); }
        .planner-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default CareerPlanner;
