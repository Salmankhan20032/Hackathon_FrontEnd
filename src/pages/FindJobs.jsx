import React, { useEffect, useState } from "react";
import { Badge, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaEdit,
  FaExternalLinkAlt,
  FaHistory,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaUserCog,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const JOBS_CACHE_KEY = "skillx_jobs_snapshot_v2";
const INITIAL_VISIBLE = 12;

const readLocalJobCache = () => {
  if (typeof window === "undefined") {
    return { jobs: [], meta: null };
  }
  try {
    const raw = window.localStorage.getItem(JOBS_CACHE_KEY);
    if (!raw) {
      return { jobs: [], meta: null };
    }
    const parsed = JSON.parse(raw);
    return {
      jobs: Array.isArray(parsed?.jobs) ? parsed.jobs : [],
      meta: parsed?.meta || null,
    };
  } catch {
    return { jobs: [], meta: null };
  }
};

const writeLocalJobCache = (jobs, meta) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    JOBS_CACHE_KEY,
    JSON.stringify({
      jobs: Array.isArray(jobs) ? jobs : [],
      meta: {
        ...(meta || {}),
        cached_at: new Date().toISOString(),
      },
    })
  );
};

const FindJobs = () => {
  const { t } = useLanguage();
  const [cachedLocal] = useState(() => readLocalJobCache());
  const [jobs, setJobs] = useState(cachedLocal.jobs);
  const [query, setQuery] = useState(cachedLocal.meta?.query_used || "");
  const [location, setLocation] = useState(cachedLocal.meta?.location_used || "");
  const [cachedMeta, setCachedMeta] = useState(
    cachedLocal.meta || { query_used: "", location_used: "", cached: false, cached_at: "" }
  );
  const [searchMode, setSearchMode] = useState("profile");
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/me/");
        setUserProfile(res.data);

        const occupation = res.data.occupation || "";
        const skills = res.data.skills || [];
        const city = res.data.city || "";
        const country = res.data.country || "";

        const autoQuery = occupation || skills[0] || "Software Developer";
        const autoLocation =
          city && country ? `${city}, ${country}` : city || country || "";

        if (!cachedLocal.meta?.query_used) {
          setQuery(autoQuery);
        }
        if (!cachedLocal.meta?.location_used) {
          setLocation(autoLocation);
        }
      } catch (err) {
        console.error("Could not fetch profile", err);
      } finally {
        setProfileLoading(false);
        loadSavedJobs(false);
      }
    };
    fetchProfile();
  }, []);

  const syncCache = (nextJobs, nextMeta) => {
    setJobs(nextJobs);
    setCachedMeta(nextMeta);
    setVisibleCount(INITIAL_VISIBLE);
    writeLocalJobCache(nextJobs, nextMeta);
  };

  const loadSavedJobs = async (showSpinner = true) => {
    if (showSpinner) setLoadingSaved(true);
    try {
      const res = await api.get("/jobs/scrape/");
      const nextJobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      const nextMeta = {
        query_used: res.data?.query_used || "",
        location_used: res.data?.location_used || "",
        cached: Boolean(res.data?.cached),
        cached_at: new Date().toISOString(),
      };
      syncCache(nextJobs, nextMeta);
      if (res.data?.query_used) setQuery(res.data.query_used);
      if (res.data?.location_used) setLocation(res.data.location_used);
    } catch (error) {
      console.error("Saved job load failed", error);
      if (showSpinner) {
        toast.error(t("jobs.scrapeFailToast"));
      }
    } finally {
      if (showSpinner) setLoadingSaved(false);
    }
  };

  const refreshJobs = async (e) => {
    if (e) e.preventDefault();
    setRefreshing(true);
    try {
      toast.info(t("jobs.refreshingToast").replace("{query}", query || "Software"));
      const res = await api.get("/jobs/scrape/", {
        params: { query, location, refresh: true },
      });
      const nextJobs = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      const nextMeta = {
        query_used: res.data?.query_used || query,
        location_used: res.data?.location_used || location,
        cached: false,
        cached_at: new Date().toISOString(),
      };
      syncCache(nextJobs, nextMeta);
      if (nextJobs.length > 0) {
        toast.success(t("jobs.foundToast").replace("{count}", String(nextJobs.length)));
      } else {
        toast.warning(t("jobs.noJobsFoundToast"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("jobs.scrapeFailToast"));
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfileSearch = () => {
    setSearchMode("profile");
    if (!userProfile) return;
    const occupation = userProfile.occupation || "";
    const skills = userProfile.skills || [];
    const city = userProfile.city || "";
    const country = userProfile.country || "";
    setQuery(occupation || skills[0] || "Software Developer");
    setLocation(city && country ? `${city}, ${country}` : city || country || "");
  };

  const handleCustomSearch = () => {
    setSearchMode("custom");
    setQuery("");
    setLocation("");
  };

  const visibleJobs = jobs.slice(0, visibleCount);
  const canShowMore = visibleCount < jobs.length;
  const canShowLess = jobs.length > INITIAL_VISIBLE && visibleCount > INITIAL_VISIBLE;
  const displaySnapshot = cachedMeta.cached_at
    ? new Date(cachedMeta.cached_at).toLocaleString()
    : "";

  return (
    <Container className="jobs-page-shell py-4 py-lg-5">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <section className="jobs-hero-panel">
          <div className="jobs-hero-copy">
            <Badge className="jobs-hero-badge">
              <FaBriefcase /> {t("jobs.feedBadge")}
            </Badge>
            <h1>
              {t("jobs.feedTitle")} <span>{t("jobs.headerTitleSuffix")}</span>
            </h1>
            <p>{t("jobs.feedSubtitle")}</p>
            <div className="jobs-hero-meta">
              <div className="jobs-hero-stat">
                <span>{t("jobs.instantResults").replace("{count}", String(jobs.length))}</span>
                <strong>{jobs.length}</strong>
              </div>
              <div className="jobs-hero-stat">
                <span>{t("jobs.cachedAt")}</span>
                <strong>{displaySnapshot || t("jobs.cachedLocal")}</strong>
              </div>
            </div>
          </div>

          <div className="jobs-hero-actions">
            <button
              type="button"
              className={`jobs-mode-chip ${searchMode === "profile" ? "is-active" : ""}`}
              onClick={handleProfileSearch}
            >
              <FaUserCog /> {t("jobs.myProfileBtn")}
            </button>
            <button
              type="button"
              className={`jobs-mode-chip ${searchMode === "custom" ? "is-active" : ""}`}
              onClick={handleCustomSearch}
            >
              <FaEdit /> {t("jobs.customSearchBtn")}
            </button>
            {searchMode === "profile" && userProfile && (
              <div className="jobs-profile-signals">
                {userProfile.occupation && <Badge className="jobs-signal-badge">{userProfile.occupation}</Badge>}
                {(userProfile.skills || []).slice(0, 3).map((skill, i) => (
                  <Badge className="jobs-signal-badge" key={i}>{skill}</Badge>
                ))}
                {(userProfile.city || userProfile.country) && (
                  <Badge className="jobs-signal-badge">
                    <FaMapMarkerAlt /> {userProfile.city}{userProfile.city && userProfile.country ? ", " : ""}{userProfile.country}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="jobs-command-panel">
          <Form onSubmit={refreshJobs}>
            <Row className="g-3 align-items-end">
              <Col lg={4}>
                <Form.Label className="jobs-field-label">
                  <FaBriefcase /> {t("jobs.titleLabel")}
                </Form.Label>
                <Form.Control
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("jobs.titlePlaceholder")}
                  className="jobs-field-control"
                  disabled={profileLoading}
                />
              </Col>
              <Col lg={3}>
                <Form.Label className="jobs-field-label">
                  <FaMapMarkerAlt /> {t("jobs.locationLabel")}
                </Form.Label>
                <Form.Control
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("jobs.locationPlaceholder")}
                  className="jobs-field-control"
                  disabled={profileLoading}
                />
              </Col>
              <Col lg={5}>
                <div className="jobs-command-actions">
                  <Button
                    type="button"
                    variant="outline-primary"
                    className="jobs-secondary-btn"
                    onClick={() => loadSavedJobs(true)}
                    disabled={loadingSaved || refreshing || profileLoading}
                  >
                    {loadingSaved ? <Spinner size="sm" /> : <><FaHistory /> {t("jobs.loadSavedBtn")}</>}
                  </Button>
                  <Button
                    type="submit"
                    className="jobs-primary-btn"
                    disabled={loadingSaved || refreshing || profileLoading}
                  >
                    {refreshing ? <Spinner size="sm" /> : <><FaSyncAlt /> {t("jobs.refreshBtn")}</>}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
          <div className="jobs-cache-bar">
            <span>
              {cachedMeta.query_used
                ? t("jobs.savedSnapshot")
                    .replace("{query}", cachedMeta.query_used)
                    .replace("{location}", cachedMeta.location_used || t("jobs.remote"))
                : t("jobs.cachedLocal")}
            </span>
            <small>{t("jobs.liveRefreshNote")}</small>
          </div>
        </section>

        {loadingSaved && jobs.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="grow" variant="primary" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted fw-600">{t("jobs.loadingResults")}</p>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <section className="jobs-results-grid">
              {visibleJobs.map((job, index) => (
                <motion.div
                  key={`${job.id || job.link || index}`}
                  className="jobs-result-wrap"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.18) }}
                >
                  <Card className="jobs-result-card">
                    <Card.Body>
                      <div className="jobs-result-top">
                        <div className="jobs-source-pill">
                          <FaBuilding /> {job.source || "Adzuna"}
                        </div>
                        <Badge className="jobs-new-badge">{t("jobs.newBadge")}</Badge>
                      </div>

                      <div className="jobs-result-main">
                        <h3>{job.title}</h3>
                        <div className="jobs-result-company">{job.company}</div>
                        <p>{job.description}</p>
                      </div>

                      <div className="jobs-result-tags">
                        <span><FaMapMarkerAlt /> {job.location || t("jobs.remote")}</span>
                        <span><FaBriefcase /> {t("jobs.directSource")}</span>
                      </div>

                      <a
                        className="jobs-open-btn"
                        href={job.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{t("jobs.openRole")}</span>
                        <span>
                          {t("jobs.applyOnSource").replace("{source}", job.source || "Source")} <FaExternalLinkAlt />
                        </span>
                      </a>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </section>

            <div className="jobs-results-footer">
              {canShowMore && (
                <Button className="jobs-footer-btn" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}>
                  {t("jobs.showMore")} <FaArrowRight />
                </Button>
              )}
              {canShowLess && (
                <Button variant="outline-secondary" className="jobs-footer-btn jobs-footer-btn-muted" onClick={() => setVisibleCount(INITIAL_VISIBLE)}>
                  {t("jobs.showLess")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="jobs-empty-state">
            <h2>{t("jobs.zeroSignalsTitle")}</h2>
            <p>{t("jobs.zeroSignalsSubtitle")}</p>
          </div>
        )}
      </motion.div>
    </Container>
  );
};

export default FindJobs;
