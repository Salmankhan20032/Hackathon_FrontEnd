import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaPlane,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaSuitcaseRolling,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const TravelPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null); // Will hold the AI JSON list
  const [flightLink, setFlightLink] = useState("");
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.date) {
      toast.warning(t("travel.fillAllToast"));
      return;
    }

    setLoading(true);
    setPlan(null); // Reset previous plan

    try {
      const res = await api.post("/travel/plan/", formData);

      // 1. Set Flight Link
      setFlightLink(res.data.flight_search_url);

      // 2. Parse AI Response (It comes as a JSON string from Gemini)
      try {
        // Clean up markdown if Gemini added it (e.g. ```json ... ```)
        const cleanJson = res.data.travel_plan
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsedPlan = JSON.parse(cleanJson);
        setPlan(parsedPlan);
      } catch (parseError) {
        // Fallback: If AI didn't give perfect JSON, just show raw text in a list
        console.warn("Could not parse JSON, showing raw text", parseError);
        setPlan([{ name: "Travel Advice", description: res.data.travel_plan }]);
      }

      toast.success(t("travel.successToast"));
    } catch (error) {
      console.error(error);
      toast.error(t("travel.failToast"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-900 display-4 text-main">
            <span className="text-gradient">{t("travel.headerTitle")}</span>{" "}
            ✈️
          </h1>
          <p className="lead text-muted fw-500">
            {t("travel.headerSubtitle")}
          </p>
        </div>

        {/* INPUT FORM */}
        <Row className="justify-content-center mb-5">
          <Col lg={8}>
            <Card className="shadow-lg border-0 glass-panel rounded-5">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-700 small px-1 text-muted">
                          <FaPlane className="me-2 text-primary" /> {t("travel.fromLabel")}
                        </Form.Label>
                        <Form.Control
                          name="from"
                          placeholder={t("travel.fromPlaceholder")}
                          value={formData.from}
                          onChange={handleChange}
                          required
                          className="bg-transparent border-opacity-25 text-main-important py-2 rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-700 small px-1 text-muted">
                          <FaMapMarkedAlt className="me-2 text-warning" /> {t("travel.toLabel")}
                        </Form.Label>
                        <Form.Control
                          name="to"
                          placeholder={t("travel.toPlaceholder")}
                          value={formData.to}
                          onChange={handleChange}
                          required
                          className="bg-transparent border-opacity-25 text-main-important py-2 rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-700 small px-1 text-muted">
                          <FaCalendarAlt className="me-2 text-success" /> {t("travel.dateLabel")}
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          className="bg-transparent border-opacity-25 text-main-important py-2 rounded-3"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        className="w-100 mt-3 fw-900 launch-btn border-0 py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          t("travel.generateBtn")
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* RESULTS SECTION */}
        {plan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* 1. FLIGHT ACTION BUTTON */}
            <Row className="justify-content-center mb-5">
              <Col md={8}>
                <Card className="text-center border-0 glass-panel shadow-lg rounded-4 p-2 overflow-hidden" style={{ borderLeft: '5px solid var(--accent-success)' }}>
                  <Card.Body>
                    <h5 className="text-success fw-900 mb-2">{t("travel.readyTitle")}</h5>
                    <p className="text-muted fw-600 mb-4 small">
                      {t("travel.readySubtitle")}
                    </p>
                    <a
                      href={flightLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-success btn-lg w-100 fw-900 border-0 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #198754, #157347)' }}
                    >
                      <FaPlane /> {t("travel.checkFlightsBtn")}
                    </a>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <h3 className="mb-4 fw-900 text-main d-flex align-items-center gap-3">
              <FaSuitcaseRolling className="text-primary" /> {t("travel.topPlaces")}
            </h3>

            {/* 2. ITINERARY CARDS */}
            <Row>
              {Array.isArray(plan) ? (
                // If AI gave us a nice list
                plan.map((place, index) => (
                  <Col md={6} lg={4} className="mb-4" key={index}>
                    <motion.div
                      whileHover={{ y: -10 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ height: '100%' }}
                    >
                      <Card className="h-100 shadow-sm border-0 glass-panel rounded-4 overflow-hidden">
                        {/* Placeholder Image since AI doesn't give images yet */}
                        <div
                          style={{
                            height: "140px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }}
                          className="d-flex align-items-center justify-content-center text-white-50"
                        >
                          <FaMapMarkedAlt size={45} className="opacity-50" />
                        </div>
                        <Card.Body className="p-4">
                          <Card.Title className="fw-900 text-main mb-3">
                            {place.place_name ||
                              place.name ||
                              `Spot #${index + 1}`}
                          </Card.Title>
                          <Card.Text className="text-muted fw-500">
                            {place.description ||
                              place.activity ||
                              "Explore this amazing location!"}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))
              ) : (
                // Fallback if AI gave raw text
                <Col md={12}>
                  <Card className="glass-panel text-main p-4 rounded-4 shadow-lg border-0">
                    <pre
                      style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                      className="mb-0 fw-500"
                    >
                      {JSON.stringify(plan, null, 2)}
                    </pre>
                  </Card>
                </Col>
              )}
            </Row>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default TravelPlanner;
