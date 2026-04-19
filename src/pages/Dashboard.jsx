import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBriefcase,
  FaArrowRight,
  FaShoppingBag,
  FaRobot,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPlus,
  FaRocket,
  FaCompass,
  FaBolt,
  FaRegCheckCircle,
  FaRegCircle,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api";
import { useLanguage } from "../LanguageContext";

// Components
import TodoList from "../components/TodoList";
import CareerPlanner from "../components/CareerPlanner";

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalInternships: 0,
    completed: 0,
    enrolled: 0,
    avgScore: 0,
    todosDone: 0,
    todosTotal: 0,
    cvScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internRes, todoRes, cvRes] = await Promise.all([
        api.get("/internships/my/"),
        api.get("/todo/list/"),
        api.get("/cv/").catch(() => ({ data: {} })),
      ]);

      const internships = internRes.data || [];
      const todos = todoRes.data?.todos || [];
      const cv = cvRes.data || {};

      let cvScore = 0;
      if (cv.summary && cv.summary.length > 10) cvScore += 25;
      if (cv.skills && cv.skills.length > 0) cvScore += 25;
      if (cv.work_experience && cv.work_experience.length > 0) cvScore += 25;
      if (cv.education_details && cv.education_details.length > 0) cvScore += 25;

      const completed = internships.filter((i) => i.status === "Graded").length;
      const enrolled = internships.filter((i) => i.status === "Enrolled").length;
      const scores = internships.filter((i) => i.score).map((i) => i.score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const todosDone = todos.filter((t) => t.is_completed).length;

      setStats({
        totalInternships: internships.length,
        completed,
        enrolled,
        avgScore,
        todosDone,
        todosTotal: todos.length,
        cvScore,
      });
    } catch (err) {
      console.error("Stats error", err);
    } finally {
      setLoading(false);
    }
  };

  const areaData = [
    { name: "Day 1", val: 30 },
    { name: "Day 2", val: 45 },
    { name: "Day 3", val: 40 },
    { name: "Day 4", val: stats.avgScore || 65 },
    { name: "Day 5", val: stats.cvScore || 80 },
  ];

  const quickLinks = [
    { to: "/jobs", icon: <FaBriefcase />, title: t("dashboard.jobs"), desc: "Find roles", theme: "primary" },
    { to: "/internships", icon: <FaGraduationCap />, title: t("dashboard.internships"), desc: "AI Missions", theme: "secondary" },
    { to: "/marketplace", icon: <FaShoppingBag />, title: t("dashboard.marketplace"), desc: "Buy & Sell", theme: "emerald" },
    { to: "/discounts", icon: <FaMapMarkerAlt />, title: t("dashboard.localInsights"), desc: "City Vibes", theme: "amber" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="dashboard-v3">
      {/* BACKGROUND DECOR */}
      <div className="studio-orb orb-1"></div>
      <div className="studio-orb orb-2"></div>

      <Container fluid className="px-lg-5 py-4 position-relative">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="dashboard-content"
        >
          {/* HEADER SECTION */}
          <motion.div variants={itemVariants} className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end mb-5 gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                 <Badge bg="primary" className="p-2 rounded-pill d-flex align-items-center gap-2 px-3">
                   <FaBolt className="pulse-slow" size={10} />
                   <span className="fw-800 ls-1 fs-xs">AI CORE ACTIVE</span>
                 </Badge>
              </div>
              <h1 className="studio-title mb-2">
                Good Morning, <br /> <span>Commander</span>
              </h1>
              <p className="studio-subtitle">{t("dashboard.subtitle")}</p>
            </div>

            <div className="d-flex gap-3">
              <div className="stat-capsule">
                 <div className="cap-val">{stats.avgScore}%</div>
                 <div className="cap-label">{t("dashboard.avgScore")}</div>
              </div>
              <div className="stat-capsule secondary">
                 <div className="cap-val">{stats.todosDone}/{stats.todosTotal}</div>
                 <div className="cap-label">{t("dashboard.tasks")}</div>
              </div>
            </div>
          </motion.div>

          {/* MAIN BENTO GRID */}
          <Row className="g-4 align-items-stretch mb-5">
            {/* LARGE TRACKER CARD */}
            <Col xl={7}>
              <motion.div variants={itemVariants} className="h-100">
                <Card className="glass-card main-tracker h-100 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="fw-900 mb-0">{t("dashboard.careerProgress")}</h5>
                      <span className="small text-muted fw-600">Performance Index • Week 12</span>
                    </div>
                    <Button variant="link" className="text-primary text-decoration-none fw-800 p-0">
                       Full Analytics <FaArrowRight size={10} className="ms-1" />
                    </Button>
                  </div>
                  
                  <div className="chart-wrap" style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaData}>
                        <defs>
                          <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                          cursor={{ stroke: 'var(--accent-primary)', strokeWidth: 2 }}
                        />
                        <Area 
                          type="bundle" 
                          dataKey="val" 
                          stroke="var(--accent-primary)" 
                          strokeWidth={5} 
                          fill="url(#gradientPrimary)" 
                          animationDuration={2000}
                        />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-flex flex-wrap gap-4 mt-auto pt-4 border-top">
                     <div className="mini-stat">
                        <div className="ms-label">INTERNSHIPS</div>
                        <div className="ms-val">{stats.totalInternships} ACTIVE</div>
                     </div>
                     <div className="mini-stat">
                        <div className="ms-label">COMPLETED</div>
                        <div className="ms-val text-success">{stats.completed} READY</div>
                     </div>
                     <div className="mini-stat">
                        <div className="ms-label">SYNC ERRORS</div>
                        <div className="ms-val text-muted">0 DETECTED</div>
                     </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* QUICK ACTIONS VERTICAL GRID */}
            <Col xl={5}>
              <Row className="g-3 h-100">
                {quickLinks.map((link, idx) => (
                  <Col key={idx} xs={6}>
                    <motion.div variants={itemVariants} className="h-100">
                      <Link to={link.to} className="text-decoration-none h-100 d-block">
                        <Card className={`action-card mode-${link.theme} h-100 p-4`}>
                          <div className="card-icon mb-3">
                            {link.icon}
                          </div>
                          <h6 className="fw-900 mb-0">{link.title}</h6>
                          <span className="small opacity-50 fw-600">{link.desc}</span>
                          <div className="card-arrow">
                            <FaArrowRight size={12} />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  </Col>
                ))}
                
                {/* CV BUILDER PROMO - 2x1 CARD */}
                <Col xs={12}>
                  <motion.div variants={itemVariants}>
                    <Link to="/cv-builder" className="text-decoration-none">
                      <Card className="glass-card promo-card p-4 d-flex flex-row align-items-center gap-4">
                        <div className="promo-gauge">
                          <div className="gauge-outer">
                            <div className="gauge-inner bg-primary" style={{ height: `${stats.cvScore || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                           <h5 className="fw-900 mb-1">{t("dashboard.cvBuilder")}</h5>
                           <p className="small text-muted fw-600 mb-0">{t("dashboard.cvSubtitle")}</p>
                        </div>
                        <div className="promo-btn pulse-glow">
                           <FaPlus />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* LOWER SECTION - BENTO STYLE */}
          <Row className="g-4">
            {/* PLANNER SECTION */}
            <Col lg={7}>
              <motion.div variants={itemVariants}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="section-title-wrap">
                    <h4 className="fw-900 mb-0">Strategy Engineer</h4>
                    <span className="small text-muted fw-600">AI Personal Roadmap</span>
                  </div>
                </div>
                <div className="bento-box">
                  <CareerPlanner />
                </div>
              </motion.div>
            </Col>

            {/* MISSION LOG SECTION */}
            <Col lg={5}>
              <motion.div variants={itemVariants} className="h-100">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="section-title-wrap">
                    <h4 className="fw-900 mb-0">{t("dashboard.missionLog")}</h4>
                    <span className="small text-muted fw-600">Active Tasks • {stats.todosTotal}</span>
                  </div>
                  <Button variant="link" className="p-0 text-primary fw-900 small text-decoration-none">VIEW SYSTEM</Button>
                </div>
                <Card className="glass-card todo-container h-100 overflow-hidden bento-box">
                   <TodoList />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>

      <style>{`
        .dashboard-v3 {
          position: relative;
          background-color: var(--bg-body);
          min-height: 100vh;
          overflow: hidden;
          padding-top: 100px;
        }
        
        /* ORBS FOR STUDIO FEEL */
        .studio-orb {
          position: absolute;
          filter: blur(120px);
          border-radius: 50%;
          z-index: 0;
          opacity: 0.15;
        }
        .orb-1 { width: 500px; height: 500px; background: var(--accent-primary); top: -200px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: var(--accent-secondary); bottom: -100px; left: -100px; }

        .dashboard-content { position: relative; z-index: 1; }

        .studio-title {
          font-weight: 900;
          font-size: 3.5rem;
          line-height: 0.9;
          letter-spacing: -0.05em;
          color: var(--text-main);
        }
        .studio-title span { color: var(--accent-primary); }
        .studio-subtitle { font-weight: 600; color: var(--text-muted); font-size: 1rem; max-width: 400px; }

        .stat-capsule {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 15px 25px;
          text-align: right;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }
        .stat-capsule.secondary { background: var(--accent-primary); color: white; border-color: transparent; }
        .cap-val { font-weight: 900; font-size: 1.5rem; line-height: 1; }
        .cap-label { font-weight: 800; font-size: 0.65rem; text-uppercase; opacity: 0.6; letter-spacing: 0.1em; }

        .glass-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.02);
        }
        .glass-card:hover { transform: translateY(-5px); box-shadow: 0 25px 60px rgba(0,0,0,0.05); }

        .main-tracker { display: flex; flex-direction: column; }
        .mini-stat { display: flex; flex-direction: column; }
        .ms-label { font-size: 0.65rem; font-weight: 800; opacity: 0.5; letter-spacing: 0.15em; }
        .ms-val { font-size: 0.9rem; font-weight: 900; }

        /* ACTION CARDS */
        .action-card {
          border-radius: 28px;
          border: 1px solid var(--glass-border);
          padding: 24px;
          position: relative;
          transition: all 0.3s ease;
          background: var(--bg-card);
        }
        .action-card:hover { transform: scale(1.05); cursor: pointer; border-color: var(--accent-primary); }
        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          background: rgba(0,0,0,0.03);
          color: var(--text-main);
        }
        .card-arrow {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--bg-body);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .action-card:hover .card-arrow { opacity: 1; transform: translateX(0); }

        .mode-primary .card-icon { color: var(--accent-primary); background: rgba(var(--accent-primary-rgb, 99, 102, 241), 0.1); }
        .mode-secondary .card-icon { color: var(--accent-secondary); background: rgba(236, 72, 153, 0.1); }
        .mode-emerald .card-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .mode-amber .card-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

        /* PROMO CARD */
        .promo-card { cursor: pointer; }
        .promo-gauge { width: 10px; height: 60px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; position: relative; }
        .gauge-inner { position: absolute; bottom: 0; left: 0; width: 100%; transition: height 1s ease-out; }
        .promo-btn {
          width: 50px; height: 50px; border-radius: 16px; background: var(--accent-primary);
          color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .pulse-glow { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        .section-title-wrap h4 { letter-spacing: -0.02em; }
        .fs-xs { font-size: 0.6rem; }
        .ls-1 { letter-spacing: 0.1em; }
        
        .pulse-slow { animation: pulseSlow 3s infinite; }
        @keyframes pulseSlow {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        .bento-box {
           background: var(--bg-card);
           border-radius: 32px;
           border: 1px solid var(--glass-border);
           overflow: hidden;
        }

        @media (max-width: 991px) {
          .studio-title { font-size: 2.5rem; }
          .dashboard-v3 { padding-top: 80px; }
          .stat-capsule { padding: 10px 15px; }
          .cap-val { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
