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

  return (
    <div className="dashboard-minimal-shell">
      <Container fluid="xl" className="dashboard-minimal-container">
        <section className="dashboard-minimal-hero">
          <div className="dashboard-minimal-copy">
            <Badge className="dashboard-minimal-badge">
              <Sparkles size={14} />
              <span>{t("dashboard.systemActive")} {t("dashboard.active")}</span>
            </Badge>
            <h1 className="dashboard-minimal-title">
              {t("nav.home")}, {user.first_name || "Commander"}
            </h1>
            <p className="dashboard-minimal-subtitle">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="dashboard-minimal-quick">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to} className="dashboard-minimal-linkcard">
                  <div className="dashboard-minimal-linkicon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="dashboard-minimal-linktitle">{link.title}</div>
                    <div className="dashboard-minimal-linksubtitle">{link.subtitle}</div>
                  </div>
                  <ArrowRight size={16} className="dashboard-minimal-linkarrow" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="dashboard-minimal-stats">
          <Row className="g-3">
            {topStats.map((item) => {
              const Icon = item.icon;
              return (
                <Col key={item.label} xs={6} xl={3}>
                  <Card className="dashboard-stat-card">
                    <Card.Body>
                      <div className="dashboard-stat-top">
                        <span className="dashboard-stat-icon"><Icon size={18} /></span>
                        <span className="dashboard-stat-label">{item.label}</span>
                      </div>
                      <div className="dashboard-stat-value">
                        {loading ? <Spinner animation="border" size="sm" /> : item.value}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </section>

        <Row className="g-4 dashboard-main-grid">
          <Col xl={8}>
            <Card className="dashboard-panel-card dashboard-chart-panel">
              <Card.Body>
                <div className="dashboard-panel-head">
                  <div>
                    <div className="dashboard-panel-eyebrow">{t("dashboard.careerProgress")}</div>
                    <h3>Performance Overview</h3>
                  </div>
                  <div className="dashboard-panel-meta dashboard-panel-meta-compact">
                    <div className="dashboard-meta-pill">
                      <TrendingUp size={14} />
                      <span>{t("dashboard.avgScore")}: {stats.avgScore}%</span>
                    </div>
                    <div className="dashboard-meta-pill is-muted">
                      <span>{t("dashboard.missions")}: {stats.totalInternships}</span>
                    </div>
                  </div>
                </div>
                <div className="dashboard-chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="dashboardAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "16px",
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
                <div className="dashboard-chart-footer">
                  <div className="dashboard-chart-kpi">
                    <span>{t("dashboard.missions")}</span>
                    <strong>{stats.totalInternships}</strong>
                  </div>
                  <div className="dashboard-chart-kpi">
                    <span>{t("dashboard.tasks")}</span>
                    <strong>{stats.todosDone}/{stats.todosTotal}</strong>
                  </div>
                  <div className="dashboard-chart-kpi">
                    <span>{t("dashboard.profileStrength")}</span>
                    <strong>{stats.cvScore}%</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="dashboard-panel-card mt-4">
              <Card.Body>
                <div className="dashboard-panel-head">
                  <div>
                    <div className="dashboard-panel-eyebrow">AI Strategy</div>
                    <h3>{t("planner.title")}</h3>
                  </div>
                </div>
                <CareerPlanner />
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="dashboard-panel-card dashboard-side-card">
              <Card.Body>
                <div className="dashboard-panel-head">
                  <div>
                    <div className="dashboard-panel-eyebrow">{t("dashboard.missionLog")}</div>
                    <h3>{t("todo.title")}</h3>
                  </div>
                  <Button as={Link} to="/cv-builder" variant="outline-primary" className="dashboard-cv-btn">
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
