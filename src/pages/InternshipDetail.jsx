import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  ProgressBar,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaYoutube,
  FaGithub,
  FaRocket,
  FaArrowLeft,
  FaCheck,
  FaAward,
  FaLaptopCode,
  FaTimes,
  FaDownload,
  FaClipboardList,
} from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useLanguage } from "../LanguageContext";

const InternshipDetail = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [internship, setInternship] = useState(state?.internship || null);
  const [pageLoading, setPageLoading] = useState(!state?.internship);
  const [syncing, setSyncing] = useState(false);
  const [userName, setUserName] = useState("");

  // Form State
  const [repoLink, setRepoLink] = useState("");
  const [timeTaken, setTimeTaken] = useState(7);
  const [difficulty, setDifficulty] = useState(5);
  const [userRating, setUserRating] = useState(5);
  const [loading, setLoading] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);

  // Certificate
  const [showCert, setShowCert] = useState(false);
  const certRef = useRef(null);

  // Fetch user name for certificate
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me/");
        setUserName(res.data.first_name || res.data.email || t("common.student"));
      } catch { setUserName(t("common.student")); }
    };
    fetchUser();
  }, [t]);

  useEffect(() => {
    if (!state?.internship && id) {
      const fetchInternship = async () => {
        try {
          const res = await api.get("/internships/my/");
          const found = res.data.find((i) => i.id === parseInt(id));
          if (found) setInternship(found);
          else { toast.error(t("common.notFound")); navigate("/internships"); }
        } catch { toast.error(t("common.failed")); navigate("/internships"); }
        finally { setPageLoading(false); }
      };
      fetchInternship();
    }
  }, [id, state, navigate, t]);

  if (pageLoading) return (
    <div className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-600">{t("internDetail.loading")}</p>
    </div>
  );
  if (!internship) return <div className="text-center mt-5 text-main">{t("common.noData")}</div>;

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await api.post(`/internships/enroll/${internship.id}/`);
      setInternship({ ...internship, status: "Enrolled" });
      toast.success(t("internDetail.enrolledToast"));
    } catch { toast.error(t("internDetail.enrollFail")); }
    finally { setLoading(false); }
  };

  const handleSyncResources = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/internships/sync-resources/${internship.id}/`);
      setInternship({ ...internship, youtube_links: res.data.youtube_links });
      toast.success(t("internDetail.syncSuccess"));
    } catch { toast.error(t("internDetail.syncFail")); }
    finally { setSyncing(false); }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.info(t("internDetail.gradingToast"));
      const res = await api.post(`/internships/grade/${internship.id}/`, {
        repo_link: repoLink, time_taken: timeTaken,
        difficulty: difficulty, user_rating: userRating,
      });
      setInternship({ ...internship, status: "Graded", score: res.data.score, feedback: res.data.feedback });
      if (res.data.score >= 80) toast.success(t("internDetail.projectAccepted"));
      else toast.warning(t("internDetail.needsRevision"));
    } catch { toast.error(t("internDetail.submitFail")); }
    finally { setLoading(false); }
  };

  // QUIZ FUNCTIONS
  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizResult(null);
    setQuizAnswers({});
    setCurrentQ(0);
    try {
      toast.info(t("internDetail.quizGenerating"));
      const res = await api.post(`/internships/quiz/${internship.id}/`);
      setQuizQuestions(res.data.questions);
      setShowQuiz(true);
    } catch { toast.error(t("internDetail.quizFail")); }
    finally { setQuizLoading(false); }
  };

  const submitQuiz = async () => {
    setQuizLoading(true);
    const answersArray = [];
    for (let i = 0; i < quizQuestions.length; i++) {
      answersArray.push(quizAnswers[i] !== undefined ? quizAnswers[i] : -1);
    }
    try {
      const res = await api.post(`/internships/quiz/submit/${internship.id}/`, { answers: answersArray });
      setQuizResult(res.data);
      if (res.data.passed) {
        setInternship({ ...internship, status: "Graded", score: res.data.score, feedback: res.data.feedback });
        toast.success(t("internDetail.quizPassed"));
      } else {
        toast.warning(t("internDetail.quizFailedScore").replace("{score}", res.data.score));
      }
    } catch { toast.error(t("internDetail.submitFail")); }
    finally { setQuizLoading(false); }
  };

  // CERTIFICATE DOWNLOAD
  const downloadCertificate = () => {
    const certContent = certRef.current;
    if (!certContent) return;
    
    // Canvas-based certificate download
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 1000, 700);
    grad.addColorStop(0, '#667eea');
    grad.addColorStop(1, '#764ba2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 700);

    // White card
    const cx = 50, cy = 50, cw = 900, ch = 600, cr = 20;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx + cr, cy);
    ctx.lineTo(cx + cw - cr, cy);
    ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + cr);
    ctx.lineTo(cx + cw, cy + ch - cr);
    ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - cr, cy + ch);
    ctx.lineTo(cx + cr, cy + ch);
    ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - cr);
    ctx.lineTo(cx, cy + cr);
    ctx.quadraticCurveTo(cx, cy, cx + cr, cy);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Corner decorations
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    [[70, 70, 35, 0, 0, 35], [895, 70, -35, 0, 0, 35], [70, 630, 35, 0, 0, -35], [895, 630, -35, 0, 0, -35]].forEach(([x, y, dx, dy, dx2, dy2]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx2, y + dy2);
      ctx.stroke();
    });

    // Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999';
    ctx.font = '600 12px Arial';
    ctx.letterSpacing = '6px';
    ctx.fillText(t("internDetail.certTitle"), 500, 130);

    ctx.fillStyle = '#333';
    ctx.font = '40px Georgia';
    ctx.fillText('\u{1F3C6}', 500, 190);

    ctx.fillStyle = '#888';
    ctx.font = '16px Georgia';
    ctx.fillText(t("internDetail.certCertifies"), 500, 240);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px Georgia';
    ctx.fillText(userName || t("common.student"), 500, 290);

    ctx.fillStyle = '#888';
    ctx.font = '14px Georgia';
    ctx.fillText(t("internDetail.certBody"), 500, 330);

    ctx.fillStyle = '#764ba2';
    ctx.font = 'bold 24px Georgia';
    ctx.fillText(internship.title, 500, 380);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Georgia';
    ctx.fillText(`${t("internships.score")}: ${internship.score || 0}%`, 500, 430);

    // Divider line
    const divGrad = ctx.createLinearGradient(350, 0, 650, 0);
    divGrad.addColorStop(0, '#667eea');
    divGrad.addColorStop(1, '#764ba2');
    ctx.fillStyle = divGrad;
    ctx.fillRect(400, 460, 200, 2);

    ctx.fillStyle = '#aaa';
    ctx.font = '13px Arial';
    ctx.fillText(t("internDetail.certFooter"), 500, 510);

    ctx.fillStyle = '#ccc';
    ctx.font = '11px Arial';
    ctx.fillText(new Date().toLocaleDateString(language === "tr" ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 500, 540);

    // Download
    const link = document.createElement('a');
    link.download = `certificate_${internship.title.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const answeredCount = Object.keys(quizAnswers).length;

  return (
    <Container className="py-5">
      <Button
        variant="link"
        onClick={() => navigate("/internships")}
        className="mb-4 text-decoration-none text-muted fw-600 p-0"
      >
        <FaArrowLeft className="me-2" /> {t("internDetail.back")}
      </Button>

      <Row className="g-4">
        {/* LEFT COLUMN */}
        <Col lg={8}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="fw-900 display-5 mb-3 text-main">{internship.title}</h1>
            <div className="d-flex gap-2 mb-4 flex-wrap">
              <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 p-2 px-3 fw-700">
                <FaLaptopCode className="me-2" /> {internship.min_days}-{internship.max_days} {t("internships.days")}
              </Badge>
              <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 p-2 px-3 fw-700">
                {t("internDetail.difficulty")}: {t("internDetail.intermediate")}
              </Badge>
            </div>

            <div className="p-4 rounded-4 mb-5 glass-panel" style={{ borderLeft: "5px solid var(--accent-primary)" }}>
              <h5 className="text-muted fw-900 small mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t("internDetail.aiBriefing")}</h5>
              <p className="fs-6 fw-500 text-main mb-0">{internship.ai_generated_text}</p>
            </div>

            <h4 className="mb-4 fw-900 text-main d-flex align-items-center gap-2">
              <span className="text-primary"><FaRocket /></span> {t("internDetail.skillsTitle")}
            </h4>
            <Card className="border-0 shadow-sm mb-5 glass-panel rounded-4">
              <Card.Body className="p-4">
                <p className="mb-0 fw-500 text-main opacity-80">{internship.skills_learned}</p>
              </Card.Body>
            </Card>

            {/* YOUTUBE SECTION */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0 fw-900 text-main d-flex align-items-center gap-2">
                <FaYoutube className="text-danger" /> {t("internDetail.playlistTitle")}
              </h4>
              <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-700" onClick={handleSyncResources} disabled={syncing}>
                {syncing ? <Spinner size="sm" animation="border" /> : t("internDetail.sync")}
              </Button>
            </div>
            <div className="d-flex flex-column gap-3">
              {internship.youtube_links && internship.youtube_links.length > 0 ? (
                internship.youtube_links.map((link, idx) => (
                  <Card key={idx} className="border-0 shadow-sm glass-panel rounded-4">
                    <Card.Body className="d-flex align-items-center justify-content-between p-3">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center me-3" style={{ width: "42px", height: "42px", flexShrink: 0 }}>
                          <FaYoutube size={20} />
                        </div>
                        <h6 className="mb-0 text-main fw-700" style={{ fontSize: '0.85rem' }}>{link.title}</h6>
                      </div>
                      <Button href={link.url} target="_blank" rel="noreferrer" size="sm" className="btn-primary rounded-pill px-3 fw-700">{t("internDetail.watch")}</Button>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="primary" className="bg-opacity-10 border-0 rounded-4 p-4 text-center">
                  <Spinner size="sm" className="me-2" />
                  <span className="fw-700">{t("internDetail.findingTutorials")}</span>
                  <Button variant="link" className="d-block mx-auto mt-2 text-primary fw-900 small" onClick={handleSyncResources}>{t("internDetail.forceSync")}</Button>
                </Alert>
              )}
            </div>
          </motion.div>
        </Col>

        {/* RIGHT COLUMN: PROJECT CONSOLE */}
        <Col lg={4}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky-top" style={{ top: "100px" }}>
            <Card className="border-0 shadow-lg text-main glass-panel rounded-5" style={{ borderTop: "5px solid var(--accent-primary)" }}>
              <Card.Body className="p-4">
                <h4 className="fw-900 mb-4 text-center text-main small" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t("internDetail.consoleTitle")}</h4>

                {/* NEW */}
                {internship.status === "New" && (
                  <div className="text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                      <FaRocket size={40} className="text-primary" />
                    </div>
                    <h5 className="fw-800 text-main">{t("internDetail.readyTitle")}</h5>
                    <p className="text-muted small fw-500">{t("internDetail.readySubtitle")}</p>
                    <Button size="lg" className="w-100 fw-900 py-3 launch-btn" onClick={handleEnroll} disabled={loading}>
                      {loading ? t("internDetail.starting") : t("internDetail.startBtn")}
                    </Button>
                  </div>
                )}

                {/* ENROLLED */}
                {internship.status === "Enrolled" && (
                  <div>
                    <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 w-100 p-3 mb-4 d-flex align-items-center justify-content-center gap-2 rounded-4 fw-800">
                      <FaLaptopCode /> {t("internDetail.missionActiveBadge")}
                    </Badge>

                    {/* QUIZ BUTTON */}
                    <Button
                      className="w-100 fw-900 py-3 mb-3 rounded-4 border-0"
                      style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: '#fff' }}
                      onClick={startQuiz}
                      disabled={quizLoading}
                    >
                      {quizLoading ? <Spinner size="sm" animation="border" /> : <><FaClipboardList className="me-2" /> {t("internDetail.takeExamBtn")}</>}
                    </Button>

                    <div className="position-relative my-3">
                      <hr className="text-muted" />
                      <span className="position-absolute top-50 start-50 translate-middle px-3 text-muted small fw-800" style={{ background: 'var(--glass-bg)' }}>{t("internDetail.orSubmit")}</span>
                    </div>

                    <Form onSubmit={handleSubmitProject}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted text-uppercase fw-900" style={{ letterSpacing: '0.1em', fontSize: '0.7rem' }}>{t("internDetail.githubLabel")}</Form.Label>
                        <Form.Control required placeholder="https://github.com/..." value={repoLink} onChange={(e) => setRepoLink(e.target.value)} className="bg-transparent border-opacity-25 text-main" />
                      </Form.Group>
                      <Row className="g-3 mb-4">
                        <Col>
                          <Form.Label className="small text-muted text-uppercase fw-900" style={{ letterSpacing: '0.1em', fontSize: '0.7rem' }}>{t("internDetail.daysLabel")}</Form.Label>
                          <Form.Control type="number" value={timeTaken} onChange={(e) => setTimeTaken(e.target.value)} className="bg-transparent border-opacity-25 text-main" />
                        </Col>
                        <Col>
                          <Form.Label className="small text-muted text-uppercase fw-900" style={{ letterSpacing: '0.1em', fontSize: '0.7rem' }}>{t("internDetail.complexityLabel")}</Form.Label>
                          <Form.Control type="number" max={10} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-transparent border-opacity-25 text-main" />
                        </Col>
                      </Row>
                      <Button type="submit" className="w-100 fw-900 py-3 launch-btn shadow-lg" disabled={loading}>
                        {loading ? t("internDetail.grading") : t("internDetail.submitBtn")}
                      </Button>
                    </Form>
                  </div>
                )}

                {/* GRADED */}
                {internship.status === "Graded" && (
                  <div className="text-center">
                    <div className="position-relative d-inline-block mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-lg"
                        style={{ width: "120px", height: "120px", border: `6px solid ${internship.score >= 60 ? "#198754" : "#ffc107"}`, background: "var(--glass-bg)" }}>
                        <h1 className="mb-0 fw-900 text-main">{internship.score}%</h1>
                      </div>
                      <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm border">
                        <FaAward className={internship.score >= 60 ? "text-success" : "text-warning"} size={20} />
                      </div>
                    </div>

                    <h4 className={`fw-900 ${internship.score >= 60 ? "text-success" : "text-warning"} mt-2`} style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {internship.score >= 60 ? t("internDetail.certified") : t("internDetail.needsImprovement")}
                    </h4>

                    <div className="text-start glass-panel p-4 rounded-4 mt-3 border-0">
                      <span className="text-uppercase text-muted fw-900 d-block mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>{t("internDetail.feedbackLabel")}</span>
                      <p className="small mb-0 fw-500 text-main opacity-90">{internship.feedback || internship.ai_feedback}</p>
                    </div>

                    {internship.score >= 60 && (
                      <Button
                        className="w-100 mt-4 fw-900 py-3 rounded-4 border-0"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff' }}
                        onClick={() => setShowCert(true)}
                      >
                        <FaDownload className="me-2" /> {t("internDetail.viewCertBtn")}
                      </Button>
                    )}

                    {internship.score < 60 && (
                      <Button variant="outline-warning" className="w-100 mt-3 rounded-pill fw-800 py-2" onClick={() => setInternship({ ...internship, status: "Enrolled" })}>
                        {t("internDetail.retryBtn")}
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* QUIZ MODAL */}
      <Modal show={showQuiz} onHide={() => setShowQuiz(false)} size="lg" centered backdrop="static">
        <Modal.Header className="border-0 pb-0" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <Modal.Title className="text-white fw-900">
            <FaClipboardList className="me-2" /> {t("internDetail.examModalTitle")}
          </Modal.Title>
          <Button variant="link" className="text-white" onClick={() => setShowQuiz(false)}><FaTimes size={20} /></Button>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          {quizResult ? (
            // RESULTS VIEW
            <div className="text-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow"
                style={{ width: "120px", height: "120px", border: `6px solid ${quizResult.passed ? "#198754" : "#dc3545"}`, background: quizResult.passed ? '#d1e7dd' : '#f8d7da' }}>
                <h1 className="mb-0 fw-900" style={{ color: quizResult.passed ? "#198754" : "#dc3545" }}>{quizResult.score}%</h1>
              </div>
              <h3 className={`fw-900 ${quizResult.passed ? "text-success" : "text-danger"}`}>
                {quizResult.passed ? t("internDetail.quizPassedTitle") : t("internDetail.quizFailedTitle")}
              </h3>
              <p className="text-muted fw-600">{quizResult.correct}/{quizResult.total} {t("internDetail.correctLabel")}. {quizResult.passed ? t("internDetail.certUnlocked") : t("internDetail.needPass")}</p>

              <div className="text-start mt-4">
                {quizResult.results.map((r, i) => (
                  <div key={i} className={`p-3 mb-2 rounded-3 ${r.is_correct ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                    <div className="d-flex align-items-start gap-2">
                      {r.is_correct ? <FaCheck className="text-success mt-1" /> : <FaTimes className="text-danger mt-1" />}
                      <span className="fw-600 small">{r.question}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-4 fw-800 rounded-pill px-5" onClick={() => { setShowQuiz(false); setQuizResult(null); }}>
                {t("common.close")}
              </Button>
            </div>
          ) : quizQuestions.length > 0 ? (
            // QUESTION VIEW
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Badge bg="primary" className="px-3 py-2 fw-800 rounded-pill">{t("internDetail.questionPrefix")}{currentQ + 1} / {quizQuestions.length}</Badge>
                <span className="text-muted fw-700 small">{answeredCount}/{quizQuestions.length} {t("internDetail.answeredLabel")}</span>
              </div>
              <ProgressBar now={(answeredCount / quizQuestions.length) * 100} variant="primary" style={{ height: '4px' }} className="mb-4" />

              <h5 className="fw-800 mb-4 text-main">{quizQuestions[currentQ]?.question}</h5>

              <div className="d-flex flex-column gap-2">
                {quizQuestions[currentQ]?.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    variant={quizAnswers[currentQ] === oi ? "primary" : "outline-secondary"}
                    className={`text-start p-3 rounded-3 fw-600 ${quizAnswers[currentQ] === oi ? 'shadow-sm' : ''}`}
                    onClick={() => setQuizAnswers({ ...quizAnswers, [currentQ]: oi })}
                  >
                    <span className="fw-800 me-2">{["A", "B", "C", "D"][oi]}.</span> {opt}
                  </Button>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)} className="rounded-pill px-4 fw-700">← {t("common.prev")}</Button>
                {currentQ < quizQuestions.length - 1 ? (
                  <Button variant="primary" onClick={() => setCurrentQ(currentQ + 1)} className="rounded-pill px-4 fw-700">{t("common.next")} →</Button>
                ) : (
                  <Button
                    className="rounded-pill px-4 fw-900"
                    style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', border: 'none', color: '#000' }}
                    onClick={submitQuiz}
                    disabled={quizLoading || answeredCount < quizQuestions.length}
                  >
                    {quizLoading ? <Spinner size="sm" /> : t("internDetail.submitExamBtnFinal")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted fw-600">{t("internDetail.quizGenerating")}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* CERTIFICATE MODAL */}
      <Modal show={showCert} onHide={() => setShowCert(false)} size="lg" centered>
        <Modal.Body className="p-0" ref={certRef}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '50px',
              textAlign: 'center',
              width: '100%',
              border: '3px solid #d4af37',
              position: 'relative',
            }}>
              {/* Corner decorations */}
              <div style={{ position: 'absolute', top: '15px', left: '15px', width: '40px', height: '40px', borderTop: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }}></div>
              <div style={{ position: 'absolute', top: '15px', right: '15px', width: '40px', height: '40px', borderTop: '3px solid #d4af37', borderRight: '3px solid #d4af37' }}></div>
              <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '40px', height: '40px', borderBottom: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }}></div>
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '40px', height: '40px', borderBottom: '3px solid #d4af37', borderRight: '3px solid #d4af37' }}></div>

              <p style={{ letterSpacing: '8px', color: '#888', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{t("internDetail.certTitle")}</p>
              <div style={{ fontSize: '3rem', margin: '10px 0' }}>🏆</div>
              <p style={{ color: '#888', margin: '5px 0' }}>{t("internDetail.certCertifies")}</p>
              <h2 style={{ fontWeight: 900, color: '#333', margin: '10px 0', fontSize: '2rem' }}>{userName || t("common.student")}</h2>
              <p style={{ color: '#888' }}>{t("internDetail.certBody")}</p>
              <h3 style={{ fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '15px 0' }}>
                {internship.title}
              </h3>
              <p style={{ fontWeight: 800, fontSize: '1.3rem', color: '#333' }}>{t("internships.score")}: {internship.score || 0}%</p>
              <div style={{ width: '200px', height: '2px', background: 'linear-gradient(90deg, #667eea, #764ba2)', margin: '20px auto' }}></div>
              <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{t("internDetail.certFooter")}</p>
              <p style={{ color: '#ccc', fontSize: '0.7rem' }}>{new Date().toLocaleDateString(language === "tr" ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center p-3">
          <Button variant="outline-secondary" className="rounded-pill px-4 fw-700" onClick={() => setShowCert(false)}>{t("common.close")}</Button>
          <Button className="rounded-pill px-4 fw-900 launch-btn border-0" onClick={downloadCertificate}>
            <FaDownload className="me-2" /> {t("internDetail.downloadCertBtn")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InternshipDetail;
