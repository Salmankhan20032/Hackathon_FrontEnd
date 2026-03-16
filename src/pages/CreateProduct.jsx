import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCamera, FaTimes } from "react-icons/fa";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "New",
  });
  const [images, setImages] = useState({
    pic_1: null,
    pic_2: null,
    pic_3: null,
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setImages({ ...images, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("condition", formData.condition);
    if (images.pic_1) data.append("pic_1", images.pic_1);
    if (images.pic_2) data.append("pic_2", images.pic_2);
    if (images.pic_3) data.append("pic_3", images.pic_3);

    try {
      await api.post("/market/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("marketCreate.successToast"));
      navigate("/marketplace");
    } catch (error) {
      toast.error(t("marketCreate.failToast"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card
        className="glass-panel border-0 shadow-lg"
        style={{ maxWidth: "600px", width: "100%", borderRadius: "28px" }}
      >
        <Card.Header className="d-flex justify-content-between align-items-center py-3 px-4" style={{ background: "transparent", borderBottom: "1px solid var(--glass-border)" }}>
          <h3 className="fw-900 mb-0 text-main">{t("marketCreate.title")} 🏷️</h3>
          <Button
            variant="link"
            className="p-2 text-muted border-0 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "36px", height: "36px", background: "var(--glass-border)" }}
            onClick={() => navigate("/marketplace")}
            title={t("common.close")}
          >
            <FaTimes size={16} />
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-muted text-uppercase">{t("marketCreate.itemTitle")}</Form.Label>
              <Form.Control
                name="title"
                onChange={handleChange}
                required
                placeholder={t("marketCreate.itemTitlePlaceholder")}
                className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2 fw-600"
              />
            </Form.Group>

            <Row className="mb-4">
              <Col>
                <Form.Label className="fw-700 small text-muted text-uppercase">{t("marketCreate.price")}</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2 fw-600"
                />
              </Col>
              <Col>
                <Form.Label className="fw-700 small text-muted text-uppercase">{t("marketCreate.condition")}</Form.Label>
                <Form.Select 
                  name="condition" 
                  onChange={handleChange}
                  className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2 fw-600"
                >
                  <option value="New">{t("marketCreate.new")}</option>
                  <option value="Old">{t("marketCreate.used")}</option>
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-700 small text-muted text-uppercase">{t("marketCreate.description")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                onChange={handleChange}
                required
                className="bg-transparent border-opacity-25 text-main-important rounded-3 py-2 fw-600"
              />
            </Form.Group>

            <Form.Label className="fw-700 small text-muted text-uppercase mb-3">{t("marketCreate.photos")}</Form.Label>
            <div className="d-flex gap-3 mb-5">
              {["pic_1", "pic_2", "pic_3"].map((field, i) => (
                <div
                  key={i}
                  className="border border-opacity-25 rounded-4 p-2 text-center d-flex align-items-center justify-content-center bg-white bg-opacity-5"
                  style={{
                    width: "100px",
                    height: "100px",
                    position: "relative",
                    overflow: "hidden",
                    borderStyle: "dashed",
                    borderColor: "var(--accent-primary)"
                  }}
                >
                  <div className="d-flex flex-column align-items-center gap-1">
                    <FaCamera size={24} className="text-primary opacity-50" />
                    <small className="text-muted fw-800" style={{ fontSize: '0.6rem' }}>{field.toUpperCase()}</small>
                  </div>
                  <input
                    type="file"
                    name={field}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                  {images[field] && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-success opacity-20 d-flex align-items-center justify-content-center">
                        <FaTimes size={30} className="text-success" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-100 fw-900 border-0 rounded-pill py-3 launch-btn shadow-lg"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : t("marketCreate.listBtn")}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateProduct;
