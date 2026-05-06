import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaMoneyBillWave,
  FaUserCircle,
} from "react-icons/fa";
import api, { makeImgUrl } from "../api";
import { toast } from "react-toastify";
import { useLanguage } from "../LanguageContext";

const ProductDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();

  const [product, setProduct] = useState(state?.product || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!product);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await api.get("/user/me/");
        setCurrentUser(u.data);

        if (!product) {
          const res = await api.get(`/market/detail/${id}/`);
          setProduct(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error(t("common.failed"));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [product?.id]);

  const fetchChat = async () => {
    if (!product) return;
    try {
      const res = await api.get(`/market/chat/${product.id}/`);
      setMessages(Array.isArray(res.data) ? res.data : []);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !product) return;
    await api.post(`/market/chat/${product.id}/`, { message: newMessage });
    setNewMessage("");
    fetchChat();
  };

  const isSeller = currentUser?.id === product?.seller?.id;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="grow" variant="primary" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h3 className="text-main fw-900">{t("common.failed")}</h3>
        <Button variant="link" onClick={() => navigate("/marketplace")}>
          {t("product.back")}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button
        variant="link"
        onClick={() => navigate("/marketplace")}
        className="text-main mb-4 text-decoration-none fw-600"
      >
        <FaArrowLeft className="me-2" /> {t("product.back")}
      </Button>
      <Row className="g-4">
        <Col lg={7}>
          <Card
            className="border-0 shadow-lg p-3 glass-panel"
            style={{ borderRadius: "25px" }}
          >
            <img
              src={makeImgUrl(product.pic_1) || "https://picsum.photos/seed/product/800/600"}
              className="rounded"
              style={{
                width: "100%",
                height: "400px",
                objectFit: "contain",
                backgroundColor: "rgba(0,0,0,0.05)",
              }}
              alt="product"
            />
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <h2 className="fw-900 text-main">{product.title}</h2>
                <h2 className="text-success fw-900">${product.price}</h2>
              </div>
              <p className="text-muted fw-500">{product.description}</p>
              <hr className="opacity-10" />
              <div className="d-flex align-items-center">
                <FaUserCircle size={40} className="me-3 text-primary" />
                <div>
                  <h6 className="mb-0 fw-800 text-main">{t("product.sellerLabel")}: {product.seller?.first_name}</h6>
                  <small className="text-muted fw-600">{t("product.verifiedLabel")}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card
            className="border-0 shadow-lg h-100 d-flex flex-column glass-panel"
            style={{ borderRadius: "25px" }}
          >
            <Card.Header className="bg-transparent border-0 py-3 fw-900 text-main">
              {t("product.chatTitle")}
            </Card.Header>
            <Card.Body className="overflow-auto" style={{ maxHeight: "400px" }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-3 d-flex ${msg.sender === currentUser?.id ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`p-2 rounded-3 px-3 ${msg.sender === currentUser?.id ? "bg-primary text-white" : "bg-light text-dark shadow-sm"}`}
                    style={{ maxWidth: "80%" }}
                  >
                    <small
                      className={`d-block fw-800 ${msg.sender === currentUser?.id ? "text-white-50" : "text-muted"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {msg.sender_name}
                    </small>
                    <span className="fw-600">{msg.message}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 p-3">
              <Form onSubmit={sendMessage}>
                <InputGroup className="bg-white rounded-pill shadow-sm overflow-hidden">
                  <Form.Control
                    className="border-0 bg-transparent text-main px-3"
                    placeholder={t("product.messagePlaceholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="border-0 px-4">
                    <FaPaperPlane />
                  </Button>
                </InputGroup>
              </Form>
              {!isSeller && (
                <div className="mt-3">
                  <InputGroup className="bg-white rounded-pill shadow-sm overflow-hidden">
                    <Form.Control
                      type="number"
                      className="border-0 bg-transparent text-main px-3"
                      placeholder={t("product.offerPlaceholder")}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                    <Button
                      variant="warning"
                      className="border-0 px-4 fw-800"
                      onClick={async () => {
                        try {
                          await api.post(`/market/offer/send/${product.id}/`, {
                            offered_price: offerPrice,
                          });
                          toast.success(t("product.offerSentToast"));
                          setOfferPrice("");
                        } catch {
                          toast.error(t("common.failed"));
                        }
                      }}
                    >
                      <FaMoneyBillWave className="me-2" /> {t("product.offerBtn")}
                    </Button>
                  </InputGroup>
                </div>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
