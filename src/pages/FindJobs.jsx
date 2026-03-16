import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaBuilding,
  FaExternalLinkAlt,
  FaUserCog,
  FaEdit,
  FaHistory,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const FindJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Search State
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [cachedMeta, setCachedMeta] = useState({ query_used: "", location_used: "", cached: false });

  // Mode: "profile" or "custom"
  const [searchMode, setSearchMode] = useState("profile");

  // User profile data
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/me/");
        setUserProfile(res.data);
        // Pre-fill with profile data
        let autoQuery = "";
        let autoLocation = "";

        const occupation = res.data.occupation || "";
        const skills = res.data.skills || [];
        const city = res.data.city || "";
        const country = res.data.country || "";
        
        if (occupation) {
          autoQuery = occupation;
        } else if (skills.length > 0) {
          autoQuery = skills[0];
        } else {
          autoQuery = "Software Developer";
        }
        
        if (city && country) {
          autoLocation = `${city}, ${country}`;
        } else if (city) {
          autoLocation = city;
        } else if (country) {
          autoLocation = country;
        }

        setQuery(autoQuery);
        setLocation(autoLocation);

        setProfileLoading(false);
        loadSavedJobs();
      } catch (err) {
        console.error("Could not fetch profile", err);
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/scrape/`);
      const nextJobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      setJobs(nextJobs);
      setCachedMeta({
        query_used: res.data?.query_used || "",
        location_used: res.data?.location_used || "",
        cached: Boolean(res.data?.cached),
      });
      if (res.data?.query_used) {
        setQuery(res.data.query_used);
      }
      if (res.data?.location_used) {
        setLocation(res.data.location_used);
      }
    } catch (error) {
      console.error("Saved job load failed", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setJobs([]);
    try {
      toast.info(t("jobs.refreshingToast").replace("{query}", query || "Software"));

      const res = await api.get(`/jobs/scrape/`, {
        params: { query: query, location: location, refresh: true },
      });

      const nextJobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      setCachedMeta({
        query_used: res.data?.query_used || query,
        location_used: res.data?.location_used || location,
        cached: false,
      });
      if (nextJobs.length > 0) {
        setJobs(nextJobs);
        toast.success(t("jobs.foundToast").replace("{count}", res.data.jobs.length));
      } else {
        toast.warning(t("jobs.noJobsFoundToast"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("jobs.scrapeFailToast"));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSearch = () => {
    setSearchMode("profile");
    if (userProfile) {
      const occupation = userProfile.occupation || "";
      const skills = userProfile.skills || [];
      const city = userProfile.city || "";
      const country = userProfile.country || "";
      
      if (occupation) {
        setQuery(occupation);
      } else if (skills.length > 0) {
        setQuery(skills[0]);
      }
      
      if (city && country) {
        setLocation(`${city}, ${country}`);
      } else if (city) {
        setLocation(city);
      } else if (country) {
        setLocation(country);
      }
    }
  };

  const handleCustomSearch = () => {
    setSearchMode("custom");
    setQuery("");
    setLocation("");
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-900 display-4 mb-2 text-main">
            {t("jobs.headerTitlePrefix")} <span className="text-gradient">{t("jobs.headerTitleSuffix")}</span> 🚀
          </h1>
          <p className="lead text-muted fw-500">
            {t("jobs.headerSubtitle")}
          </p>
          {cachedMeta.query_used && (
            <p className="small text-muted fw-700 mt-3 mb-0">
              {t("jobs.savedSnapshot")
                .replace("{query}", cachedMeta.query_used)
                .replace("{location}", cachedMeta.location_used || t("jobs.remote"))}
            </p>
          )}
        </div>

        {/* MODE TOGGLE */}
        <Row className="justify-content-center mb-4">
          <Col lg={6} className="text-center">
            <div className="d-inline-flex p-1 rounded-pill shadow-sm mb-3" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
              <Button
                variant={searchMode === "profile" ? "primary" : "link"}
                className={`fw-800 py-2 px-4 border-0 rounded-pill text-decoration-none ${searchMode === "profile" ? "shadow-sm" : "text-main"}`}
                onClick={handleProfileSearch}
                style={{ transition: 'all 0.3s' }}
              >
                <FaUserCog className="me-2" /> <span className="d-none d-sm-inline">{t("jobs.myProfileBtn")}</span>
              </Button>
              <Button
                variant={searchMode === "custom" ? "primary" : "link"}
                className={`fw-800 py-2 px-4 border-0 rounded-pill text-decoration-none ${searchMode === "custom" ? "shadow-sm" : "text-main"}`}
                onClick={handleCustomSearch}
                style={{ transition: 'all 0.3s' }}
              >
                <FaEdit className="me-2" /> <span className="d-none d-sm-inline">{t("jobs.customSearchBtn")}</span>
              </Button>
            </div>
            {searchMode === "profile" && userProfile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {userProfile.occupation && (
                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-700">
                      {userProfile.occupation}
                    </Badge>
                  )}
                  {(userProfile.skills || []).slice(0, 3).map((skill, i) => (
                    <Badge key={i} bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 fw-700">
                      {skill}
                    </Badge>
                  ))}
                  {(userProfile.city || userProfile.country) && (
                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 fw-700">
                      📍 {userProfile.city}{userProfile.city && userProfile.country ? ", " : ""}{userProfile.country}
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </Col>
        </Row>

        {/* SEARCH BAR */}
        <Row className="justify-content-center mb-5">
          <Col lg={10}>
            <Card className="shadow-lg border-0 glass-panel rounded-4">
              <Card.Body className="p-4">
                <Form onSubmit={refreshJobs}>
                  <Row className="g-3 align-items-end">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-700 small px-1 text-muted">
                          <FaBriefcase className="me-2 text-primary" /> {t("jobs.titleLabel")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("jobs.titlePlaceholder")}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="bg-transparent border-opacity-25 text-main rounded-3 py-2"
                          disabled={profileLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="fw-700 small px-1 text-muted">
                          <FaMapMarkerAlt className="me-2 text-danger" />{" "}
                          {t("jobs.locationLabel")}
                        </Form.Label>
                        <Form.Control
                          placeholder={t("jobs.locationPlaceholder")}
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="bg-transparent border-opacity-25 text-main rounded-3 py-2"
                          disabled={profileLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={5}>
                      <div className="d-grid gap-2 d-md-flex">
                        <Button
                          variant="outline-primary"
                          size="lg"
                          type="button"
                          className="flex-fill fw-800 rounded-3 py-2"
                          disabled={loading || profileLoading}
                          onClick={loadSavedJobs}
                        >
                          {loading ? <Spinner animation="border" size="sm" /> : <><FaHistory className="me-2" /> {t("jobs.loadSavedBtn")}</>}
                        </Button>
                        <Button
                          variant="primary"
                          size="lg"
                          type="submit"
                          className="flex-fill fw-900 launch-btn rounded-3 py-2"
                          disabled={loading || profileLoading}
                        >
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <FaSyncAlt className="me-2" /> {t("jobs.refreshBtn")}
                            </>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner
              animation="grow"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted fw-600">{t("jobs.loadingResults")}</p>
          </div>
        ) : (
          <Row>
            {jobs.map((job, index) => (
              <Col md={6} lg={4} className="mb-4" key={index}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ height: '100%' }}
                >
                  <Card className="h-100 shadow-sm border-0 glass-panel rounded-4">
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-3 p-2 text-primary d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                            <FaBuilding size={20} />
                          </div>
                          <Badge className="bg-opacity-10 text-main border border-secondary border-opacity-25 px-2 py-1 fw-700 small" style={{ background: 'var(--glass-border)' }}>
                            {job.source || "Web"}
                          </Badge>
                        </div>
                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 fw-800">{t("jobs.newBadge")}</Badge>
                      </div>

                      <Card.Title className="fw-900 text-main mb-1" style={{ fontSize: '1.2rem' }}>
                        {job.title}
                      </Card.Title>
                      <Card.Subtitle className="text-gradient fw-800 small mb-2 d-inline-block">
                        {job.company}
                      </Card.Subtitle>

                      {job.description && (
                        <p className="text-muted fw-500 mb-3" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {job.description}
                        </p>
                      )}

                      <div className="mb-4 d-flex flex-wrap gap-2">
                        <small className="text-muted fw-600 d-flex align-items-center rounded-pill px-2 py-1" style={{ background: 'var(--glass-border)' }}>
                          <FaMapMarkerAlt className="me-1 text-danger" />{" "}
                          {job.location || t("jobs.remote")}
                        </small>
                        <small className="text-muted fw-600 d-flex align-items-center rounded-pill px-2 py-1" style={{ background: 'var(--glass-border)' }}>
                          <FaBriefcase className="me-1 text-primary" /> {t("jobs.fullTime")}
                        </small>
                      </div>

                      <Button
                        className="w-100 fw-800 rounded-pill launch-btn border-0 py-2 d-flex justify-content-center align-items-center gap-2 mt-auto"
                        href={job.link || "#"}
                        target="_blank"
                      >
                        {t("jobs.applyOnSource").replace("{source}", job.source || "Site")} <FaExternalLinkAlt size={12} />
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}

            {/* Empty State */}
            {jobs.length === 0 && !loading && (
              <Col xs={12}>
                <div className="text-center py-5 glass-panel rounded-5">
                   <h2 className="display-6 mb-3 text-main">🦗 {t("jobs.zeroSignalsTitle")}</h2>
                   <p className="text-muted fs-5 fw-500">{t("jobs.zeroSignalsSubtitle")}</p>
                </div>
              </Col>
            )}
          </Row>
        )}
      </motion.div>
    </Container>
  );
};

export default FindJobs;
