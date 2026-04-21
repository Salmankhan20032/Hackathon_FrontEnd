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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUserEdit,
  FaCamera,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaStar,
  FaEnvelope,
  FaCheckCircle,
  FaUniversity,
  FaAward,
  FaArrowRight,
  FaSignOutAlt,
  FaTrashAlt,
  FaPhoneAlt,
  FaGlobe,
  FaLayerGroup,
  FaUserAstronaut,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api, { makeImgUrl } from "../api";
import { useLanguage } from "../LanguageContext";

const SKILLS_LIST = [
  "Python", "JavaScript", "Java", "C", "C++", "C#", "Ruby", "Go", "Rust", "PHP",
  "TypeScript", "SQL", "NoSQL", "React", "Angular", "Vue.js", "Node.js", "Django",
  "Flask", "Spring Boot", "Docker", "Kubernetes", "AWS", "Azure", "DevOps",
].sort();

const OCCUPATIONS = [
  "Software Engineering",
  "Artificial Intelligence",
  "Information Technology",
  "Product Design",
  "Data Science",
  "Cybersecurity",
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    occupation: "",
    major: "",
    university: "",
    phone_number: "",
    experience_level: 1,
    is_student: false,
    interests: [],
    skills: [],
    profile_pic: null,
  });

  useEffect(() => {
    fetchProfile();
    fetchCertificates();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/me/");
      const u = res.data;
      setUserData({
        name: u.first_name || "",
        email: u.email || "",
        country: u.country || "",
        city: u.city || "",
        occupation: u.occupation || "",
        major: u.major || "",
        university: u.university || "",
        phone_number: u.phone_number || "",
        experience_level: u.experience_level || 1,
        is_student: Boolean(u.is_student),
        interests: Array.isArray(u.interests) ? u.interests : [],
        skills: Array.isArray(u.skills) ? u.skills : [],
        profile_pic: u.profile_pic || null,
      });
      setPreview(u.profile_pic || null);
    } catch (error) {
      toast.error(t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await api.get("/internships/my/");
      const internships = Array.isArray(res.data) ? res.data : [];
      setCertificates(internships.filter((item) => item.status === "Graded" && item.score >= 60));
    } catch (error) {
      console.error("Failed to fetch certificates", error);
      setCertificates([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("country", userData.country);
    formData.append("city", userData.city);
    formData.append("occupation", userData.occupation);
    formData.append("university", userData.university);
    formData.append("phone_number", userData.phone_number);
    formData.append("experience_level", userData.experience_level);
    formData.append("is_student", userData.is_student ? "True" : "False");
    formData.append("interests", JSON.stringify(userData.interests));
    formData.append("skills", JSON.stringify(userData.skills));
    if (userData.is_student) {
      formData.append("major", userData.major);
    }
    if (newProfilePic) {
      formData.append("profile_pic", newProfilePic);
    }

    try {
      await api.put("/user/update/", formData);
      toast.success(t("profile.updateSuccess"));
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(t("common.failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("profile.deleteConfirm"))) return;
    setDeleting(true);
    try {
      await api.delete("/user/delete/");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.success(t("profile.deleteSuccess"));
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(t("common.failed"));
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (key, value) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSkill = (skill) => {
    setUserData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((item) => item !== skill)
        : [...prev.skills, skill],
    }));
  };

  const filteredSkills = SKILLS_LIST.filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase()));
  const completionScore = [
    userData.name,
    userData.email,
    userData.occupation,
    userData.city,
    userData.country,
    userData.skills.length > 0 ? "skills" : "",
    preview ? "photo" : "",
  ].filter(Boolean).length;
  const completionPercent = Math.min(100, Math.round((completionScore / 7) * 100));
  const locationLabel = [userData.city, userData.country].filter(Boolean).join(", ") || t("profile.locationFallback");
  const interestItems = Array.isArray(userData.interests) ? userData.interests : [];

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="profile-portal py-4 py-lg-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Row className="g-4 align-items-start">
          <Col xl={4}>
            <div className="profile-identity-rail glass-panel">
              <div className="profile-orbit" />
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-shell">
                  <img
                    src={makeImgUrl(preview) || "https://picsum.photos/seed/profile/220/220"}
                    alt="Profile"
                    className="profile-avatar-img"
                  />
                  {isEditing && (
                    <label className="profile-avatar-overlay">
                      <FaCamera size={22} />
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          if (!e.target.files?.[0]) return;
                          const file = e.target.files[0];
                          setNewProfilePic(file);
                          setPreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="profile-identity-copy">
                <div className="profile-label-row">
                  <span className="profile-kicker">{t("profile.title")}</span>
                  <Badge className="profile-verified-chip">
                    <FaCheckCircle size={11} /> {t("profile.verified")}
                  </Badge>
                </div>
                <h1 className="profile-name">{userData.name || t("profile.title")}</h1>
                <div className="profile-contact-line">
                  <FaEnvelope size={13} />
                  <span>{userData.email}</span>
                </div>
                {userData.phone_number && (
                  <div className="profile-contact-line">
                    <FaPhoneAlt size={12} />
                    <span>{userData.phone_number}</span>
                  </div>
                )}
              </div>

              <div className="profile-rail-stats">
                <div className="profile-rail-stat">
                  <span>{t("profile.completion")}</span>
                  <strong>{completionPercent}%</strong>
                </div>
                <div className="profile-rail-stat">
                  <span>{t("profile.skillsCount")}</span>
                  <strong>{userData.skills.length}</strong>
                </div>
                <div className="profile-rail-stat">
                  <span>{t("profile.certsCount")}</span>
                  <strong>{certificates.length}</strong>
                </div>
              </div>

              <div className="profile-rail-actions">
                <Button
                  variant={isEditing ? "outline-secondary" : "primary"}
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="profile-primary-action"
                >
                  {isEditing ? t("profile.cancelEdit") : <><FaUserEdit className="me-2" /> {t("profile.editIdentity")}</>}
                </Button>
                <Button variant="outline-primary" className="profile-secondary-action" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> {t("profile.logoutCta")}
                </Button>
              </div>

              <div className="profile-danger-panel">
                <div>
                  <div className="profile-danger-title">{t("profile.deleteCta")}</div>
                  <div className="profile-danger-copy">{t("profile.deleteHint")}</div>
                </div>
                <Button variant="danger" className="profile-danger-btn" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? <Spinner size="sm" /> : <><FaTrashAlt className="me-2" /> {t("profile.deleteCta")}</>}
                </Button>
              </div>
            </div>
          </Col>

          <Col xl={8}>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-profile"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="profile-studio glass-panel"
                >
                  <div className="profile-section-head">
                    <div>
                      <span className="profile-section-kicker">{t("profile.editWorkspace")}</span>
                      <h2>{t("profile.settings")}</h2>
                    </div>
                    <div className="profile-section-pill">{completionPercent}%</div>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Row className="g-4">
                      <Col md={6}>
                        <Card className="profile-edit-card h-100">
                          <Card.Body>
                            <h5>{t("profile.identityPanel")}</h5>
                            <div className="profile-field-grid">
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.fullName")}</Form.Label>
                                <Form.Control value={userData.name} onChange={(e) => updateField("name", e.target.value)} placeholder={t("profile.namePlaceholder")} />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.occupation")}</Form.Label>
                                <Form.Select value={userData.occupation} onChange={(e) => updateField("occupation", e.target.value)}>
                                  {OCCUPATIONS.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.phone")}</Form.Label>
                                <Form.Control value={userData.phone_number} onChange={(e) => updateField("phone_number", e.target.value)} placeholder="+90 ..." />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.rating")}</Form.Label>
                                <Form.Select value={userData.experience_level} onChange={(e) => updateField("experience_level", Number(e.target.value))}>
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <option key={level} value={level}>{t("profile.stars").replace("{count}", level)}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="profile-edit-card h-100">
                          <Card.Body>
                            <h5>{t("profile.locationPanel")}</h5>
                            <div className="profile-field-grid">
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.country")}</Form.Label>
                                <Form.Control value={userData.country} onChange={(e) => updateField("country", e.target.value)} />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.city")}</Form.Label>
                                <Form.Control value={userData.city} onChange={(e) => updateField("city", e.target.value)} />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.university")}</Form.Label>
                                <Form.Control value={userData.university} onChange={(e) => updateField("university", e.target.value)} />
                              </Form.Group>
                              <Form.Group>
                                <Form.Label className="auth-label">{t("profile.major")}</Form.Label>
                                <Form.Control value={userData.major} onChange={(e) => updateField("major", e.target.value)} />
                              </Form.Group>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12}>
                        <Card className="profile-edit-card">
                          <Card.Body>
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
                              <div>
                                <h5>{t("profile.skillSearch")}</h5>
                                <p className="text-muted mb-0">{t("profile.skillHint")}</p>
                              </div>
                              <Form.Control
                                placeholder={t("profile.skillPlaceholder")}
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                                className="profile-skill-search"
                              />
                            </div>
                            <div className="profile-skill-picker">
                              {filteredSkills.map((skill) => {
                                const active = userData.skills.includes(skill);
                                return (
                                  <button
                                    key={skill}
                                    type="button"
                                    className={`profile-skill-pill ${active ? "is-active" : ""}`}
                                    onClick={() => toggleSkill(skill)}
                                  >
                                    {skill}
                                  </button>
                                );
                              })}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12}>
                        <div className="d-flex justify-content-end">
                          <Button type="submit" className="profile-save-btn" disabled={saving}>
                            {saving ? <Spinner size="sm" /> : t("profile.save")}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                  key="view-profile"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="profile-mosaic">
                    <section className="profile-hero-panel glass-panel">
                      <div className="profile-hero-grid">
                        <div>
                          <span className="profile-section-kicker">{t("profile.profileOverview")}</span>
                          <h2>{userData.occupation || t("profile.professional")}</h2>
                          <p>{t("profile.currentBase").replace("{location}", locationLabel)}</p>
                        </div>
                        <div className="profile-signal-stack">
                          <div className="profile-signal-card">
                            <FaMapMarkerAlt />
                            <div>
                              <span>{t("profile.location")}</span>
                              <strong>{locationLabel}</strong>
                            </div>
                          </div>
                          <div className="profile-signal-card">
                            <FaStar />
                            <div>
                              <span>{t("profile.rating")}</span>
                              <strong>{t("profile.stars").replace("{count}", userData.experience_level)}</strong>
                            </div>
                          </div>
                          <div className="profile-signal-card">
                            <FaUserAstronaut />
                            <div>
                              <span>{t("profile.modeLabel")}</span>
                              <strong>{userData.is_student ? t("profile.studentProfile") : t("profile.professional")}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="profile-panel profile-panel-dark">
                      <div className="profile-panel-head">
                        <div>
                          <span className="profile-section-kicker">{t("profile.commandDeck")}</span>
                          <h3>{t("profile.identitySnapshot")}</h3>
                        </div>
                      </div>
                      <div className="profile-info-grid">
                        <div className="profile-info-card">
                          <FaBriefcase />
                          <span>{t("profile.occupation")}</span>
                          <strong>{userData.occupation || t("profile.noneYet")}</strong>
                        </div>
                        <div className="profile-info-card">
                          <FaGlobe />
                          <span>{t("profile.location")}</span>
                          <strong>{locationLabel}</strong>
                        </div>
                        <div className="profile-info-card">
                          <FaUniversity />
                          <span>{t("profile.university")}</span>
                          <strong>{userData.university || t("profile.noneYet")}</strong>
                        </div>
                        <div className="profile-info-card">
                          <FaLayerGroup />
                          <span>{t("profile.skillsCount")}</span>
                          <strong>{userData.skills.length} {t("profile.stackLabel")}</strong>
                        </div>
                      </div>
                    </section>

                    {userData.is_student && (
                      <section className="profile-panel profile-panel-academic">
                        <div className="profile-panel-head">
                          <div>
                            <span className="profile-section-kicker">{t("profile.academicTrack")}</span>
                            <h3>{t("profile.studentProfile")}</h3>
                          </div>
                        </div>
                        <div className="profile-academic-copy">
                          <FaGraduationCap className="profile-academic-icon" />
                          <p>{t("profile.currentlyAt").replace("{uni}", userData.university || t("profile.noneYet")).replace("{major}", userData.major || t("profile.noneYet"))}</p>
                        </div>
                      </section>
                    )}

                    <section className="profile-panel">
                      <div className="profile-panel-head">
                        <div>
                          <span className="profile-section-kicker">{t("profile.expertise")}</span>
                          <h3>{t("profile.skillConstellation")}</h3>
                        </div>
                        <div className="profile-mini-meter">
                          <span>{completionPercent}%</span>
                        </div>
                      </div>
                      <div className="profile-chip-cloud">
                        {userData.skills.length > 0 ? userData.skills.map((skill) => (
                          <span key={skill} className="profile-skill-cloud-pill">{skill}</span>
                        )) : <span className="text-muted">{t("profile.noSkills")}</span>}
                      </div>
                    </section>

                    <section className="profile-panel">
                      <div className="profile-panel-head">
                        <div>
                          <span className="profile-section-kicker">{t("profile.lifeMap")}</span>
                          <h3>{t("profile.interestsPanel")}</h3>
                        </div>
                      </div>
                      <div className="profile-interest-grid">
                        {interestItems.length > 0 ? interestItems.map((item) => (
                          <div key={item} className="profile-interest-card">
                            <span>{item}</span>
                          </div>
                        )) : <div className="text-muted">{t("profile.noInterests")}</div>}
                      </div>
                    </section>

                    <section className="profile-panel">
                      <div className="profile-panel-head">
                        <div>
                          <span className="profile-section-kicker">{t("profile.myCertificates")}</span>
                          <h3>{t("profile.certVault")}</h3>
                        </div>
                      </div>
                      {certificates.length > 0 ? (
                        <Row className="g-3">
                          {certificates.map((cert, idx) => (
                            <Col md={6} key={cert.id}>
                              <Card
                                className="profile-certificate-card"
                                role="button"
                                onClick={() => navigate(`/internships/${cert.id}`, { state: { internship: cert } })}
                              >
                                <div
                                  className="profile-certificate-band"
                                  style={{
                                    background: [
                                      "linear-gradient(135deg, #667eea, #764ba2)",
                                      "linear-gradient(135deg, #f093fb, #f5576c)",
                                      "linear-gradient(135deg, #4facfe, #00f2fe)",
                                      "linear-gradient(135deg, #43e97b, #38f9d7)",
                                    ][idx % 4],
                                  }}
                                />
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start gap-3">
                                    <div>
                                      <div className="profile-certificate-label">
                                        <FaAward size={13} /> {t("profile.certified")}
                                      </div>
                                      <h5>{cert.title}</h5>
                                    </div>
                                    <Badge className="profile-score-badge">{cert.score}%</Badge>
                                  </div>
                                  <div className="profile-certificate-link">
                                    {t("profile.viewCert")} <FaArrowRight size={11} />
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <div className="text-muted">{t("profile.noCertificates")}</div>
                      )}
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Profile;
