import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Dropdown, InputGroup } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaFilePdf, FaMagic, FaPlus, FaTrash, FaCheck, 
  FaUniversity, FaGraduationCap, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaGlobe, FaLanguage, FaBriefcase, FaStar, FaHeart
} from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import html2pdf from "html2pdf.js";
import { useLanguage } from "../LanguageContext";

const AbstractDecor = () => (
  <div className="abstract-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.1 }}>
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px' }}>
      <path fill="#4facfe" d="M44.7,-76.4C58.3,-69.2,70.1,-57.4,77.6,-43.3C85.1,-29.2,88.4,-12.7,86.6,3.1C84.8,18.9,78,34,67.9,46.4C57.7,58.8,44.2,68.4,29.5,74.5C14.7,80.6,-1.3,83.1,-17.1,80.3C-32.9,77.5,-48.5,69.4,-60.8,57.6C-73.1,45.8,-82.1,30.3,-85.4,13.8C-88.7,-2.7,-86.3,-20.1,-78.3,-34.9C-70.3,-49.7,-56.7,-61.8,-41.9,-68.6C-27.1,-75.4,-13.5,-76.9,1.5,-79.5C16.5,-82.1,31,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '250px' }}>
      <path fill="#00f2fe" d="M38,-65.4C50.2,-59.4,61.8,-50.7,69.4,-39.2C77,-27.7,80.7,-13.4,79.5,-0.7C78.3,12,72.3,23.2,64.2,33.3C56.1,43.4,45.9,52.5,34.4,59.3C22.9,66.1,10.1,70.6,-2.4,74.7C-14.9,78.8,-27.1,82.5,-38.2,78.5C-49.3,74.5,-59.3,62.8,-66.6,50.1C-73.9,37.3,-78.6,23.6,-79.8,9.7C-81,-4.2,-78.7,-18.3,-72.1,-30.2C-65.5,-42.1,-54.6,-51.7,-42.6,-57.8C-30.6,-63.9,-17.5,-66.4,-3.8,-59.9C9.9,-53.4,25.8,-71.4,38,-65.4Z" transform="translate(100 100)" />
    </svg>
  </div>
);

const CVBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const [cvData, setCvData] = useState({
    summary: "",
    skills: [],
    languages: [],
    custom_sections: [],
    phone_number: "",
    custom_contacts: [],
    education_details: [],
    work_experience: [],
    theme: "Modern",
    internships: [],
    user_details: {}
  });

  const themes = ["Modern", "Classic", "Refined", "Minimalist", "Abstract", "Gradient", "Dark", "Executive"];

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      const res = await api.get("/cv/");
      const data = res.data;
      setCvData({
        ...data,
        languages: data.languages || [],
        custom_contacts: data.custom_contacts || [],
        education_details: data.education_details || [],
        work_experience: data.work_experience || [],
        phone_number: data.user_details.phone_number || ""
      });
    } catch (error) {
      toast.error(t("cv.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const debouncedUpdate = useCallback(
    debounce(async (data) => {
      setSaving(true);
      try {
        await api.put("/cv/update/", data);
      } catch (error) {
        console.error("Save error", error);
      } finally {
        setSaving(false);
      }
    }, 1000),
    []
  );

  const handleFieldChange = (field, value) => {
    const updated = { ...cvData, [field]: value };
    setCvData(updated);
    debouncedUpdate(updated);
  };

  const updateArrayItem = (field, index, subfield, value) => {
    const updated = [...cvData[field]];
    updated[index][subfield] = value;
    handleFieldChange(field, updated);
  };

  const removeArrayItem = (field, index) => {
     const updated = cvData[field].filter((_, i) => i !== index);
     handleFieldChange(field, updated);
  };

  const calculateDuration = (from, to) => {
    if (!from || !to) return null;
    const start = new Date(from);
    const end = to.toLowerCase() === 'present' ? new Date() : new Date(to);
    if (isNaN(start) || isNaN(end)) return null;
    const diff = Math.abs(end - start);
    const years = (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
    return `${years} ${t("cv.years")}`;
  };

  const handleDownload = () => {
    const element = document.getElementById("cv-print-area");
    toast.info(t("cv.generatingToast"));
    window.scrollTo(0,0);
    const opt = {
      margin: 0,
      filename: `${cvData.user_details.first_name || 'My'}_Professional_CV.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save()
      .then(() => toast.success(t("cv.downloadedToast")))
      .catch(() => toast.error(t("cv.failToast")));
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>;

  return (
    <Container fluid className="py-4 px-lg-5 no-print">
      <Row className="g-4">
        <Col lg={5} xl={4}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h2 className="fw-900 mb-0 text-main">{t("cv.headerTitle")} <span className="text-gradient">{t("cv.headerSubtitle")}</span> 🖋️</h2>
               {saving ? <Badge bg="info" className="px-3">{t("cv.saving")}</Badge> : <Badge bg="success" className="px-3"><FaCheck /> {t("cv.perfect")}</Badge>}
            </div>

            <Card className="glass-panel border-0 shadow-sm rounded-4 mb-4">
               <Card.Body>
                  <label className="fw-700 small mb-2 text-muted text-uppercase">{t("cv.themes")}</label>
                  <div className="d-flex gap-2 flex-wrap mb-4">
                    {themes.map(t_name => (
                      <Button 
                        key={t_name} variant={cvData.theme === t_name ? "primary" : "outline-secondary"}
                        className="rounded-pill px-3 py-1 btn-sm fw-700"
                        onClick={() => handleFieldChange("theme", t_name)}
                      >
                        {t_name}
                      </Button>
                    ))}
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-700 small text-muted text-uppercase">{t("cv.coreContact")}</Form.Label>
                    <Form.Control 
                        value={cvData.phone_number} placeholder={t("cv.phonePlaceholder")} className="glass-panel border-0 mb-2 fw-600"
                        onChange={(e) => handleFieldChange("phone_number", e.target.value)}
                    />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                       <small className="fw-700 text-muted small text-uppercase">{t("cv.customLinks")}</small>
                       <Button variant="link" size="sm" className="fw-700 text-decoration-none" onClick={() => handleFieldChange("custom_contacts", [...cvData.custom_contacts, { label: "Link", value: "" }])}>{t("cv.addBtn")}</Button>
                    </div>
                    {cvData.custom_contacts.map((c, i) => (
                      <Row key={i} className="g-2 mb-2">
                        <Col xs={4}><Form.Control size="sm" className="glass-panel border-0 fw-600" value={c.label} onChange={(e) => updateArrayItem('custom_contacts', i, 'label', e.target.value)} /></Col>
                        <Col xs={7}><Form.Control size="sm" className="glass-panel border-0 fw-600" value={c.value} onChange={(e) => updateArrayItem('custom_contacts', i, 'value', e.target.value)} /></Col>
                        <Col xs={1}><FaTrash className="text-danger cursor-pointer small mt-2" onClick={() => removeArrayItem('custom_contacts', i)} /></Col>
                      </Row>
                    ))}
                  </Form.Group>
               </Card.Body>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-3">
               <h5 className="fw-900 mb-0 text-main">{t("cv.theArsenal")}</h5>
               <Dropdown>
                  <Dropdown.Toggle variant="primary" size="sm" className="rounded-pill px-3 fw-800 launch-btn border-0">
                    <FaPlus className="me-1" /> {t("cv.addJourneyBtn")}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="shadow-lg border-0 rounded-3 p-2">
                    <Dropdown.Item className="rounded-2 fw-700" onClick={() => handleFieldChange('work_experience', [...cvData.work_experience, { role: "Role Name", company: "Company", from: "", to: "Present", description: "" }])}>{t("cv.workExp")}</Dropdown.Item>
                    <Dropdown.Item className="rounded-2 fw-700" onClick={() => handleFieldChange('education_details', [...cvData.education_details, { degree: "Degree", school: "University", from: "", to: "" }])}>{t("cv.education")}</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="rounded-2 fw-700" onClick={() => handleFieldChange('custom_sections', [...cvData.custom_sections, { title: "Languages", type: "tags", data: [] }])}>{t("cv.languages")}</Dropdown.Item>
                    <Dropdown.Item className="rounded-2 fw-700" onClick={() => handleFieldChange('custom_sections', [...cvData.custom_sections, { title: "Custom List", type: "tags", data: [] }])}>{t("cv.customList")}</Dropdown.Item>
                    <Dropdown.Item className="rounded-2 fw-700" onClick={() => handleFieldChange('custom_sections', [...cvData.custom_sections, { title: "Text Section", type: "text", content: "" }])}>{t("cv.customText")}</Dropdown.Item>
                  </Dropdown.Menu>
               </Dropdown>
            </div>

            <AnimatePresence>
               {/* WORK EXPERIENCE EDIT */}
               {cvData.work_experience.map((exp, idx) => (
                 <Card key={`work-${idx}`} className="glass-panel border-0 mb-3 rounded-4 overflow-hidden shadow-sm">
                    <div className="bg-success bg-opacity-10 p-2 px-3 d-flex justify-content-between align-items-center">
                       <span className="fw-800 text-success small">{t("cv.workExp")} #{idx+1}</span>
                       <FaTrash className="text-danger cursor-pointer" onClick={() => removeArrayItem('work_experience', idx)} />
                    </div>
                    <Card.Body className="p-3">
                       <Row className="g-2">
                          <Col xs={6}><Form.Control size="sm" placeholder={t("cv.rolePlaceholder")} value={exp.role} onChange={(e) => updateArrayItem('work_experience', idx, 'role', e.target.value)} className="fw-600" /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder={t("cv.companyPlaceholder")} value={exp.company} onChange={(e) => updateArrayItem('work_experience', idx, 'company', e.target.value)} className="fw-600" /></Col>
                          <Col xs={6}><Form.Control size="sm" type="date" value={exp.from} onChange={(e) => updateArrayItem('work_experience', idx, 'from', e.target.value)} className="fw-600" /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder={t("cv.toPlaceholder")} value={exp.to} onChange={(e) => updateArrayItem('work_experience', idx, 'to', e.target.value)} className="fw-600" /></Col>
                          <Col xs={12}><Form.Control size="sm" as="textarea" rows={2} placeholder={t("cv.descPlaceholder")} value={exp.description} onChange={(e) => updateArrayItem('work_experience', idx, 'description', e.target.value)} className="fw-600" /></Col>
                       </Row>
                    </Card.Body>
                 </Card>
               ))}

               {/* EDUCATION EDIT */}
               {cvData.education_details.map((edu, idx) => (
                 <Card key={`edu-${idx}`} className="glass-panel border-0 mb-3 rounded-4 overflow-hidden shadow-sm">
                    <div className="bg-info bg-opacity-10 p-2 px-3 d-flex justify-content-between align-items-center">
                       <span className="fw-800 text-info small">{t("cv.education")} #{idx+1}</span>
                       <FaTrash className="text-danger cursor-pointer" onClick={() => removeArrayItem('education_details', idx)} />
                    </div>
                    <Card.Body className="p-3">
                       <Row className="g-2">
                          <Col xs={12}><Form.Control size="sm" placeholder={t("cv.degreePlaceholder")} value={edu.degree} onChange={(e) => updateArrayItem('education_details', idx, 'degree', e.target.value)} className="fw-600" /></Col>
                          <Col xs={12}><Form.Control size="sm" placeholder={t("cv.schoolPlaceholder")} value={edu.school} onChange={(e) => updateArrayItem('education_details', idx, 'school', e.target.value)} className="fw-600" /></Col>
                          <Col xs={6}><Form.Control size="sm" type="date" value={edu.from} onChange={(e) => updateArrayItem('education_details', idx, 'from', e.target.value)} className="fw-600" /></Col>
                          <Col xs={6}><Form.Control size="sm" placeholder={t("cv.toPlaceholder")} value={edu.to} onChange={(e) => updateArrayItem('education_details', idx, 'to', e.target.value)} className="fw-600" /></Col>
                       </Row>
                    </Card.Body>
                 </Card>
               ))}

               {/* CUSTOM SECTIONS EDIT */}
               {cvData.custom_sections.map((sec, idx) => (
                  <Card key={`sec-${idx}`} className="glass-panel border-0 mb-3 rounded-4 overflow-hidden shadow-sm">
                     <div className="bg-primary bg-opacity-10 p-2 px-3 d-flex justify-content-between align-items-center">
                        <Form.Control size="sm" value={sec.title} className="bg-transparent border-0 fw-800 text-primary w-50 p-0" onChange={(e) => updateArrayItem('custom_sections', idx, 'title', e.target.value)} />
                        <FaTrash className="text-danger cursor-pointer" onClick={() => removeArrayItem('custom_sections', idx)} />
                     </div>
                     <Card.Body className="p-2">
                        {sec.type === 'tags' ? (
                          <>
                            <Form.Control size="sm" placeholder="Add and Enter" className="bg-transparent border-0 small mb-2 fw-600" onKeyDown={(e) => { if(e.key === 'Enter') { const updated = [...cvData.custom_sections]; updated[idx].data = [...(updated[idx].data || []), e.target.value]; handleFieldChange('custom_sections', updated); e.target.value = ""; } }} />
                            <div className="d-flex flex-wrap gap-1">
                                {(sec.data || []).map((t_item, ti) => (
                                  <Badge key={ti} bg="secondary" className="bg-opacity-25 text-dark border-0 rounded-pill fw-700 px-2 py-1">{t_item} <FaTrash size={8} className="ms-1 cursor-pointer" onClick={() => { const u = [...cvData.custom_sections]; u[idx].data = u[idx].data.filter((_, i) => i !== ti); handleFieldChange('custom_sections', u); }} /></Badge>
                                ))}
                            </div>
                          </>
                        ) : (
                          <Form.Control as="textarea" rows={2} value={sec.content} className="bg-transparent border-0 small fw-600" placeholder={t("cv.contentPlaceholder")} onChange={(e) => updateArrayItem('custom_sections', idx, 'content', e.target.value)} />
                        )}
                     </Card.Body>
                  </Card>
               ))}
            </AnimatePresence>

            <div className="mt-5 d-grid">
               <Button onClick={handleDownload} variant="primary" className="rounded-pill py-3 fw-900 border-0 gradient-btn shadow-lg"><FaFilePdf className="me-2" /> {t("cv.downloadBtn")}</Button>
            </div>
          </motion.div>
        </Col>

        <Col lg={7} xl={8}>
          <div className="sticky-top custom-scrollbar pb-5" style={{ top: '100px', zIndex: 1, maxHeight: '90vh', overflowX: 'auto', overflowY: 'auto' }}>
            <div id="cv-print-area" className="d-flex justify-content-center" style={{ minWidth: '210mm' }}>
              <motion.div layout className={`cv-preview theme-${cvData.theme.toLowerCase()} shadow-2xl overflow-hidden position-relative`} style={{ width: '210mm', minHeight: '297mm', background: 'white', color: '#1a1a1a', padding: '15mm 15mm' }}>
                 {cvData.theme === 'Abstract' && <AbstractDecor />}
                 
                 <div className="cv-header mb-4 border-bottom pb-4 border-light cv-header-border">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h1 className="display-4 fw-900 mb-0 cv-main-title">{cvData.user_details.first_name || "PRO NAME"}</h1>
                        <p className="fs-5 fw-800 mb-2 mt-1 cv-subtitle">{cvData.user_details.occupation || "Strategy Lead"}</p>
                        <div className="d-flex gap-3 mt-3 text-muted small flex-wrap fw-700 cv-contact-info">
                           <span><FaEnvelope className="me-1 cv-icon opacity-50" /> {cvData.user_details.email}</span>
                           <span><FaPhone className="me-1 cv-icon opacity-50" /> {cvData.phone_number}</span>
                           <span><FaMapMarkerAlt className="me-1 cv-icon opacity-50" /> {cvData.user_details.city}, {cvData.user_details.country}</span>
                           {cvData.custom_contacts.map((c, i) => (<span key={i}><FaGlobe className="me-1 cv-icon opacity-50" /> {c.label}: {c.value}</span>))}
                        </div>
                      </div>
                    </div>
                 </div>

                 <Row className="g-4">
                    <Col xs={8}>
                      <section className="mb-4">
                         <h6 className="section-title">{t("cv.narrative")}</h6>
                         <p className="cv-p text-secondary fw-500">{cvData.summary || "Your professional objective..."}</p>
                      </section>

                      {/* WORK EXPERIENCE UI */}
                      <section className="mb-4">
                         <h6 className="section-title">{t("cv.industryImpact")}</h6>
                         {cvData.work_experience.map((exp, i) => (
                           <div key={i} className="mb-3 experience-item">
                              <div className="d-flex justify-content-between align-items-center">
                                 <h6 className="cv-h6 fw-900 mb-0">{exp.role} @ {exp.company}</h6>
                                 <div className="text-end">
                                    <div className="cv-small fw-900">{exp.from.split('-')[0]} - {exp.to.includes('-') ? exp.to.split('-')[0] : exp.to}</div>
                                    <Badge bg="light" className="text-primary fw-900 border" style={{fontSize:'0.55rem'}}>{calculateDuration(exp.from, exp.to)}</Badge>
                                 </div>
                              </div>
                              <p className="cv-small text-secondary mt-1 fw-500">{exp.description}</p>
                           </div>
                         ))}
                      </section>

                      {/* EDUCATION UI */}
                      <section className="mb-4 d-flex flex-column gap-3">
                         <h6 className="section-title mb-0">{t("cv.academicGenesis")}</h6>
                         {cvData.education_details.map((edu, i) => (
                           <div key={i} className="d-flex justify-content-between align-items-start">
                              <div>
                                 <h6 className="cv-h6 fw-900 mb-0">{edu.degree}</h6>
                                 <div className="cv-small text-secondary fw-700">{edu.school}</div>
                              </div>
                              <div className="cv-small fw-800 text-muted">{edu.from.split('-')[0]} - {edu.to}</div>
                           </div>
                         ))}
                         {/* Default education from profile if none added */}
                         {cvData.education_details.length === 0 && cvData.user_details.university && (
                            <div className="d-flex justify-content-between align-items-start">
                               <div>
                                  <h6 className="cv-h6 fw-900 mb-0">{cvData.user_details.major || "Degree Pursuit"}</h6>
                                  <div className="cv-small text-secondary fw-700">{cvData.user_details.university}</div>
                               </div>
                               <div className="cv-small fw-800 text-muted">Currently Active</div>
                            </div>
                         )}
                      </section>

                      {cvData.custom_sections.filter(s => s.type === 'text').map((sec, i) => (
                         <section key={i} className="mb-4 pt-1">
                            <h6 className="section-title">{sec.title}</h6>
                            <p className="cv-p text-secondary whitespace-pre-wrap fw-500">{sec.content}</p>
                         </section>
                      ))}
                    </Col>

                    <Col xs={4} className="ps-3 border-start cv-sidebar-divider">
                       <section className="mb-4 sidebar-section">
                          <h6 className="section-title cv-small">{t("cv.missionLog")}</h6>
                          {cvData.internships && cvData.internships.length > 0 ? cvData.internships.map((intern, i) => (
                            <div key={i} className="mb-2 p-2 sidebar-item rounded-2" style={{ background: 'rgba(0,0,0,0.02)', borderLeft: `3px solid ${intern.status === 'Graded' ? '#43e97b' : '#4facfe'}` }}>
                               <div className="fw-900 truncate-1 cv-xs" style={{ color: 'inherit' }}>{intern.title}</div>
                               <div className="d-flex align-items-center gap-1 mt-1">
                                 {intern.status === 'Graded' ? (
                                   <Badge pill bg="success" className="fw-900 cv-xxs px-2" style={{ fontSize: '0.5rem' }}>✓ {intern.score ? `${intern.score}% SCORE` : 'GRADED'}</Badge>
                                 ) : (
                                   <Badge pill bg="primary" className="fw-900 cv-xxs px-2" style={{ fontSize: '0.5rem' }}>⚡ {t("cv.inProgress")}</Badge>
                                 )}
                               </div>
                            </div>
                          )) : (
                            <p className="text-muted cv-xs fw-800 opacity-50">{t("cv.noMissions")}</p>
                          )}
                       </section>

                       <section className="mb-4 sidebar-section">
                          <h6 className="section-title cv-small">{t("cv.competencies")}</h6>
                          <div className="d-flex flex-wrap gap-1">
                             {cvData.skills.map((s, i) => (<span key={i} className="pill-outline fw-800 cv-xs px-2 py-1">{s}</span>))}
                          </div>
                       </section>

                       {/* Hobbies from Profile */}
                       <section className="mb-4 sidebar-section">
                          <h6 className="section-title cv-small">{t("cv.passions")}</h6>
                          <div className="d-flex flex-wrap gap-1">
                             {cvData.user_details.interests && cvData.user_details.interests.map((h, i) => (
                               <span key={i} className="pill-outline primary fw-800 cv-xs px-2 py-1"><FaHeart className="me-1 cv-xxs" /> {h}</span>
                             ))}
                          </div>
                       </section>

                       {cvData.custom_sections.filter(s => s.type === 'tags').map((sec, i) => (
                          <section key={i} className="mb-4 sidebar-section">
                             <h6 className="section-title cv-small">{sec.title}</h6>
                             <div className="d-flex flex-wrap gap-1">
                                {(sec.data || []).map((t_text, ti) => (<span key={ti} className="pill-outline fw-800 cv-xs px-2 py-1">{t_text}</span>))}
                             </div>
                          </section>
                       ))}
                    </Col>
                 </Row>
              </motion.div>
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Uncut+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Instrument+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Cinzel:wght@600;700&display=swap');

        /* BASE LAYOUT */
        .cv-preview { 
          font-family: 'Uncut Sans', sans-serif; 
          line-height: 1.5; 
          transition: all 0.5s ease;
          box-sizing: border-box;
          transform-origin: top center;
        }

        /* CUSTOM SIZES FOR A4 SCALE COMPATIBILITY */
        .cv-p { font-size: 0.8rem; margin-bottom: 0; line-height: 1.5; }
        .cv-h6 { font-size: 0.95rem; }
        .cv-small { font-size: 0.75rem; }
        .cv-xs { font-size: 0.65rem; }
        .cv-xxs { font-size: 0.55rem; }
        .cv-subtitle { font-size: 1rem; color: var(--accent-primary); }

        .section-title { 
          text-transform: uppercase; 
          font-weight: 900; 
          font-size: 0.7rem; 
          letter-spacing: 0.15em; 
          color: #888; 
          margin-bottom: 12px; 
          border-left: 3px solid var(--accent-primary); 
          padding-left: 10px; 
        }

        .pill-outline { 
          border-radius: 4px; 
          border: 1px solid #ddd; 
          color: #333; 
          text-transform: uppercase; 
          background: #fdfdfd;
        }
        .pill-outline.primary { 
          border-color: var(--accent-primary); 
          color: var(--accent-primary); 
          background: rgba(var(--accent-primary-rgb), 0.05); 
        }

        .experience-item { position: relative; padding-left: 16px; border-left: 1px solid #eee; }
        .experience-item:before { content: ""; position: absolute; left: -4px; top: 6px; width: 7px; height: 7px; background: #333; border-radius: 50%; }

        /* --- THEME OVERRIDES --- */

        /* MODERN: Clean, Tech-friendly */
        .theme-modern {
          font-family: 'Instrument Sans', sans-serif;
        }
        .theme-modern .cv-main-title { font-weight: 700; font-size: 2.2rem; }
        .theme-modern .section-title { font-weight: 700; color: #555; }
        .theme-modern .experience-item { border-left-color: #ddd; }
        .theme-modern .experience-item:before { background: var(--accent-primary); border-radius: 2px; }

        /* CLASSIC: Elegant, Academic, Serif */
        .theme-classic {
          font-family: 'Playfair Display', serif;
          padding: 20mm !important;
          background: #fdfbf7 !important;
        }
        .theme-classic .cv-main-title, .theme-classic .cv-h6, .theme-classic .section-title, .theme-classic .cv-subtitle {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          color: #2c3e50;
        }
        .theme-classic .cv-subtitle { color: #556b82; font-style: italic; }
        .theme-classic .section-title {
          border-left: none;
          border-bottom: 1px solid #2c3e50;
          padding-left: 0;
          padding-bottom: 4px;
          display: inline-block;
          margin-bottom: 15px;
        }
        .theme-classic .experience-item { border-left: none; padding-left: 0; margin-bottom: 25px; }
        .theme-classic .experience-item:before { display: none; }
        .theme-classic .pill-outline { border-radius: 0; font-family: 'Instrument Sans', sans-serif; }

        /* REFINED: Luxury, Fashion, High-end */
        .theme-refined {
          border-top: 15mm solid #111;
          border-radius: 0 !important;
          font-family: 'Space Grotesk', sans-serif;
        }
        .theme-refined .cv-main-title { font-weight: 500; letter-spacing: -1px; text-transform: uppercase; }
        .theme-refined .section-title {
          border-left: 4px solid #111;
          color: #111;
          font-weight: 600;
        }
        .theme-refined .cv-icon { color: #111 !important; opacity: 1 !important; }
        .theme-refined .experience-item:before { background: #111; }
        .theme-refined .cv-subtitle { color: #111; }
        .theme-refined .pill-outline { border-radius: 0; border: 1px solid #111; color: #111; }

        /* MINIMALIST: Architect, Design */
        .theme-minimalist {
          padding: 20mm 15mm !important;
          background: #fafafa !important;
          font-family: 'Uncut Sans', sans-serif;
        }
        .theme-minimalist .cv-main-title { font-weight: 600; letter-spacing: -0.02em; }
        .theme-minimalist .section-title {
          border-left: none;
          padding-left: 0;
          color: #000;
          border-top: 1px solid #000;
          padding-top: 6px;
          letter-spacing: 0.25em;
          margin-bottom: 12px;
        }
        .theme-minimalist .cv-header-border { border-bottom: 2px solid #000 !important; }
        .theme-minimalist .pill-outline { border: none; background: #eee; border-radius: 20px; }

        /* ABSTRACT: Creative, Bold */
        .theme-abstract {
          background: #fff !important;
          font-family: 'Instrument Sans', sans-serif;
        }
        .theme-abstract .cv-main-title { 
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .theme-abstract .section-title { border-color: #4facfe; color: #4facfe; }
        .theme-abstract .experience-item:before { background: #4facfe; }

        /* GRADIENT: Bold purple-blue split layout */
        .theme-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: #fff !important;
          font-family: 'Space Grotesk', sans-serif;
        }
        .theme-gradient .cv-header-border { background: transparent !important; border: none !important; }
        .theme-gradient .cv-main-title, .theme-gradient .cv-subtitle, .theme-gradient .cv-h6, .theme-gradient .cv-p { color: #fff !important; }
        .theme-gradient .section-title { color: rgba(255,255,255,0.7) !important; border-color: rgba(255,255,255,0.4) !important; }
        .theme-gradient .text-secondary, .theme-gradient .text-muted { color: rgba(255,255,255,0.8) !important; }
        .theme-gradient .pill-outline { background: rgba(255,255,255,0.15) !important; border: none !important; color: #fff !important; }
        .theme-gradient .experience-item { border-left-color: rgba(255,255,255,0.3) !important; }
        .theme-gradient .experience-item:before { background: #fff !important; }
        .theme-gradient .sidebar-section { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 12px; }
        
        /* DARK: Elegant dark mode resume */
        .theme-dark {
          background: #111 !important;
          color: #e6edf3 !important;
        }
        .theme-dark .cv-header { padding-bottom: 20px; border-bottom: 1px solid #333 !important; }
        .theme-dark .cv-main-title { color: #58a6ff !important; }
        .theme-dark .cv-subtitle { color: #a5d6ff; }
        .theme-dark .cv-h6 { color: #e6edf3 !important; }
        .theme-dark .section-title { color: #58a6ff !important; border-color: #58a6ff !important; }
        .theme-dark .text-secondary, .theme-dark .text-muted { color: #8b949e !important; }
        .theme-dark .pill-outline { background: #21262d !important; border: 1px solid #30363d !important; color: #58a6ff !important; }
        .theme-dark .experience-item { border-left-color: #30363d !important; }
        .theme-dark .experience-item:before { background: #58a6ff !important; }
        .theme-dark .sidebar-section { background: #161b22 !important; border-radius: 12px; padding: 12px; border: 1px solid #30363d; }
        .theme-dark .cv-sidebar-divider { border-color: #333 !important; }

        /* EXECUTIVE: Deep navy with gold accents */
        .theme-executive {
          background: #fff !important;
          border-top: 10mm solid #0f172a !important;
          border-radius: 0 !important;
          font-family: 'Cinzel', serif;
        }
        .theme-executive .cv-header { 
          background: #0f172a !important; 
          margin: -15mm -15mm 20px -15mm; 
          padding: 15mm 15mm !important; 
        }
        .theme-executive .cv-main-title { color: #fff !important; letter-spacing: 0.05em; }
        .theme-executive .cv-subtitle { color: #c9b26f !important; font-family: 'Instrument Sans', sans-serif; }
        .theme-executive .cv-contact-info, .theme-executive .cv-icon { color: rgba(255,255,255,0.7) !important; font-family: 'Instrument Sans', sans-serif; }
        .theme-executive .cv-h6 { color: #0f172a !important; font-family: 'Instrument Sans', sans-serif; font-weight: 700; }
        .theme-executive .cv-p, .theme-executive .cv-small, .theme-executive .cv-xs { font-family: 'Instrument Sans', sans-serif; }
        .theme-executive .section-title { color: #0f172a; border-color: #c9b26f !important; letter-spacing: 0.15em; font-weight: 700; width: 100%; border-bottom: 1px solid #e2e8f0; border-left: none; padding-left: 0; padding-bottom: 4px; }
        .theme-executive .pill-outline { border-radius: 0; border: 1px solid #c9b26f !important; color: #0f172a !important; }
        .theme-executive .experience-item { border-left: none; padding-left: 0; margin-bottom: 20px; }
        .theme-executive .experience-item:before { display: none; }

        .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .whitespace-pre-wrap { white-space: pre-wrap; }
        .cursor-pointer { cursor: pointer; }

        @media print { 
          body * { visibility: hidden; } 
          #cv-print-area, #cv-print-area * { visibility: visible; } 
          #cv-print-area { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; } 
          .cv-preview { box-shadow: none !important; border-radius: 0 !important; } 
          .no-print { display: none !important; } 
          /* Restore visibility for theme background colors in print */
          .theme-abstract, .theme-executive, .theme-gradient, .theme-classic, .theme-modern, .theme-minimalist, .theme-refined, .theme-dark {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default CVBuilder;
