import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaPlane,
  FaBriefcase,
  FaArrowRight,
  FaShoppingBag,
  FaTerminal,
  FaRobot,
  FaSatellite,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaChartLine,
  FaCameraRetro,
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

const COLORS = ["#667eea", "#43e97b", "#fa709a", "#4facfe"];

// Reliable free image sources - Picsum (Lorem Picsum)
const vibePhotos = [
  { query: "Scenic Nature", url: "https://picsum.photos/seed/scenery1/400/250", label: "🌄 Scenic" },
  { query: "City Life", url: "https://picsum.photos/seed/citylife/400/250", label: "🏙️ City" },
  { query: "Local Food", url: "https://picsum.photos/seed/foodie22/400/250", label: "🍜 Food" },
  { query: "Culture", url: "https://picsum.photos/seed/culture3/400/250", label: "🎭 Culture" },
  { query: "Adventure", url: "https://picsum.photos/seed/adventure5/400/250", label: "🏔️ Adventure" },
  { query: "Night Life", url: "https://picsum.photos/seed/nightout/400/250", label: "🌃 Nightlife" },
];

const Dashboard = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { to: "/jobs", icon: <FaBriefcase size={32} />, title: t("dashboard.jobs"), subtitle: t("dashboard.jobsSub"), color: "#4facfe", bg: "rgba(79, 172, 254, 0.15)" },
    { to: "/internships", icon: <FaGraduationCap size={32} />, title: t("dashboard.internships"), subtitle: t("dashboard.internshipsSub"), color: "#f5576c", bg: "rgba(245, 87, 108, 0.15)" },
    { to: "/marketplace", icon: <FaShoppingBag size={32} />, title: t("dashboard.marketplace"), subtitle: t("dashboard.marketplaceSub"), color: "#43e97b", bg: "rgba(67, 233, 123, 0.15)" },
    { to: "/discounts", icon: <FaMapMarkerAlt size={32} />, title: t("dashboard.localInsights"), subtitle: t("dashboard.localInsightsSub"), color: "#fa709a", bg: "rgba(250, 112, 154, 0.15)" },
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
        { name: "New", value: newOnes, fill: "#4facfe" },
        { name: "Active", value: enrolled, fill: "#fa709a" },
        { name: "Completed", value: completed, fill: "#43e97b" },
      ]);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const progressData = [
    { name: t("dashboard.missions"), total: stats.totalInternships, done: stats.completed, color: "#667eea" },
    { name: t("dashboard.tasks"), total: stats.todosTotal, done: stats.todosDone, color: "#43e97b" },
  ];

  const areaData = [
    { label: "Start", progress: 0 },
    { label: "Learning", progress: Math.min(stats.enrolled * 15 + 10, 40) },
    { label: "Building", progress: Math.min(stats.enrolled * 20 + stats.completed * 10 + 15, 60) },
    { label: "Completing", progress: Math.min(stats.completed * 25 + 20, 85) },
    { label: "Now", progress: Math.min(stats.completed * 30 + stats.todosDone * 5, 100) },
  ];

  return (
    <Container fluid className="py-4 px-md-5">
      {/* WELCOME HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <h1 className="fw-900 display-4 mb-1">{t("dashboard.systemActive")} <span className="text-gradient">{t("dashboard.active")}</span> ⚡</h1>
          <p className="text-muted fw-600 fs-5 mb-0">{t("dashboard.subtitle")}</p>
        </div>
        <div>
          <Badge pill bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-700">
            <FaRobot className="me-2" /> {t("dashboard.aiSync")}
          </Badge>
        </div>
      </motion.div>



      {/* PROGRESS + CHARTS */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm glass-panel rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaChartLine className="text-primary" />
                <h6 className="fw-900 mb-0 text-main small" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t("dashboard.careerProgress")}</h6>
              </div>
              {statsLoading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" size="sm" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      labelStyle={{ fontWeight: 800, color: 'var(--text-main)' }}
                      formatter={(v) => [`${v}%`, 'Progress']}
                    />
                    <Area type="monotone" dataKey="progress" stroke="#667eea" strokeWidth={3} fill="url(#progressGrad)" dot={{ r: 5, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.div>
        </Col>

        <Col lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm glass-panel rounded-4 p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaCheckCircle className="text-primary" />
                <h6 className="fw-900 mb-0 text-main small" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t("dashboard.stats")}</h6>
              </div>
              {statsLoading ? (
                <div className="text-center py-4"><Spinner animation="border" variant="primary" size="sm" /></div>
              ) : (
                <>
                  <div className="text-center mb-3">
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={chartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {progressData.map((p, i) => (
                      <div key={i} className="d-flex justify-content-between align-items-center small">
                        <span className="fw-700 text-muted">{p.name}</span>
                        <span className="fw-900" style={{ color: p.color }}>{p.done}/{p.total}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="fw-700 text-muted">{t("dashboard.avgScore")}</span>
                      <span className="fw-900 text-primary">{stats.avgScore}%</span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* QUICK LINKS */}
      <Row className="g-4 mb-5">
        {quickLinks.map((item, i) => (
          <Col xs={12} sm={6} md={3} key={i}>
            <motion.div whileHover={{ y: -8 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Link to={item.to} className="text-decoration-none">
                <Card className="shadow-lg rounded-5 p-4 h-100 text-center position-relative overflow-hidden" style={{ transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: `1px solid ${item.color}40`, boxShadow: `0 8px 32px 0 ${item.color}20` }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: `linear-gradient(135deg, transparent, ${item.color}30)`, zIndex: 0 }}></div>
                  <Card.Body className="p-0 position-relative" style={{ zIndex: 1 }}>
                    <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: "70px", height: "70px", background: item.bg, color: item.color }}>
                      {item.icon}
                    </div>
                    <h5 className="fw-900 mb-1 text-main">{item.title}</h5>
                    <p className="text-muted fw-600 small mb-0">{item.subtitle}</p>
                  </Card.Body>
                </Card>
              </Link>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* STRATEGY CENTRE (LEFT) */}
        <Col lg={7} md={12}>
          <div className="d-flex flex-column gap-4">
            <section>
              <div className="d-flex align-items-center gap-2 mb-3 px-1">
                <FaRobot className="text-primary" />
                <h5 className="fw-900 mb-0 tracking-tight text-main small uppercase tracking-widest">{t("dashboard.growthSystems")}</h5>
              </div>
              <CareerPlanner />
            </section>

            {/* LIVE CV BUILDER */}
            <section className="mt-2">
              <Link to="/cv-builder" className="text-decoration-none">
                <motion.div whileHover={{ y: -5 }}>
                  <Card className="border-0 shadow-lg glass-panel overflow-hidden position-relative" style={{ borderRadius: '24px', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)' }}>
                    <div className="position-absolute top-0 end-0 h-100" style={{ width: '150px', background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.15))' }}></div>
                    <Card.Body className="p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center position-relative z-1">
                      <div>
                        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-800 mb-3 text-uppercase">
                          {t("dashboard.autoSync")}
                        </Badge>
                        <h3 className="fw-900 mb-2 text-main">{t("dashboard.liveCv")} <span className="text-gradient">{t("dashboard.cvBuilder")}</span></h3>
                        <p className="text-muted fw-500 mb-0">{t("dashboard.cvSubtitle")}</p>
                      </div>
                      
                      <div className="mt-4 mt-md-0 d-flex align-items-center gap-4">
                        <div className="text-end d-none d-sm-block">
                          <h6 className="fw-800 mb-0 text-muted text-uppercase tracking-widest" style={{ fontSize: '0.7rem' }}>{t("dashboard.profileStrength")}</h6>
                          <div className="fw-900 text-main" style={{ fontSize: '1.2rem' }}>
                            {stats.cvScore} <span className="text-muted fs-6">/ 100</span>
                          </div>
                        </div>
                        <div className="position-relative">
                          <svg width="80" height="80" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="40" stroke="var(--glass-border)" strokeWidth="8" fill="transparent" />
                             <circle cx="50" cy="50" r="40" stroke="var(--accent-primary)" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * stats.cvScore) / 100} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease-in-out' }} />
                          </svg>
                          <div className="position-absolute top-50 start-50 translate-middle fw-800 text-main fs-5">
                            {stats.cvScore}%
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Link>
            </section>

            {/* LOCAL VIBES GALLERY */}
            <section>
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <div className="d-flex align-items-center gap-2">
                  <FaCameraRetro className="text-primary" />
                  <h5 className="fw-900 mb-0 tracking-tight text-main small uppercase tracking-widest">{t("dashboard.localVibes")}</h5>
                </div>
                <Link to="/discounts" className="text-primary fw-800 small text-decoration-none">
                  {t("dashboard.viewAll")} <FaArrowRight size={10} className="ms-1" />
                </Link>
              </div>
              <Row className="g-3">
                {vibePhotos.map((photo, i) => (
                  <Col xs={4} key={i}>
                    <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                      <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ height: '120px' }}>
                        <img
                          src={photo.url}
                          alt={photo.query}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          loading="lazy"
                        />
                        <div className="position-absolute bottom-0 start-0 w-100 p-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                          <span className="text-white fw-800" style={{ fontSize: '0.7rem' }}>{photo.label}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </section>
          </div>
        </Col>

        {/* EXECUTION TIER (RIGHT) */}
        <Col lg={5} md={12}>
          <div className="h-100 d-flex flex-column gap-4">
            <section className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-3 px-1">
                <FaTerminal className="text-primary" />
                <h5 className="fw-900 mb-0 tracking-tight text-main small uppercase tracking-widest">{t("dashboard.missionLog")}</h5>
              </div>
              <div className="glass-panel rounded-5 p-1 shadow-lg h-100 d-flex flex-column border-0" style={{ minHeight: '400px' }}>
                <div className="flex-grow-1 overflow-hidden">
                  <TodoList />
                </div>
              </div>
            </section>


          </div>
        </Col>
      </Row>

      <style>{`
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(15px); border: 1px solid var(--glass-border) !important; color: var(--text-main); }
        .hover-lift:hover { transform: translateY(-8px); background: rgba(var(--accent-primary-rgb), 0.05); }
        .rounded-5 { border-radius: 2rem !important; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.2em; }
        .fw-900 { font-weight: 900; }
        .text-main { color: var(--text-main); }
      `}</style>
    </Container>
  );
};

export default Dashboard;
