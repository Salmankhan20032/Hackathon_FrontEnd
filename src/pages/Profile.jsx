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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api, { makeImgUrl } from "../api";
import { useLanguage } from "../LanguageContext";

const SKILLS_LIST = [
  "Python", "JavaScript", "Java", "C", "C++", "C#", "Ruby", "Go", "Rust", "PHP",
  "TypeScript", "SQL", "NoSQL", "React", "Angular", "Vue.js", "Node.js", "Django",
  "Flask", "Spring Boot", "Docker", "Kubernetes", "AWS", "Azure", "DevOps"
].sort();

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const [skillSearch, setSkillSearch] = useState("");

  const [newProfilePic, setNewProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchCertificates();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/me/");
      const u = res.data;
      setUserData({
        name: u.first_name,
        email: u.email,
        country: u.country,
        city: u.city,
        occupation: u.occupation,
        major: u.major || "",
        university: u.university || "",
        phone_number: u.phone_number || "",
        experience_level: u.experience_level,
        is_student: u.is_student,
        interests: u.interests || [],
        skills: u.skills || [],
        profile_pic: u.profile_pic,
      });
      setPreview(u.profile_pic);
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
      const graded = internships.filter((i) => i.status === "Graded" && i.score >= 60);
      setCertificates(graded);
    } catch (err) {
      console.error("Failed to fetch certificates", err);
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
    if (userData.is_student) formData.append("major", userData.major);
    if (newProfilePic) formData.append("profile_pic", newProfilePic);

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

  if (loading)
    return (
      <div className="text-center mt-5 py-5">
        <Spinner animation="grow" variant="primary" />
      </div>
    );

  return (
    <Container className="py-5">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Card
          className="shadow-lg border-0 bg-transparent overflow-hidden"
          style={{ borderRadius: "30px" }}
        >
          {/* Header Banner */}
          <div
            className="position-relative"
            style={{
              height: "220px",
              background: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
            }}
          >
             <div className="position-absolute bottom-0 start-0 w-100 p-4 bg-gradient-to-t from-black/50 to-transparent">
             </div>
          </div>

          <Card.Body className="glass-panel position-relative pt-0 px-4 pb-5">
            {/* Profile Avatar Section */}
            <div
              className="position-relative"
              style={{ marginTop: "-90px", zIndex: 10 }}
            >
              <div className="d-flex flex-column flex-md-row align-items-end gap-4 p-2">
                <div
                  className="rounded-circle border border-5 border-body overflow-hidden shadow-lg position-relative"
                  style={{ width: "160px", height: "160px", background: "var(--bg-body)" }}
                >
                  <img
                    src={makeImgUrl(preview) || "https://picsum.photos/seed/profile/160/160"}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isEditing && (
                    <label className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-40 cursor-pointer">
                      <FaCamera size={30} className="text-white" />
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          if(e.target.files[0]) {
                            setNewProfilePic(e.target.files[0]);
                            setPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="flex-grow-1 pb-2 text-center text-md-start">
                  <h1 className="fw-900 mb-1 d-flex align-items-center justify-content-center justify-content-md-start gap-2 text-main">
                    {userData.name}
                    <FaCheckCircle className="text-primary" size={20} title={t("profile.verified")} />
                  </h1>
                  <p className="text-muted fw-800 mb-0 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                    <FaEnvelope /> {userData.email}
                  </p>
                </div>

                <div className="pb-2">
                  <Button
                    variant={isEditing ? "outline-secondary" : "primary"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-pill px-4 fw-900 shadow-sm border-0 launch-btn"
                  >
                    {isEditing ? t("profile.cancelEdit") : <><FaUserEdit className="me-2" /> {t("profile.editIdentity")}</>}
                  </Button>
                </div>
              </div>
            </div>

            <hr className="my-5 border-subtle" />

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Row className="g-4">
                    <Col md={4}>
                       <Card className="h-100 glass-panel border-0 text-center p-4 rounded-4 shadow-sm">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-block mx-auto mb-3">
                            <FaBriefcase className="text-primary" size={30} />
                          </div>
                          <h6 className="text-muted text-uppercase fw-900 small mb-2" style={{ letterSpacing: '0.1em' }}>{t("profile.professional")}</h6>
                          <h5 className="mb-0 fw-800 text-main">{userData.occupation}</h5>
                       </Card>
                    </Col>
                    <Col md={4}>
                       <Card className="h-100 glass-panel border-0 text-center p-4 rounded-4 shadow-sm">
                          <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-inline-block mx-auto mb-3">
                            <FaMapMarkerAlt className="text-danger" size={30} />
                          </div>
                          <h6 className="text-muted text-uppercase fw-900 small mb-2" style={{ letterSpacing: '0.1em' }}>{t("profile.location")}</h6>
                          <h5 className="mb-0 fw-800 text-main">{userData.city}, {userData.country}</h5>
                       </Card>
                    </Col>
                    <Col md={4}>
                       <Card className="h-100 glass-panel border-0 text-center p-4 rounded-4 shadow-sm">
                          <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-block mx-auto mb-3">
                            <FaStar className="text-warning" size={30} />
                          </div>
                          <h6 className="text-muted text-uppercase fw-900 small mb-2" style={{ letterSpacing: '0.1em' }}>{t("profile.rating")}</h6>
                          <h5 className="mb-0 fw-800 text-main">{t("profile.stars").replace("{count}", userData.experience_level)}</h5>
                       </Card>
                    </Col>
                    {userData.is_student && (
                      <Col md={12}>
                        <Card className="glass-panel border-0 border-start border-primary border-5 p-4 d-flex flex-row align-items-center gap-4 rounded-4 shadow-sm">
                          <div className="rounded-circle bg-info bg-opacity-10 p-3">
                            <FaGraduationCap size={40} className="text-info" />
                          </div>
                          <div>
                            <h4 className="mb-1 fw-900 text-main">{t("profile.studentProfile")}</h4>
                            <p className="text-muted mb-0 fw-600">
                                {t("profile.currentlyAt")
                                    .replace("{uni}", userData.university)
                                    .replace("{major}", userData.major)}
                            </p>
                          </div>
                        </Card>
                      </Col>
                    )}
                    <Col md={12}>
                      <Card className="glass-panel border-0 p-4 rounded-4 shadow-sm">
                        <h6 className="text-primary tracking-widest fw-900 small mb-3 text-uppercase">{t("profile.expertise")}</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {userData.skills.length > 0 ? userData.skills.map((skill, idx) => (
                            <Badge key={idx} bg="primary" className="rounded-pill p-2 px-3 fw-800 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                               {skill}
                            </Badge>
                          )) : <span className="text-muted small fw-600 italic">{t("profile.noSkills")}</span>}
                        </div>
                      </Card>
                    </Col>

                    {/* CERTIFICATES SECTION */}
                    {certificates.length > 0 && (
                      <Col md={12}>
                        <Card className="glass-panel border-0 p-4 rounded-4 shadow-sm">
                          <h6 className="text-primary tracking-widest fw-900 small mb-3 text-uppercase">🏆 {t("profile.myCertificates")}</h6>
                          <Row className="g-3">
                            {certificates.map((cert, idx) => (
                              <Col md={6} lg={4} key={cert.id}>
                                <Card
                                  className="border-0 shadow-sm overflow-hidden rounded-4 h-100"
                                  role="button"
                                  onClick={() => navigate(`/internships/${cert.id}`, { state: { internship: cert } })}
                                  style={{ transition: 'transform 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                  <div
                                    className="p-3 text-center text-white"
                                    style={{
                                      background: [
                                        'linear-gradient(135deg, #667eea, #764ba2)',
                                        'linear-gradient(135deg, #f093fb, #f5576c)',
                                        'linear-gradient(135deg, #4facfe, #00f2fe)',
                                        'linear-gradient(135deg, #43e97b, #38f9d7)',
                                      ][idx % 4],
                                    }}
                                  >
                                    <FaAward size={28} className="mb-1" />
                                    <div className="fw-900" style={{ fontSize: '0.8rem' }}>{t("profile.certified")}</div>
                                  </div>
                                  <Card.Body className="p-3 text-center">
                                    <h6 className="fw-900 text-main mb-1" style={{ fontSize: '0.8rem' }}>
                                      {cert.title.length > 35 ? cert.title.substring(0, 35) + '...' : cert.title}
                                    </h6>
                                    <Badge bg="success" className="bg-opacity-10 text-success fw-900 px-3 py-1 rounded-pill">
                                      {cert.score}%
                                    </Badge>
                                    <div className="mt-2">
                                      <small className="text-primary fw-900">{t("profile.viewCert")} <FaArrowRight size={10} /></small>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card>
                      </Col>
                    )}

                    <Col md={12}>
                      <Card className="glass-panel border-0 p-4 rounded-4 shadow-sm">
                        <h6 className="text-primary tracking-widest fw-900 small mb-3 text-uppercase">{t("profile.accountActions")}</h6>
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="rounded-4 p-4 h-100 border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}>
                              <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                                  <FaSignOutAlt className="text-primary" />
                                </div>
                                <div>
                                  <div className="fw-900 text-main">{t("profile.logoutCta")}</div>
                                  <div className="small text-muted fw-600">{t("profile.logoutHint")}</div>
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                className="rounded-pill px-4 fw-800 mt-3"
                                onClick={handleLogout}
                              >
                                <FaSignOutAlt className="me-2" />
                                {t("profile.logoutCta")}
                              </Button>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="rounded-4 p-4 h-100 border" style={{ borderColor: "rgba(220, 38, 38, 0.15)", background: "rgba(220, 38, 38, 0.04)" }}>
                              <div className="d-flex align-items-center gap-3 mb-2">
                                <div className="rounded-circle p-3" style={{ background: "rgba(220, 38, 38, 0.12)" }}>
                                  <FaTrashAlt style={{ color: "#dc2626" }} />
                                </div>
                                <div>
                                  <div className="fw-900 text-main">{t("profile.deleteCta")}</div>
                                  <div className="small text-muted fw-600">{t("profile.deleteHint")}</div>
                                </div>
                              </div>
                              <Button
                                variant="danger"
                                className="rounded-pill px-4 fw-800 mt-3 border-0"
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                              >
                                {deleting ? <Spinner size="sm" /> : <><FaTrashAlt className="me-2" />{t("profile.deleteCta")}</>}
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Form onSubmit={handleSubmit} className="p-2">
                    <Row className="g-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.fullName")}</Form.Label>
                          <Form.Control
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            placeholder={t("profile.namePlaceholder")}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.occupation")}</Form.Label>
                          <Form.Select
                            value={userData.occupation}
                            onChange={(e) => setUserData({ ...userData, occupation: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          >
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Artificial Intelligence">Artificial Intelligence</option>
                            <option value="Information Technology">Information Technology</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.university")}</Form.Label>
                          <Form.Control
                            value={userData.university}
                            placeholder={t("profile.university")}
                            onChange={(e) => setUserData({ ...userData, university: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.major")}</Form.Label>
                          <Form.Control
                            value={userData.major}
                            placeholder={t("profile.major")}
                            onChange={(e) => setUserData({ ...userData, major: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.country")}</Form.Label>
                          <Form.Control
                            value={userData.country}
                            onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.city")}</Form.Label>
                          <Form.Control
                            value={userData.city}
                            onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-800 text-muted small uppercase">{t("profile.phone")}</Form.Label>
                          <Form.Control
                            value={userData.phone_number}
                            placeholder="e.g. +90 ..."
                            onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                            className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-2">
                          <Form.Label className="fw-900 text-primary small uppercase mb-3">{t("profile.skillSearch")}</Form.Label>
                          <Form.Control
                            placeholder={t("profile.skillPlaceholder")}
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            className="mb-3 rounded-pill bg-transparent border-opacity-25 text-main-important px-4 py-2"
                          />
                          <div className="d-flex flex-wrap gap-2 p-3 rounded-4 border bg-white bg-opacity-10 mb-2" style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--glass-bg)' }}>
                            {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                              <Badge 
                                key={skill} 
                                bg={userData.skills.includes(skill) ? "primary" : "light"}
                                text={userData.skills.includes(skill) ? "white" : "dark"}
                                className="cursor-pointer transition-all border-0 shadow-sm fw-800 p-2 px-3 rounded-pill"
                                style={{
                                    background: userData.skills.includes(skill) ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'white',
                                    opacity: userData.skills.includes(skill) ? 1 : 0.7
                                }}
                                onClick={() => {
                                  const newSkills = userData.skills.includes(skill)
                                    ? userData.skills.filter(s => s !== skill)
                                    : [...userData.skills, skill];
                                  setUserData({...userData, skills: newSkills});
                                }}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="small text-muted fw-600 mt-2">{t("profile.skillHint")}</div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <div className="d-flex justify-content-end mt-4">
                           <Button
                               type="submit"
                               variant="primary"
                               disabled={saving}
                               className="rounded-pill px-5 py-3 shadow-lg fw-900 border-0 launch-btn"
                             >
                               {saving ? <Spinner size="sm" /> : t("profile.save")}
                             </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Profile;
