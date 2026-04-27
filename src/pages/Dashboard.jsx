import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBriefcase,
  FaArrowRight,
  FaShoppingBag,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPlus,
  FaBolt,
  FaTerminal,
  FaCompass,
  FaChartBar,
  FaFingerprint,
  FaRocket,
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
  const [user, setUser] = useState({ first_name: "Commander" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [internRes, todoRes, cvRes, userRes] = await Promise.all([
        api.get("/internships/my/"),
        api.get("/todo/list/"),
        api.get("/cv/").catch(() => ({ data: {} })),
        api.get("/user/me/").catch(() => ({ data: { first_name: "Commander" } })),
      ]);

      const internships = internRes.data || [];
      const todos = todoRes.data?.todos || [];
      const cv = cvRes.data || {};
      const userData = userRes.data || { first_name: "Commander" };
      setUser(userData);

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
    <div className="dashboard-v4">
      {/* BACKGROUND DECOR */}
      <div className="studio-orb orb-1"></div>
      <div className="studio-orb orb-2"></div>
      <div className="grid-overlay"></div>

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
                 <Badge bg="none" className="p-0 d-flex align-items-center gap-2">
                   <div className="core-status-pulse"></div>
                   <span className="fw-900 ls-1 fs-xs text-primary">CORE SYSTEM ONLINE</span>
                 </Badge>
              </div>
              <h1 className="studio-title mb-2">
                Good Morning, <br /> <span>{user.first_name || "Commander"}</span>
              </h1>
              <p className="studio-subtitle">{t("dashboard.subtitle") || "Your daily intelligence briefing is ready."}</p>
            </div>

            <div className="d-flex gap-4">
              <div className="stat-capsule-pro">
                 <div className="cap-icon-wrap"><FaFingerprint /></div>
                 <div className="cap-content">
                    <div className="cap-val">{stats.avgScore}%</div>
                    <div className="cap-label">SYNC SCORE</div>
                 </div>
              </div>
              <div className="stat-capsule-pro accent">
                 <div className="cap-icon-wrap"><FaTerminal /></div>
                 <div className="cap-content">
                    <div className="cap-val">{stats.todosDone}/{stats.todosTotal}</div>
                    <div className="cap-label">LOGS DONE</div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* BENTO GRID */}
          <Row className="g-4 align-items-stretch mb-5">
            {/* PERFORMANCE INDEX */}
            <Col xl={8}>
              <motion.div variants={itemVariants} className="h-100">
                <Card className="glass-card main-tracker h-100">
                  <div className="p-4 border-bottom border-light-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-900 mb-0 d-flex align-items-center gap-2">
                        <FaChartBar className="text-primary" /> Performance Index
                      </h5>
                      <span className="small text-muted fw-700">Sector Analysis • Current Week</span>
                    </div>
                    <div className="d-flex gap-2">
                      <div className="legend-item"><span className="dot bg-primary"></span> Career</div>
                      <div className="legend-item"><span className="dot bg-secondary"></span> Skills</div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-grow-1">
                    <div className="chart-wrap" style={{ height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData}>
                          <defs>
                            <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: 'var(--accent-primary)', strokeWidth: 1 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="val" 
                            stroke="var(--accent-primary)" 
                            strokeWidth={4} 
                            fill="url(#gradientPrimary)" 
                            animationDuration={2500}
                          />
                          <XAxis dataKey="name" hide />
                          <YAxis hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-4 border-top border-light-subtle bg-light-subtle bg-opacity-10 d-flex flex-wrap gap-5">
                     <div className="mini-stat-pro">
                        <div className="ms-icon text-primary"><FaRocket /></div>
                        <div>
                          <div className="ms-val">{stats.totalInternships}</div>
                          <div className="ms-label">MISSIONS</div>
                        </div>
                     </div>
                     <div className="mini-stat-pro">
                        <div className="ms-icon text-success"><FaBolt /></div>
                        <div>
                          <div className="ms-val text-success">{stats.completed}</div>
                          <div className="ms-label">COMPLETED</div>
                        </div>
                     </div>
                     <div className="mini-stat-pro">
                        <div className="ms-icon text-muted"><FaCompass /></div>
                        <div>
                          <div className="ms-val">ACTIVE</div>
                          <div className="ms-label">NAV-SYSTEM</div>
                        </div>
                     </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* QUICK DEPLOYMENT */}
            <Col xl={4}>
              <div className="h-100 d-flex flex-column gap-4">
                <Row className="g-3">
                  {quickLinks.map((link, idx) => (
                    <Col key={idx} xs={6}>
                      <motion.div variants={itemVariants} className="h-100">
                        <Link to={link.to} className="text-decoration-none h-100 d-block">
                          <Card className={`deploy-card mode-${link.theme} h-100`}>
                            <div className="deploy-icon">
                              {link.icon}
                            </div>
                            <div className="mt-3">
                              <h6 className="fw-900 mb-0">{link.title}</h6>
                              <span className="small opacity-50 fw-700">{link.desc}</span>
                            </div>
                            <div className="deploy-arrow">
                              <FaArrowRight />
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
                
                <motion.div variants={itemVariants} className="flex-grow-1">
                  <Link to="/cv-builder" className="text-decoration-none h-100 d-block">
                    <Card className="glass-card cv-promo-pro h-100 p-4">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className="cv-badge">PRO LEVEL</div>
                        <div className="cv-score-ring">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${stats.cvScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="cv-score-text">{stats.cvScore || 0}%</div>
                        </div>
                      </div>
                      <h4 className="fw-900 mb-2">Neural CV Architect</h4>
                      <p className="small text-muted fw-600 mb-4">Optimize your professional DNA for the market.</p>
                      <Button className="w-100 btn-primary-pro">UPGRADE PROFILE</Button>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </Col>
          </Row>

          {/* SECONDARY ROW */}
          <Row className="g-4">
            <Col lg={7}>
              <motion.div variants={itemVariants}>
                <div className="p-4 bg-card rounded-4 border border-light-subtle mb-4 d-flex align-items-center justify-content-between">
                   <div className="d-flex align-items-center gap-3">
                      <div className="ai-status-indicator"></div>
                      <h5 className="fw-900 mb-0">AI Strategy Core</h5>
                   </div>
                   <div className="small fw-800 text-muted">v2.4.0-STABLE</div>
                </div>
                <div className="bento-box-pro">
                  <CareerPlanner />
                </div>
              </motion.div>
            </Col>

            <Col lg={5}>
              <motion.div variants={itemVariants} className="h-100">
                <div className="p-4 bg-card rounded-4 border border-light-subtle mb-4 d-flex align-items-center justify-content-between">
                   <h5 className="fw-900 mb-0">{t("dashboard.missionLog") || "Mission Log"}</h5>
                   <Badge bg="primary" className="rounded-pill px-3 py-2 fw-800">{stats.todosTotal} TASKS</Badge>
                </div>
                <Card className="glass-card todo-container-pro h-100 overflow-hidden bento-box-pro">
                   <TodoList />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>

      <style>{`
        .dashboard-v4 {
          position: relative;
          background-color: var(--bg-body);
          min-height: 100vh;
          overflow-x: hidden;
          padding-top: 120px;
          padding-bottom: 60px;
        }

        .grid-overlay {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(var(--glass-border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--glass-border) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }
        
        .studio-orb {
          position: absolute;
          filter: blur(140px);
          border-radius: 50%;
          z-index: 0;
          opacity: 0.2;
        }
        .orb-1 { width: 600px; height: 600px; background: var(--accent-primary); top: -200px; right: -100px; }
        .orb-2 { width: 500px; height: 500px; background: var(--accent-secondary); bottom: -100px; left: -100px; }

        .dashboard-content { position: relative; z-index: 1; }

        .studio-title {
          font-weight: 950;
          font-size: clamp(2.5rem, 6vw, 4.2rem);
          line-height: 0.85;
          letter-spacing: -0.06em;
          color: var(--text-main);
          margin-bottom: 1rem !important;
        }
        .studio-title span { 
           background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
        }
        .studio-subtitle { font-weight: 700; color: var(--text-muted); font-size: 1.1rem; opacity: 0.8; }

        .core-status-pulse {
          width: 8px; height: 8px; background: var(--accent-primary);
          border-radius: 50%; box-shadow: 0 0 10px var(--accent-primary);
          animation: corePulse 2s infinite;
        }
        @keyframes corePulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.2; }
          100% { transform: scale(1); opacity: 1; }
        }

        .stat-capsule-pro {
          display: flex; align-items: center; gap: 15px;
          padding: 15px 25px; background: var(--bg-card);
          border: 1px solid var(--glass-border); border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.03);
        }
        .stat-capsule-pro.accent { background: var(--accent-primary); color: white; border-color: transparent; }
        .cap-icon-wrap { font-size: 1.4rem; opacity: 0.5; }
        .cap-val { font-weight: 950; font-size: 1.75rem; line-height: 1; }
        .cap-label { font-weight: 900; font-size: 0.7rem; letter-spacing: 0.12em; opacity: 0.6; }

        .glass-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover { transform: translateY(-8px); box-shadow: 0 40px 100px rgba(0,0,0,0.08); border-color: var(--accent-primary); }

        .legend-item { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.75rem; color: var(--text-muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        .mini-stat-pro { display: flex; align-items: center; gap: 15px; }
        .ms-icon { font-size: 1.5rem; opacity: 0.8; }
        .ms-val { font-weight: 950; font-size: 1.25rem; line-height: 1; }
        .ms-label { font-weight: 900; font-size: 0.65rem; letter-spacing: 0.1em; opacity: 0.5; }

        .deploy-card {
          border-radius: 32px; border: 1px solid var(--glass-border);
          padding: 30px; background: var(--bg-card); position: relative;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .deploy-card:hover { transform: scale(1.05); border-color: var(--accent-primary); }
        .deploy-icon { 
          width: 54px; height: 54px; border-radius: 18px; 
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; background: var(--bg-body); color: var(--text-main);
        }
        .deploy-arrow {
          position: absolute; top: 30px; right: 30px; opacity: 0;
          transform: translate(-10px, 10px); transition: all 0.3s ease;
          color: var(--accent-primary);
        }
        .deploy-card:hover .deploy-arrow { opacity: 1; transform: translate(0, 0); }

        .mode-primary .deploy-icon { color: var(--accent-primary); }
        .mode-secondary .deploy-icon { color: var(--accent-secondary); }
        .mode-emerald .deploy-icon { color: #10b981; }
        .mode-amber .deploy-icon { color: #f59e0b; }

        .cv-promo-pro { background: linear-gradient(165deg, #1e293b, #0f172a) !important; color: white !important; }
        .cv-badge {
          background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 100px;
          font-weight: 900; font-size: 0.65rem; letter-spacing: 0.1em;
        }
        .cv-score-ring { position: relative; width: 60px; height: 60px; }
        .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
        .circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 3; }
        .circle { fill: none; stroke: var(--accent-primary); stroke-width: 3; stroke-linecap: round; }
        .cv-score-text { 
           position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
           font-weight: 900; font-size: 0.85rem;
        }
        .btn-primary-pro {
           background: var(--accent-primary) !important; border: none !important;
           border-radius: 16px !important; padding: 14px !important; font-weight: 900 !important;
           letter-spacing: 0.05em !important; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4) !important;
        }

        .bento-box-pro {
           background: var(--bg-card); border-radius: 40px;
           border: 1px solid var(--glass-border); overflow: hidden;
           box-shadow: 0 20px 50px rgba(0,0,0,0.02);
        }
        .ai-status-indicator {
           width: 12px; height: 12px; background: #10b981; border-radius: 50%;
           box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        @media (max-width: 991px) {
          .stat-capsule-pro { padding: 12px 20px; }
          .cap-val { font-size: 1.4rem; }
          .studio-title { margin-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
