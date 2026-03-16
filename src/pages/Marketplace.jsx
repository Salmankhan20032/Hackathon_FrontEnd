import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaShoppingBag, FaUserCircle, FaSearch, FaTimes } from "react-icons/fa";
import api, { makeImgUrl } from "../api";
import { useLanguage } from "../LanguageContext";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.seller?.first_name?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/market/list/");
      const items = Array.isArray(res.data) ? res.data : [];
      setProducts(items);
      setFiltered(items);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 position-relative">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
        <h1 className="fw-900 display-3 mb-2">
          {t("market.headerTitlePrefix")}<span className="text-gradient">{t("market.headerTitleSuffix")}</span> 🛒
        </h1>
        <p className="text-muted fs-5">{t("market.headerSubtitle")}</p>

        {/* SEARCH BAR */}
        <Row className="justify-content-center mt-4">
          <Col md={6} lg={5}>
            <InputGroup className="shadow-sm rounded-pill overflow-hidden" style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(15px)" }}>
              <InputGroup.Text className="border-0 ps-3" style={{ background: "transparent" }}>
                <FaSearch className="text-muted" size={14} />
              </InputGroup.Text>
              <Form.Control
                placeholder={t("market.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 py-2 fw-600 text-main"
                style={{ background: "transparent", outline: "none", boxShadow: "none" }}
              />
              {search && (
                <Button
                  variant="link"
                  className="border-0 pe-3 text-muted"
                  style={{ background: "transparent" }}
                  onClick={() => setSearch("")}
                >
                  <FaTimes size={14} />
                </Button>
              )}
            </InputGroup>
            {search && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted small mt-2 fw-600"
              >
                {filtered.length === 1 
                  ? t("market.resultFor").replace("{query}", search)
                  : t("market.resultsFor").replace("{count}", filtered.length).replace("{query}", search)
                }
              </motion.p>
            )}
          </Col>
        </Row>
      </motion.div>

      {/* FAB SELL BUTTON */}
      <Button
        variant="primary"
        className="position-fixed shadow-lg d-flex align-items-center justify-content-center launch-btn border-0"
        style={{
          bottom: "40px",
          right: "40px",
          zIndex: 100,
          borderRadius: "50%",
          width: "65px",
          height: "65px",
          fontSize: "28px",
        }}
        onClick={() => navigate("/market/create")}
        title={t("market.sellBtn")}
      >
        <FaPlus />
      </Button>

      {loading ? (
        <div className="text-center mt-5 py-5">
          <Spinner animation="grow" variant="primary" />
          <p className="mt-3 text-muted fw-600">{t("market.loading")}</p>
        </div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((product) => (
                <Col sm={12} md={6} lg={4} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -10 }}
                    onClick={() => navigate(`/market/${product.id}`, { state: { product } })}
                    style={{ height: "100%" }}
                  >
                    <Card className="h-100 border-0 shadow-sm glass-panel overflow-hidden" style={{ cursor: "pointer", borderRadius: "24px" }}>
                      <div style={{ height: "240px", position: "relative" }}>
                        <img
                          src={makeImgUrl(product.pic_1) || "https://picsum.photos/seed/market/400/300"}
                          alt={product.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <Badge
                          className="position-absolute glass-panel m-3 fs-6 px-3 py-2 fw-800"
                          style={{ bottom: 0, left: 0, color: "var(--text-main)" }}
                        >
                          ${product.price}
                        </Badge>
                        <div className="position-absolute top-0 end-0 m-3">
                          <Badge bg={product.condition === "New" ? "success" : "warning"} className="rounded-pill px-3 fw-800">
                            {product.condition}
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="p-4 d-flex flex-column">
                        <h4 className="fw-900 mb-2 text-main text-truncate">{product.title}</h4>
                        <p className="text-muted small mb-4 flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.description}
                        </p>

                        <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: "var(--glass-border) !important" }}>
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-1">
                              <FaUserCircle size={18} className="text-primary" />
                            </div>
                            <small className="fw-700 text-muted">
                              {product.seller?.first_name || "Seller"}
                            </small>
                          </div>
                          <Button variant="link" className="p-0 text-primary fw-800 text-decoration-none small">
                            {t("market.viewDetails")}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <div className="text-center py-5 glass-panel rounded-5">
                  <FaShoppingBag size={50} className="text-muted mb-3 opacity-25" />
                  <h3 className="fw-900 text-main">
                    {search ? t("market.noResults").replace("{query}", search) : t("market.noItems")}
                  </h3>
                  <p className="text-muted fw-600">
                    {search ? t("market.tryDifferent") : t("market.firstToList")}
                  </p>
                  {!search && (
                    <Button variant="primary" className="launch-btn border-0 mt-3 px-4 rounded-pill fw-800" onClick={() => navigate("/market/create")}>
                      {t("market.startSelling")}
                    </Button>
                  )}
                </div>
              </Col>
            )}
          </AnimatePresence>
        </Row>
      )}
    </Container>
  );
};

export default Marketplace;
