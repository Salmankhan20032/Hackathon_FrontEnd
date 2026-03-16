import React from "react";
import { Container, Card, Badge, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaStar, FaBook, FaBriefcase, FaCode, FaCheckCircle, FaRocket } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";

const CareerRoadmap = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Redirect if no roadmap data is passed
  if (!state || !state.roadmap) {
    return (
      <Container className="py-5 text-center">
        <h2 className="fw-900 text-main">{t("roadmap.noStrategy")}</h2>
        <Button 
          variant="primary" 
          className="rounded-pill px-4 mt-3 fw-800 border-0 launch-btn"
          onClick={() => navigate("/dashboard")}
        >
          {t("roadmap.backToDashboard")}
        </Button>
      </Container>
    );
  }

  const roadmap = state.roadmap;

  const getTypeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "learning":
        return { icon: <FaBook />, color: "#4facfe", bg: "rgba(79, 172, 254, 0.15)" };
      case "project":
        return { icon: <FaCode />, color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" };
      case "job":
        return { icon: <FaBriefcase />, color: "#43e97b", bg: "rgba(67, 233, 123, 0.15)" };
      case "milestone":
      default:
        return { icon: <FaStar />, color: "#fa709a", bg: "rgba(250, 112, 154, 0.15)" };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <Container className="py-5">
      <Button 
        variant="link" 
        className="text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2 fw-900"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft /> {t("roadmap.backToDashboard")}
      </Button>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3 shadow-sm bg-primary bg-opacity-10 text-primary">
          <FaRocket size={32} />
        </div>
        <h1 className="display-4 fw-900 mb-2 text-main">
            {t("roadmap.headerTitle")} <span className="text-gradient">{t("roadmap.headerSubtitle")}</span>
        </h1>
        <p className="text-muted fs-5 fw-600">{t("roadmap.headerDesc")}</p>
      </motion.div>

      <div className="position-relative mx-auto" style={{ maxWidth: '800px' }}>
        {/* Vertical Line */}
        <div 
          className="position-absolute h-100" 
          style={{ width: '4px', background: 'var(--glass-border)', left: '40px', top: '20px', bottom: '20px', zIndex: 0 }}
        ></div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="d-flex flex-column gap-5 position-relative">
          {roadmap.map((step, index) => {
            const style = getTypeStyle(step.type);
            
            return (
              <motion.div key={index} variants={itemVariants} className="d-flex position-relative z-1">
                {/* Node Milestone Circle */}
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm border border-4 bg-white"
                  style={{ width: "80px", height: "80px", color: style.color, borderColor: `${style.color} !important`, zIndex: 2 }}
                >
                  <div style={{ fontSize: '24px' }}>
                    {style.icon}
                  </div>
                </div>

                {/* Card Detail */}
                <div className="ms-4 flex-grow-1">
                  <Card className="glass-panel border-0 shadow-lg p-4 h-100 rounded-5 overflow-hidden" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
                    <div className="position-absolute top-0 start-0 w-100 h-100 rounded-5" style={{ background: `linear-gradient(135deg, transparent, ${style.color}15)`, zIndex: 0, pointerEvents: 'none' }}></div>
                    <Card.Body className="p-0 position-relative z-1">
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <Badge 
                          pill 
                          className="px-3 py-2 fw-900 border" 
                          style={{ background: style.bg, color: style.color, borderColor: `${style.color}40` }}
                        >
                          {t("roadmap.stepLabel")} {step.step_number} • {step.type?.toUpperCase() || 'MILESTONE'}
                        </Badge>
                        <Badge bg="light" text="dark" className="px-3 py-2 fw-900 shadow-sm rounded-pill">
                          ⏳ {step.timeframe}
                        </Badge>
                      </div>
                      
                      <h3 className="fw-900 text-main mb-3">{step.title}</h3>
                      <p className="text-muted fw-600 mb-0 lh-lg" style={{ fontSize: '1.05rem' }}>
                        {step.description}
                      </p>
                    </Card.Body>
                  </Card>
                </div>
              </motion.div>
            );
          })}
          
          {/* Final Goal Node */}
          <motion.div variants={itemVariants} className="d-flex position-relative z-1">
             <div 
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-lg text-white"
                style={{ width: "80px", height: "80px", background: 'linear-gradient(135deg, #667eea, #764ba2)', border: '4px solid #fff', zIndex: 2 }}
              >
                <div style={{ fontSize: '32px' }}>
                  <FaCheckCircle />
                </div>
              </div>
              <div className="ms-4 d-flex align-items-center">
                 <h2 className="fw-900 text-gradient mb-0">{t("roadmap.goalReached")}</h2>
              </div>
          </motion.div>
        </motion.div>
      </div>
      
      <style>{`
        .text-gradient {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </Container>
  );
};

export default CareerRoadmap;
