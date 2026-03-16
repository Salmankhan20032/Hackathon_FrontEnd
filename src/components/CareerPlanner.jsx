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
      // Calls Gemini 2.5 Flash on Backend and returns JSON array
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
    <Card className="shadow-lg border-0 mb-4 glass-panel rounded-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
             <FaRobot size={30} className="text-primary" />
          </div>
          <h3 className="mb-0 fw-900 text-main">
            {t("planner.title")}
          </h3>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-muted fw-600 mb-4 lh-base" style={{ fontSize: '0.95rem' }}>
            {t("planner.desc")}
          </p>
          <Form.Group className="mb-4">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder={t("planner.placeholder")}
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="bg-white bg-opacity-5 border-opacity-25 text-main-important rounded-4 p-3 fw-600"
              style={{ border: '1px solid var(--glass-border)' }}
            />
          </Form.Group>
          <Button
            variant="primary"
            size="lg"
            onClick={generatePlan}
            disabled={loading}
            className="w-100 fw-900 py-3 launch-btn shadow-lg border-0 rounded-4"
          >
            {loading ? (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Spinner size="sm" animation="border" /> {t("planner.thinking")}
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <FaMagic /> {t("planner.generateBtn")}
              </div>
            )}
          </Button>
        </motion.div>
      </Card.Body>
    </Card>
  );
};

export default CareerPlanner;
