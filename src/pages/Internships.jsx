import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaRocket,
  FaClock,
  FaCheckCircle,
  FaCode,
  FaStar,
  FaLaptopCode,
  FaServer,
  FaBrain,
  FaPalette,
  FaDatabase,
  FaMobileAlt,
  FaShieldAlt,
  FaHistory,
  FaSyncAlt,
} from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import { useLanguage } from "../LanguageContext";

// Icon mapping based on keywords
const getInternIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("ui") || t.includes("design")) return <FaPalette size={22} />;
  if (t.includes("backend") || t.includes("server") || t.includes("api")) return <FaServer size={22} />;
  if (t.includes("data") || t.includes("database") || t.includes("sql")) return <FaDatabase size={22} />;
  if (t.includes("mobile") || t.includes("android") || t.includes("ios")) return <FaMobileAlt size={22} />;
  if (t.includes("ai") || t.includes("machine") || t.includes("ml")) return <FaBrain size={22} />;
  if (t.includes("security") || t.includes("cyber")) return <FaShieldAlt size={22} />;
  return <FaLaptopCode size={22} />;
};

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const res = await api.get("/internships/my/");
      setInternships(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const generateNew = async () => {
    setGenerating(true);
    try {
      toast.info(t("internships.generatingToast"));
      await api.post("/internships/generate/");
      fetchInternships();
      toast.success(t("internships.generateSuccess"));
    } catch (error) {
      toast.error(t("internships.generateFail"));
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Graded":
        return (
          <Badge bg="success" className="bg-opacity-75 px-3 py-2 fw-800 rounded-pill shadow-sm">
            ✓ {t("internships.statusCompleted")}
          </Badge>
        );
      case "Enrolled":
        return (
          <Badge bg="warning" text="dark" className="bg-opacity-75 px-3 py-2 fw-800 rounded-pill shadow-sm">
            ⚡ {t("internships.statusActive")}
          </Badge>
        );
      default:
        return (
          <Badge className="px-3 py-2 fw-800 rounded-pill shadow-sm" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            {t("internships.statusNew")}
          </Badge>
        );
    }
  };

  return (
    <Container className="py-5">
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center"
      >
        <h1 className="fw-900 display-4 mb-3 text-main">
          {t("internships.title")} <span className="text-gradient">{t("internships.hub")}</span> ⚡
        </h1>
        <p
          className="lead text-muted fw-500 mx-auto"
          style={{ maxWidth: "700px" }}
        >
          {t("internships.subtitle")}
        </p>

        <div className="mt-4">
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Button
              size="lg"
              variant="outline-primary"
              onClick={fetchInternships}
              disabled={loading || generating}
              className="px-4 py-3 fw-800 shadow-sm rounded-pill"
            >
              {loading ? <Spinner size="sm" animation="border" /> : <><FaHistory className="me-2" /> {t("internships.loadSavedBtn")}</>}
            </Button>
            <Button
              size="lg"
              onClick={generateNew}
              disabled={generating}
              className="px-5 py-3 fw-900 launch-btn shadow-lg rounded-pill"
            >
              {generating ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <FaSyncAlt className="me-2" /> {t("internships.refreshBtn")}
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3 text-muted fw-600">{t("internships.loading")}</p>
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-5 glass-panel rounded-5 border-0 shadow-lg">
          <div className="mb-4 text-primary">
            <FaRocket size={60} className="opacity-20" />
          </div>
          <h3 className="fw-900 text-main">{t("internships.emptyTitle")} 📄</h3>
          <p className="text-muted fw-500 mb-4">
            {t("internships.emptySubtitle")}
          </p>
          <Button variant="outline-primary" className="rounded-pill px-4 fw-800" onClick={generateNew}>
            {t("internships.refreshBtn")}
          </Button>
        </div>
      ) : (
        <Row className="g-4">
          {internships.map((intern, index) => (
            <Col md={6} lg={4} key={intern.id}>
              <motion.div
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                style={{ height: '100%' }}
              >
                <Card
                  className="border-0 shadow-sm overflow-hidden glass-panel rounded-4"
                  style={{ height: '320px', display: 'flex', flexDirection: 'column' }}
                  onClick={() =>
                    navigate(`/internships/${intern.id}`, {
                      state: { internship: intern },
                    })
                  }
                  role="button"
                >
                  {/* Card Header with gradient */}
                  <div
                    className="position-relative d-flex align-items-center justify-content-between px-4 pt-4 pb-3"
                    style={{
                      background: gradients[index % gradients.length],
                      minHeight: '90px',
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', flexShrink: 0 }}
                      >
                        {getInternIcon(intern.title)}
                      </div>
                      <h6 className="text-white fw-900 mb-0 lh-sm" style={{ fontSize: '0.95rem' }}>
                        {intern.title.length > 40 ? intern.title.substring(0, 40) + '...' : intern.title}
                      </h6>
                    </div>
                    <div className="position-absolute top-0 end-0 p-3">
                      {getStatusBadge(intern.status)}
                    </div>
                  </div>

                  {/* Card Body - fixed height */}
                  <Card.Body className="d-flex flex-column p-4" style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="d-flex justify-content-between text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                      <span className="fw-700">
                        <FaClock className="me-1 text-primary" /> {intern.min_days}-{intern.max_days} {t("internships.days")}
                      </span>
                      <span className="fw-700">
                        <FaCode className="me-1 text-primary" /> {t("internships.projectBased")}
                      </span>
                    </div>

                    <p className="text-muted fw-500 mb-0" style={{ fontSize: '0.82rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {intern.description}
                    </p>

                    {/* Footer Action */}
                    <div className="mt-auto pt-3 border-top border-opacity-10" style={{ borderColor: 'var(--glass-border)' }}>
                      {intern.status === "Graded" ? (
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="text-success fw-900 small">
                            <FaCheckCircle className="me-1" /> {t("internships.passed")}
                          </span>
                          <span className="fw-900">
                            <FaStar className="text-warning me-1" /> {intern.score}/100
                          </span>
                        </div>
                      ) : intern.status === "Enrolled" ? (
                        <div>
                          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.7rem' }}>
                            <span className="text-primary fw-800">{t("internships.inProgress")}</span>
                            <span className="text-primary fw-800">{t("internships.active")}</span>
                          </div>
                          <ProgressBar
                            variant="primary"
                            now={100}
                            animated
                            style={{ height: "5px" }}
                            className="bg-primary bg-opacity-10"
                          />
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-primary fw-800 small">{t("internships.viewMission")} →</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Internships;
