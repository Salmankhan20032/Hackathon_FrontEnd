import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaTag, FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaGraduationCap, FaArrowRight, FaHistory, FaSyncAlt } from "react-icons/fa";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const Discounts = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ location: "", active_offers: [], updated_at: "", source: "" });
  const { t } = useLanguage();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh ? "/discounts/?refresh=true" : "/discounts/";
      const res = await api.get(url);
      setData({
        location: res.data?.location || "",
        active_offers: Array.isArray(res.data?.active_offers) ? res.data.active_offers : [],
        updated_at: res.data?.updated_at || "",
        source: res.data?.source || "",
      });
    } catch (error) {
      console.error("Failed to fetch vibes", error);
      setData((prev) => ({ ...prev, active_offers: [] }));
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Deal": return <FaTag className="text-danger" />;
      case "Event": return <FaCalendarAlt className="text-primary" />;
      case "Food": return <FaUtensils className="text-warning" />;
      case "Career": return <FaGraduationCap className="text-success" />;
      default: return <FaTag />;
    }
  };

  const getImgUrl = (query) => {
    // Use Lorem Picsum with a seed based on the query for consistent, beautiful photos
    const seed = encodeURIComponent(query || "vibes");
    return `https://picsum.photos/seed/${seed}/800/400`;
  };

  const formatUpdatedAt = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const updatedLabel = formatUpdatedAt(data.updated_at);

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <h1 className="fw-900 display-3 mb-2">
          {t("discounts.headerTitlePrefix")} <span className="text-gradient">{t("discounts.headerTitleSuffix")}</span> ✨
        </h1>
        <p className="text-muted fs-5 d-flex align-items-center justify-content-center gap-2 mb-4">
          <FaMapMarkerAlt className="text-primary" /> {t("discounts.headerSubtitle").replace("{location}", data.location || t("discounts.yourCity"))}
        </p>
        {updatedLabel && (
          <p className="small text-muted fw-700 mb-4">
            {t("discounts.lastUpdated").replace("{time}", updatedLabel)}
            {data.source === "gemini" ? ` ${t("discounts.liveBadge")}` : ""}
          </p>
        )}
        
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button 
            variant="outline-primary" 
            className="rounded-pill px-4 py-2 fw-800 shadow-sm"
            onClick={() => fetchDiscounts(false)}
            disabled={loading}
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}
          >
            {loading ? <Spinner animation="border" size="sm" /> : <><FaHistory className="me-2" /> {t("discounts.loadSavedBtn")}</>}
          </Button>
          <Button 
            variant="primary" 
            className="rounded-pill px-4 py-2 fw-800 shadow-sm launch-btn"
            onClick={() => fetchDiscounts(true)}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : <><FaSyncAlt className="me-2" /> {t("discounts.scanBtn")}</>}
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3 text-muted fw-600">{t("discounts.scanning")}</p>
        </div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {(Array.isArray(data.active_offers) ? data.active_offers : []).map((offer, index) => (
              <Col key={index} md={6} lg={4}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-100 border-0 shadow-lg glass-panel overflow-hidden" style={{ borderRadius: '24px' }}>
                    <div style={{ height: '200px', position: 'relative' }}>
                      <img
                        src={getImgUrl(offer.image_query)}
                        alt={offer.title}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514525253344-f8563391859e?auto=format&fit=crop&q=80&w=800"; }}
                      />
                      <Badge className="position-absolute top-0 end-0 m-3 glass-panel px-3 py-2 text-main" style={{ backdropFilter: 'blur(10px)' }}>
                         {offer.value}
                      </Badge>
                      <div className="position-absolute bottom-0 start-0 m-3">
                         <Badge bg="light" className="text-dark rounded-pill px-3 shadow-sm d-flex align-items-center gap-2">
                           {getIcon(offer.type)} {offer.type}
                         </Badge>
                      </div>
                    </div>
                    <Card.Body className="p-4">
                      <h4 className="fw-900 mb-2 text-main">{offer.title}</h4>
                      <p className="text-muted fw-500 small mb-4 line-clamp-2">
                        {offer.description}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center pt-3 border-top border-subtle">
                         <div className="d-flex align-items-center text-muted small fw-600">
                          <FaMapMarkerAlt className="me-1 h-100" />
                          <span className="text-truncate" style={{maxWidth: '150px'}}>{offer.location_detail}</span>
                        </div>
                        <Button variant="primary" size="sm" className="rounded-pill px-3 fw-800 border-0 launch-btn">
                           {t("discounts.exploreBtn")} <FaArrowRight className="ms-1" size={12} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      )}

      {!loading && data.active_offers.length === 0 && (
        <div className="text-center py-5">
           <div className="glass-panel p-5 rounded-5 d-inline-block">
              <h3 className="fw-900 text-main">{t("discounts.quietTitle")}</h3>
              <p className="text-muted fw-500">{t("discounts.quietSubtitle")}</p>
              <Button onClick={() => fetchDiscounts()} variant="outline-primary" className="rounded-pill px-4 mt-3 fw-800">
                {t("discounts.tryRefresh")}
              </Button>
           </div>
        </div>
      )}
    </Container>
  );
};

export default Discounts;
