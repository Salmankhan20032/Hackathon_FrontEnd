import React, { useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { FaRobot, FaMagic } from "react-icons/fa";
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
    <Card className="bento-card p-2 border-0 overflow-hidden shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
             <FaRobot size={24} />
          </div>
          <h4 className="mb-0 fw-800 text-main">
            {t("planner.title")}
          </h4>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-muted fw-500 mb-4 lh-lg" style={{ fontSize: '0.9rem' }}>
            {t("planner.desc")}
          </p>
          
          <Form.Group className="mb-4">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder={t("planner.placeholder")}
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="form-control-minimal bg-light bg-opacity-50"
            />
          </Form.Group>
          
          <Button
            size="lg"
            onClick={generatePlan}
            disabled={loading}
            className="btn-primary w-100 py-3 shadow-hover d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" /> <span>{t("planner.thinking")}</span>
              </>
            ) : (
              <>
                <FaMagic size={18} /> <span>{t("planner.generateBtn")}</span>
              </>
            )}
          </Button>
        </motion.div>
      </Card.Body>

      <style>{`
        .form-control-minimal {
          border: 2px solid transparent !important;
          background: var(--bg-body) !important;
          border-radius: 16px !important;
          padding: 1.2rem !important;
          font-weight: 500 !important;
          color: var(--text-main) !important;
          transition: all 0.2s ease !important;
        }
        .form-control-minimal:focus {
          border-color: var(--accent-primary) !important;
          background: var(--bg-card) !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
        }
        .shadow-hover {
          transition: all 0.3s ease;
        }
        .shadow-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3) !important;
        }
      `}</style>
    </Card>
  );
};

export default CareerPlanner;
