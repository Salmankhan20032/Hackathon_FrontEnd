import React, { useState, useEffect } from "react";
import { Card, Badge, Spinner, Button, Row, Col } from "react-bootstrap";
import { FaBriefcase, FaMapMarkerAlt, FaExternalLinkAlt, FaSync } from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../LanguageContext";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jobs/scrape/");
      setJobs(res.data.jobs);
    } catch (error) {
      console.error(error);
      toast.error(t("jobBoard.failToast"));
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.get("/jobs/scrape/", { params: { refresh: true } });
      setJobs(res.data.jobs);
      toast.success(t("jobBoard.successToast"));
    } catch (error) {
      toast.error(t("common.failed"));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="job-board-container p-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-900 mb-0 d-flex align-items-center gap-2 text-main">
          <FaBriefcase className="text-primary" /> {t("jobBoard.title")}
        </h4>
        <Button 
          variant="link" 
          onClick={handleSync} 
          disabled={syncing}
          className="text-decoration-none text-muted p-0 d-flex align-items-center gap-2 hover-primary"
        >
          {syncing ? <Spinner size="sm" animation="border" /> : <FaSync className={syncing ? "spin text-primary" : "text-muted"} />}
          <span className="small fw-800 text-uppercase tracking-tight" style={{ fontSize: '0.7rem' }}>{t("jobBoard.refresh")}</span>
        </Button>
      </div>

      <Row className="g-3">
        <AnimatePresence>
          {jobs.length > 0 ? jobs.map((job, idx) => (
            <Col key={job.id || idx} xs={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-panel border-0 border-start border-primary border-4 hover-lift shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="flex-grow-1">
                        <h6 className="fw-900 text-main mb-1 truncate-1" style={{ fontSize: '0.95rem' }}>{job.title}</h6>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="text-primary small fw-800" style={{ fontSize: '0.75rem' }}>{job.company}</span>
                          <span className="text-muted small">•</span>
                          <span className="text-muted small d-flex align-items-center gap-1 fw-600">
                            <FaMapMarkerAlt size={10} className="text-primary opacity-50" /> {job.location}
                          </span>
                        </div>
                      </div>
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 small fw-800 px-2">
                        {job.source}
                      </Badge>
                    </div>
                    
                    <div className="d-flex justify-content-end align-items-center mt-2">
                      <Button 
                        href={job.link} 
                        target="_blank" 
                        variant="primary" 
                        className="rounded-pill py-2 px-3 small fw-900 d-flex align-items-center gap-2 border-0 launch-btn"
                        style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
                      >
                        {t("jobBoard.viewMission")} <FaExternalLinkAlt size={10} />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          )) : (
            <Col xs={12}>
               <div className="text-center p-5 glass-panel rounded-4">
                  <p className="text-muted mb-0 fw-800 opacity-50">{t("jobBoard.empty")}</p>
               </div>
            </Col>
          )}
        </AnimatePresence>
      </Row>

      <style>{`
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border) !important; transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); background: rgba(var(--accent-primary-rgb), 0.05); border-color: rgba(var(--accent-primary-rgb), 0.3) !important; }
        .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .hover-primary:hover span { color: var(--accent-primary) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .launch-btn { 
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 4px 15px rgba(var(--accent-primary-rgb), 0.3);
        }
      `}</style>
    </div>
  );
};

export default JobBoard;
