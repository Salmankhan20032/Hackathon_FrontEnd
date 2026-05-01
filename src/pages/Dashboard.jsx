import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  Briefcase,
  ShoppingBag,
  GraduationCap,
  MapPin,
  ArrowRight,
  Activity,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  Rocket,
  Target,
  Trophy,
  Flame,
  Compass,
  Brain,
} from "lucide-react";
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

      const internships = Array.isArray(internRes.data) ? internRes.data : [];
      const todos = Array.isArray(todoRes.data?.todos) ? todoRes.data.todos : [];
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
      const todosDone = todos.filter((item) => item.is_completed).length;

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

  const trendData = [
    { label: "Mon", value: 28 },
    { label: "Tue", value: 42 },
    { label: "Wed", value: 39 },
    { label: "Thu", value: stats.avgScore || 57 },
    { label: "Fri", value: stats.cvScore || 72 },
  ];

  const quickLinks = [
    { to: "/jobs", icon: Briefcase, title: t("dashboard.jobs"), subtitle: t("dashboard.jobsSub") },
    { to: "/internships", icon: GraduationCap, title: t("dashboard.internships"), subtitle: t("dashboard.internshipsSub") },
    { to: "/marketplace", icon: ShoppingBag, title: t("dashboard.marketplace"), subtitle: t("dashboard.marketplaceSub") },
    { to: "/discounts", icon: MapPin, title: t("dashboard.localInsights"), subtitle: t("dashboard.localInsightsSub") },
  ];

  const topStats = [
    { label: t("dashboard.avgScore"), value: `${stats.avgScore}%`, icon: Activity },
    { label: t("dashboard.missions"), value: stats.totalInternships, icon: GraduationCap },
    { label: t("dashboard.tasks"), value: `${stats.todosDone}/${stats.todosTotal}`, icon: CheckCircle2 },
    { label: t("dashboard.profileStrength"), value: `${stats.cvScore}%`, icon: FileText },
  ];

  const completionRate = stats.totalInternships
    ? Math.round((stats.completed / stats.totalInternships) * 100)
    : 0;

  return (
    <div className="dx-dashboard-shell">
      <Container fluid="xl" className="dx-dashboard-container">
        <section className="dx-hero">
          <Card className="dx-panel dx-hero-panel">
            <Card.Body>
              <div className="dx-hero-top">
                <Badge className="dx-badge">
                  <Sparkles size={14} />
                  <span>{t("dashboard.systemActive")} {t("dashboard.active")}</span>
                </Badge>
              </div>
              <h1>{t("nav.home")}, {user.first_name || "Commander"}</h1>
              <p>{t("dashboard.subtitle")}</p>
              <div className="dx-hero-metrics">
                <div className="dx-chip dx-chip-indigo">
                  <Rocket size={14} />
                  <span>{t("dashboard.missions")}</span>
                  <strong>{stats.totalInternships}</strong>
                </div>
                <div className="dx-chip dx-chip-violet">
                  <Target size={14} />
                  <span>Completion</span>
                  <strong>{completionRate}%</strong>
                </div>
                <div className="dx-chip dx-chip-emerald">
                  <Flame size={14} />
                  <span>{t("dashboard.tasks")}</span>
                  <strong>{stats.todosDone}/{stats.todosTotal}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="dx-panel dx-links-panel">
            <Card.Body>
              <div className="dx-links-title">
                <Compass size={14} />
                <span>Quick Access</span>
              </div>
              <Row className="g-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Col key={link.to} xs={12} md={6}>
                      <Link to={link.to} className="dx-quick-link">
                        <span className="dx-quick-icon">
                          <Icon size={18} />
                        </span>
                        <div className="dx-quick-copy">
                          <strong>{link.title}</strong>
                          <span>{link.subtitle}</span>
                        </div>
                        <ArrowRight size={16} className="dx-quick-arrow" />
                      </Link>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </section>

        <section className="dx-stats-grid">
          <Row className="g-3">
          {topStats.map((item, index) => {
              const Icon = item.icon;
              return (
                <Col key={item.label} xs={6} xl={3}>
                  <Card className={`dx-panel dx-stat-card dx-stat-tone-${index + 1}`}>
                    <Card.Body>
                      <div className="dx-stat-top">
                        <span className="dx-stat-icon"><Icon size={17} /></span>
                        <span className="dx-stat-label">{item.label}</span>
                      </div>
                      <div className="dx-stat-value">
                        {loading ? <Spinner animation="border" size="sm" /> : item.value}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </section>

        <Row className="g-4">
          <Col xl={8}>
            <Card className="dx-panel dx-chart-panel">
              <Card.Body>
                <div className="dx-panel-head">
                  <div>
                    <div className="dx-eyebrow">{t("dashboard.careerProgress")}</div>
                    <h3>Performance Overview</h3>
                    <p>Track consistency, internship momentum, and profile strength in one place.</p>
                  </div>
                  <div className="dx-head-pills">
                    <div className="dx-head-pill">
                      <TrendingUp size={14} />
                      <span>{t("dashboard.avgScore")}: {stats.avgScore}%</span>
                    </div>
                    <div className="dx-head-pill muted">
                      <Trophy size={14} />
                      <span>Completed: {stats.completed}</span>
                    </div>
                    <div className="dx-head-pill muted">
                      <Brain size={14} />
                      <span>Enrolled: {stats.enrolled}</span>
                    </div>
                  </div>
                </div>

                <div className="dx-chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="dashboardAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.34} />
                          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "14px",
                        }}
                      />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                      <YAxis hide />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--accent-primary)"
                        strokeWidth={3}
                        fill="url(#dashboardAreaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            <Card className="dx-panel mt-4">
              <Card.Body>
                <div className="dx-panel-head">
                  <div>
                    <div className="dx-eyebrow">AI Strategy</div>
                    <h3>{t("planner.title")}</h3>
                  </div>
                </div>
                <CareerPlanner />
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="dx-panel dx-todo-card">
              <Card.Body>
                <div className="dx-panel-head">
                  <div>
                    <div className="dx-eyebrow">{t("dashboard.missionLog")}</div>
                    <h3>{t("todo.title")}</h3>
                  </div>
                  <Button as={Link} to="/cv-builder" variant="outline-primary" className="dx-cv-btn">
                    {t("dashboard.cvBuilder")}
                  </Button>
                </div>
                <TodoList />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
