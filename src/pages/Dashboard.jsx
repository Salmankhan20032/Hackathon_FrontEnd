import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBriefcase,
  FaArrowRight,
  FaShoppingBag,
  FaRobot,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaChartLine,
  FaCameraRetro,
  FaLayerGroup,
  FaCircle,
  FaCompass,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../api";
import { useLanguage } from "../LanguageContext";

// Components
import TodoList from "../components/TodoList";
import CareerPlanner from "../components/CareerPlanner";

const Dashboard = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { to: "/jobs", icon: <FaBriefcase />, title: t("dashboard.jobs"), subtitle: t("dashboard.jobsSub"), color: "var(--accent-primary)" },
    { to: "/internships", icon: <FaGraduationCap />, title: t("dashboard.internships"), subtitle: t("dashboard.internshipsSub"), color: "var(--accent-secondary)" },
    { to: "/marketplace", icon: <FaShoppingBag />, title: t("dashboard.marketplace"), subtitle: t("dashboard.marketplaceSub"), color: "#10b981" },
    { to: "/discounts", icon: <FaMapMarkerAlt />, title: t("dashboard.localInsights"), subtitle: t("dashboard.localInsightsSub"), color: "#f59e0b" },
  ];

  const vibePhotos = [
    { label: "🌄 Scenic", url: "https://picsum.photos/seed/scenery1/400/250" },
    { label: "🏙️ City", url: "https://picsum.photos/seed/citylife/400/250" },
    { label: "🍜 Food", url: "https://picsum.photos/seed/foodie22/400/250" },
  ];

  const [stats, setStats] = useState({
    totalInternships: 0,
    completed: 0,
    enrolled: 0,
    avgScore: 0,
    todosDone: 0,
    todosTotal: 0,
    cvScore: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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
      const newOnes = internships.filter((i) => i.status === "New" || !i.status).length;
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

      setChartData([
        { name: "New", value: newOnes, fill: "var(--accent-primary)" },
        { name: "Active", value: enrolled, fill: "var(--accent-secondary)" },
        { name: "Completed", value: completed, fill: "#10b981" },
      ]);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const areaData = [
    { label: "Q1", progress: 20 },
    { label: "Q2", progress: Math.min(stats.enrolled * 15 + 30, 50) },
    { label: "Q3", progress: Math.min(stats.enrolled * 20 + stats.completed * 10 + 40, 75) },
    { label: "Q4", progress: Math.min(stats.completed * 25 + stats.todosDone * 5 + 60, 100) },
  ];

  return (
    <Container fluid className="dashboard-container py-5 px-lg-5">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4"
      >
        <div>
          <Badge bg="transparent" className="p-0 mb-2 border-0">
            <span className="text-primary fw-800 small text-uppercase ls-3 d-flex align-items-center gap-2">
              <FaCircle size={8} className="pulse-primary" /> {t("dashboard.systemActive")}
            </span>
          </Badge>
          <h1 className="display-4 fw-800 tracking-tighter mb-1">
            {t("dashboard.active")} <span className="text-secondary opacity-50">Studio</span>
          </h1>
          <p className="text-muted fw-500 mb-0 max-w-sm">{t("dashboard.subtitle")}</p>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="glass-panel px-4 py-3 rounded-4 border-0 d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
              <FaRobot size={20} />
            </div>
            <div>
              <div className="fw-800 small tracking-wider opacity-50 text-uppercase" style={{ fontSize: '0.65rem' }}>{t("dashboard.aiSync")}</div>
              <div className="fw-900 small">OPTIMIZED</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BENTO GRID - MAIN STATS */}
      <Row className="g-4 mb-4">
        {/* GROWTH PROGRESS */}
        <Col lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bento-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <FaChartLine className="text-primary" />
                  <span className="fw-800 small text-uppercase ls-2 opacity-50">{t("dashboard.careerProgress")}</span>
                </div>
                <Badge bg="primary" className="bg-opacity-10 text-primary fw-800 px-3 py-2 rounded-pill border-0">
                  {stats.avgScore}% {t("internships.grading")}
                </Badge>
              </div>
              
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: 'var(--text-muted)' }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-card)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 800, color: 'var(--accent-primary)' }}
                      labelStyle={{ fontWeight: 800, color: 'var(--text-main)' }}
                    />
                    <Area type="monotone" dataKey="progress" stroke="var(--accent-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* METRICS PIE */}
        <Col lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bento-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4">
                <FaLayerGroup className="text-secondary" />
                <span className="fw-800 small text-uppercase ls-2 opacity-50">{t("dashboard.stats")}</span>
              </div>
              
              <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={chartData.filter(d => d.value > 0)}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="w-100 mt-3 d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-600 small">{t("dashboard.missions")}</span>
                    <span className="fw-800">{stats.completed} <span className="opacity-30">/</span> {stats.totalInternships}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fw-600 small">{t("dashboard.tasks")}</span>
                    <span className="fw-800">{stats.todosDone} <span className="opacity-30">/</span> {stats.todosTotal}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* QUICK ACTIONS ROW */}
      <Row className="g-4 mb-5">
        {quickLinks.map((item, i) => (
          <Col xs={6} md={3} key={i}>
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link to={item.to} className="text-decoration-none">
                <Card className="bento-card p-4 transition-all h-100 hover-shadow border-bottom-theme" style={{ '--theme-color': item.color }}>
                  <div className="bg-light-theme p-3 rounded-4 mb-3 d-inline-block" style={{ width: 'fit-content' }}>
                    <span style={{ color: item.color }}>{React.cloneElement(item.icon, { size: 24 })}</span>
                  </div>
                  <h6 className="fw-900 mb-1 text-main">{item.title}</h6>
                  <p className="text-muted small fw-500 mb-0">{item.subtitle}</p>
                </Card>
              </Link>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* BENTO GRID - LOWER SECTION */}
      <Row className="g-4">
        {/* LEFT COMPOSITE */}
        <Col lg={7}>
          <div className="d-flex flex-column gap-4">
            <section>
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaCompass className="text-primary" />
                <span className="fw-800 small text-uppercase ls-2 opacity-50">{t("dashboard.growthSystems")}</span>
              </div>
              <CareerPlanner />
            </section>

            <section>
              <Link to="/cv-builder" className="text-decoration-none">
                <Card className="bento-card p-5 bg-gradient-premium border-0 overflow-hidden position-relative">
                  <div className="position-absolute top-0 end-0 p-5 opacity-10">
                    <FaRobot size={120} />
                  </div>
                  <div className="position-relative z-1">
                    <Badge bg="white" className="text-primary fw-800 mb-4 px-3 py-2 rounded-3 border-0">
                      AI GENERATION ACTIVE
                    </Badge>
                    <h2 className="display-6 fw-900 mb-3">{t("dashboard.liveCv")} <span className="opacity-50">{t("dashboard.cvBuilder")}</span></h2>
                    <p className="fw-500 opacity-75 mb-4 max-w-sm">{t("dashboard.cvSubtitle")}</p>
                    
                    <div className="d-flex align-items-center gap-4">
                      <div className="strength-display">
                        <div className="fw-800 small ls-2 opacity-50 text-uppercase mb-2">{t("dashboard.profileStrength")}</div>
                        <div className="fw-900 h2 mb-0">{stats.cvScore}%</div>
                      </div>
                      <div className="strength-bar flex-grow-1 bg-white bg-opacity-10 rounded-pill" style={{ height: '8px', maxWidth: '200px' }}>
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${stats.cvScore}%` }} 
                          className="h-100 bg-white rounded-pill pulse-white"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </section>

            <section>
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <div className="d-flex align-items-center gap-2">
                  <FaCameraRetro className="text-primary" />
                  <span className="fw-800 small text-uppercase ls-2 opacity-50">{t("dashboard.localVibes")}</span>
                </div>
                <Link to="/discounts" className="text-primary fw-800 small text-decoration-none hover-move-right">
                  {t("dashboard.viewAll")} <FaArrowRight size={10} />
                </Link>
              </div>
              <Row className="g-3">
                {vibePhotos.map((photo, i) => (
                  <Col key={i} xs={4}>
                    <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                      <div className="vibe-img-wrap rounded-4 elevation-sm overflow-hidden h-100 shadow-hover" style={{ height: '140px' }}>
                        <img src={photo.url} alt={photo.label} className="w-100 h-100 object-fit-cover" />
                        <div className="vibe-overlay px-3 py-2">
                           <span className="text-white fw-800 small">{photo.label}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </section>
          </div>
        </Col>

        {/* RIGHT COMPOSITE */}
        <Col lg={5}>
          <div className="h-100 d-flex flex-column">
             <section className="h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-3 px-1">
                <FaLayerGroup className="text-primary" />
                <span className="fw-800 small text-uppercase ls-2 opacity-50">{t("dashboard.missionLog")}</span>
              </div>
              <Card className="bento-card h-100 overflow-hidden border-0">
                <TodoList />
              </Card>
            </section>
          </div>
        </Col>
      </Row>

      <style>{`
        .dashboard-container { background-color: var(--bg-body); }
        .bento-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.06); }
        .ls-3 { letter-spacing: 0.3em; }
        .ls-2 { letter-spacing: 0.15em; }
        .bg-gradient-premium {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
          color: white;
        }
        .text-gradient-primary {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pulse-primary { animation: pulseAnim 2s infinite; }
        @keyframes pulseAnim {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-white { animation: pulseWhiteAnim 2s infinite; }
        @keyframes pulseWhiteAnim {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .bg-light-theme { background: var(--bg-body); }
        .border-bottom-theme { border-bottom: 4px solid var(--theme-color) !important; }
        .vibe-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
        }
        .hover-shadow:hover { box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important; }
        .hover-move-right:hover svg { transform: translateX(4px); transition: transform 0.3s ease; }
        .max-w-sm { max-width: 450px; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .fw-800 { font-weight: 800; }
        .object-fit-cover { object-fit: cover; }
      `}</style>
    </Container>
  );
};

export default Dashboard;
