import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaGlobeAmericas,
  FaGraduationCap,
  FaMagic,
  FaStar,
  FaUserAstronaut,
} from "react-icons/fa";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const SKILLS_LIST = [
  "Python", "JavaScript", "Java", "C", "C++", "C#", "Ruby", "Go", "Rust", "PHP",
  "TypeScript", "SQL", "NoSQL", "React", "Angular", "Vue.js", "Node.js", "Django",
  "Flask", "Spring Boot", "Docker", "Kubernetes", "AWS", "Azure", "DevOps",
].sort();

const occupationOptions = [
  "Software Engineering",
  "Artificial Intelligence",
  "Information Technology",
  "Business",
  "Marketing",
  "Design",
  "Other",
];

const Boarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(0);
  const [isStudent, setIsStudent] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [skillSearch, setSkillSearch] = useState("");
  const [data, setData] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    occupation: "Software Engineering",
    major: "",
    university: "",
    phone_number: "",
    experience_level: 1,
    interests: "",
    skills: [],
  });

  const steps = [
    { eyebrow: t("boarding.stepIdentity"), title: t("boarding.title"), blurb: t("boarding.prefill") },
    { eyebrow: t("boarding.stepJourney"), title: t("boarding.careerSkills"), blurb: t("boarding.aboutYou") },
    { eyebrow: t("boarding.stepFinish"), title: t("boarding.letsStart"), blurb: t("boarding.photoHint") },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/me/");
        const user = res.data || {};
        setData((prev) => ({
          ...prev,
          name: user.first_name || "",
          email: user.email || "",
          country: user.country || "",
          city: user.city || "",
          occupation: user.occupation || prev.occupation,
          major: user.major || "",
          university: user.university || "",
          phone_number: user.phone_number || "",
          experience_level: user.experience_level || 1,
          interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
          skills: Array.isArray(user.skills) ? user.skills : [],
        }));
        setIsStudent(Boolean(user.is_student));
        if (user.profile_pic) {
          setPreview(user.profile_pic);
        }
      } catch (error) {
        console.error("Failed to preload profile", error);
      } finally {
        setInitializing(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("country", data.country);
    formData.append("city", data.city);
    formData.append("occupation", data.occupation);
    formData.append("phone_number", data.phone_number);
    formData.append("experience_level", data.experience_level);
    formData.append(
      "interests",
      JSON.stringify(data.interests.split(",").map((item) => item.trim()).filter(Boolean)),
    );
    formData.append("skills", JSON.stringify(data.skills));
    formData.append("is_student", isStudent ? "True" : "False");

    if (isStudent) {
      if (data.major) formData.append("major", data.major);
      if (data.university) formData.append("university", data.university);
    }

    if (profilePic) {
      formData.append("profile_pic", profilePic);
    }

    try {
      await api.put("/user/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("boarding.success"));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(t("boarding.fail"));
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="text-center py-5">
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-4 py-lg-5" style={{ minHeight: "calc(100vh - 110px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ maxWidth: "1080px", margin: "0 auto" }}
      >
        <Card
          className="border-0 overflow-hidden"
          style={{
            background: "var(--bg-card)",
            borderRadius: "36px",
            boxShadow: "0 30px 90px rgba(15, 23, 42, 0.28)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <Row className="g-0">
            <Col lg={4}>
              <div
                className="h-100 p-4 p-lg-5 text-white"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(96, 165, 250, 0.45), transparent 42%), radial-gradient(circle at bottom right, rgba(244, 114, 182, 0.35), transparent 40%), var(--bg-nav)",
                }}
              >
                <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <FaStar size={12} />
                  <span className="small fw-800 text-uppercase" style={{ letterSpacing: "0.14em" }}>{steps[step].eyebrow}</span>
                </div>

                <h2 className="fw-900 mb-3" style={{ fontSize: "2.2rem", lineHeight: 1.05 }}>
                  {steps[step].title}
                </h2>
                <p className="text-white-50 fw-500 mb-4">{steps[step].blurb}</p>

                <div className="d-flex flex-column gap-3 mt-4">
                  {steps.map((item, index) => (
                    <div
                      key={item.eyebrow}
                      className="d-flex align-items-center gap-3 rounded-4 px-3 py-3"
                      style={{
                        background: index === step ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${index === step ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-900"
                        style={{
                          width: "34px",
                          height: "34px",
                          background: index <= step ? "linear-gradient(135deg, #60a5fa, #f472b6)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {index < step ? <FaCheckCircle size={14} /> : index + 1}
                      </div>
                      <div>
                        <div className="small fw-800 text-uppercase text-white-50" style={{ letterSpacing: "0.12em" }}>{item.eyebrow}</div>
                        <div className="fw-700">{item.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col lg={8}>
              <div className="p-4 p-lg-5" style={{ background: "var(--bg-card)", color: "var(--text-main)" }}>
                <Form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.28 }}
                    >
                      {step === 0 && (
                        <>
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                              <div className="small fw-800 text-uppercase text-primary mb-2" style={{ letterSpacing: "0.14em" }}>{t("boarding.stepIdentity")}</div>
                              <h3 className="fw-900 mb-1">{t("boarding.title")}</h3>
                              <p className="text-muted mb-0">{t("boarding.prefill")}</p>
                            </div>
                            <div
                              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: "88px", height: "88px", background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(236,72,153,0.18))" }}
                            >
                              {preview ? (
                                <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <FaUserAstronaut size={32} className="text-primary" />
                              )}
                            </div>
                          </div>

                          <Row className="g-4">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-700">{t("boarding.name")}</Form.Label>
                                <Form.Control name="name" value={data.name} onChange={handleChange} placeholder={t("boarding.fullNamePlaceholder")} required />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-700">{t("boarding.email")}</Form.Label>
                                <Form.Control value={data.email} readOnly disabled />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-700">{t("boarding.country")}</Form.Label>
                                <Form.Control name="country" value={data.country} onChange={handleChange} placeholder={t("boarding.countryPlaceholder")} required />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-700">{t("boarding.city")}</Form.Label>
                                <Form.Control name="city" value={data.city} onChange={handleChange} placeholder={t("boarding.cityPlaceholder")} required />
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}

                      {step === 1 && (
                        <>
                          <div className="mb-4">
                            <div className="small fw-800 text-uppercase text-warning mb-2" style={{ letterSpacing: "0.14em" }}>{t("boarding.stepJourney")}</div>
                            <h3 className="fw-900 mb-1">{t("boarding.careerSkills")}</h3>
                            <p className="text-muted mb-0">{t("boarding.aboutYou")}</p>
                          </div>

                          <Row className="g-4">
                            <Col md={7}>
                              <Form.Group className="mb-4">
                                <Form.Label className="fw-700"><FaBriefcase className="me-2 text-warning" />{t("boarding.occupation")}</Form.Label>
                                <Form.Select name="occupation" onChange={handleChange} value={data.occupation}>
                                  {occupationOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-4">
                                <Form.Label className="fw-700"><FaGlobeAmericas className="me-2 text-primary" />{t("boarding.phone")}</Form.Label>
                                <Form.Control name="phone_number" value={data.phone_number} onChange={handleChange} placeholder={t("boarding.phonePlaceholder")} required />
                              </Form.Group>
                            </Col>

                            <Col md={5}>
                              <div className="h-100 rounded-4 p-4" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(99,102,241,0.12)" }}>
                                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                                  <FaGraduationCap />
                                  <span className="fw-800">{t("boarding.isStudent")}</span>
                                </div>
                                <Form.Check
                                  type="switch"
                                  id="student-switch"
                                  checked={isStudent}
                                  onChange={(e) => setIsStudent(e.target.checked)}
                                  label={isStudent ? t("boarding.studentOn") : t("boarding.studentOff")}
                                  className="fw-700"
                                />
                                <p className="small text-muted mt-3 mb-0">
                                  {isStudent ? t("boarding.studentHintOn") : t("boarding.studentHintOff")}
                                </p>
                              </div>
                            </Col>
                          </Row>

                          {isStudent && (
                            <Row className="g-4 mt-1">
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label className="fw-700">{t("boarding.major")}</Form.Label>
                                  <Form.Control name="major" value={data.major} onChange={handleChange} placeholder={t("boarding.majorPlaceholder")} />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label className="fw-700">{t("boarding.university")}</Form.Label>
                                  <Form.Control name="university" value={data.university} onChange={handleChange} placeholder={t("boarding.universityPlaceholder")} />
                                </Form.Group>
                              </Col>
                            </Row>
                          )}

                          <Form.Group className="mt-4">
                            <Form.Label className="fw-700">
                              {t("boarding.experience")} ({data.experience_level} {t("boarding.stars")})
                            </Form.Label>
                            <Form.Range min={1} max={5} step={1} value={data.experience_level} onChange={handleChange} name="experience_level" />
                            <div className="d-flex justify-content-between text-muted small">
                              <span>{t("boarding.beginner")}</span>
                              <span>{t("boarding.expert")}</span>
                            </div>
                          </Form.Group>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="mb-4">
                            <div className="small fw-800 text-uppercase mb-2" style={{ letterSpacing: "0.14em", color: "#ec4899" }}>{t("boarding.stepFinish")}</div>
                            <h3 className="fw-900 mb-1">{t("boarding.letsStart")}</h3>
                            <p className="text-muted mb-0">{t("boarding.photoHint")}</p>
                          </div>

                          <Row className="g-4">
                            <Col md={4}>
                              <div className="rounded-4 p-4 h-100 text-center" style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(99,102,241,0.12)" }}>
                                <div
                                  className="rounded-circle mx-auto mb-3 overflow-hidden d-flex align-items-center justify-content-center"
                                  style={{ width: "132px", height: "132px", background: "rgba(255,255,255,0.72)" }}
                                >
                                  {preview ? (
                                    <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    <FaUserAstronaut size={46} className="text-primary" />
                                  )}
                                </div>
                                <Form.Group>
                                  <Form.Label className="btn btn-dark rounded-pill px-4 fw-700 border-0">
                                    {t("boarding.uploadPhoto")}
                                    <Form.Control type="file" hidden onChange={handleFileChange} accept="image/*" />
                                  </Form.Label>
                                </Form.Group>
                              </div>
                            </Col>

                            <Col md={8}>
                              <Form.Group className="mb-4">
                                <Form.Label className="fw-700">{t("boarding.hobbies")}</Form.Label>
                                <Form.Control
                                  name="interests"
                                  placeholder={t("boarding.interestsPlaceholder")}
                                  value={data.interests}
                                  onChange={handleChange}
                                />
                              </Form.Group>

                              <Form.Group>
                                <Form.Label className="fw-700">{t("boarding.skills")}</Form.Label>
                                <Form.Control
                                  placeholder={t("boarding.searchSkills")}
                                  value={skillSearch}
                                  onChange={(e) => setSkillSearch(e.target.value)}
                                  className="mb-3"
                                />
                                <div
                                  className="d-flex flex-wrap gap-2"
                                  style={{
                                    maxHeight: "180px",
                                    overflowY: "auto",
                                    padding: "14px",
                                    background: "rgba(15,23,42,0.04)",
                                    borderRadius: "20px",
                                    border: "1px solid rgba(148,163,184,0.14)",
                                  }}
                                >
                                  {SKILLS_LIST.filter((skill) => skill.toLowerCase().includes(skillSearch.toLowerCase())).map((skill) => (
                                    <Badge
                                      key={skill}
                                      pill
                                      bg={data.skills.includes(skill) ? "primary" : "light"}
                                      text={data.skills.includes(skill) ? "white" : "dark"}
                                      className="px-3 py-2 fw-700"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        const newSkills = data.skills.includes(skill)
                                          ? data.skills.filter((item) => item !== skill)
                                          : [...data.skills, skill];
                                        setData({ ...data, skills: newSkills });
                                      }}
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                {data.skills.length > 0 && (
                                  <div className="small text-muted mt-2">
                                    {t("boarding.selected")}: {data.skills.join(", ")}
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                    <Button variant="link" className="text-decoration-none fw-800 px-0" onClick={prevStep} disabled={step === 0 || loading}>
                      <FaArrowLeft className="me-2" />
                      {t("boarding.back")}
                    </Button>

                    {step < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="rounded-pill px-4 py-2 fw-800 border-0"
                        style={{ background: "linear-gradient(135deg, #2563eb, #ec4899)" }}
                      >
                        {t("boarding.next")}
                        <FaArrowRight className="ms-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="dark"
                        size="lg"
                        type="submit"
                        disabled={loading}
                        className="rounded-pill px-4 fw-800 border-0"
                        style={{ background: "linear-gradient(135deg, #0f172a, #1d4ed8)" }}
                      >
                        {loading ? <Spinner size="sm" animation="border" /> : <><FaMagic className="me-2" />{t("boarding.letsStart")}</>}
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Boarding;
