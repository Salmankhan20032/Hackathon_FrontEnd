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
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaMoneyBillWave,
  FaUserCircle,
  FaStar,
  FaRegStar,
  FaCommentDots,
  FaShieldAlt,
  FaHeart,
  FaTag,
} from "react-icons/fa";
import api, { makeImgUrl } from "../api";
import { toast } from "react-toastify";
import { useLanguage } from "../LanguageContext";

const ProductDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const reviewKey = `market_reviews_${id}`;

  const [product, setProduct] = useState(state?.product || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!product);
  const [chatSending, setChatSending] = useState(false);
  const [offerSending, setOfferSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [chatUnread, setChatUnread] = useState(0);
  const chatEndRef = useRef(null);
  const lastMessageRef = useRef(0);

  useEffect(() => {
    const init = async () => {
      try {
        const [u] = await Promise.all([api.get("/user/me/")]);
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
    const storedReviews = JSON.parse(localStorage.getItem(reviewKey) || "[]");
    setReviews(Array.isArray(storedReviews) ? storedReviews : []);
  }, [reviewKey]);

  useEffect(() => {
    if (!product) return;
    setSelectedImage(0);
    fetchSuggestedProducts(product);
    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => clearInterval(interval);
  }, [product?.id]);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setChatUnread(0);
    }
  }, [chatOpen, messages]);

  const fetchSuggestedProducts = async (baseProduct) => {
    try {
      const res = await api.get("/market/list/");
      const items = Array.isArray(res.data) ? res.data : [];
      const filtered = items
        .filter((item) => item.id !== baseProduct.id)
        .sort((a, b) => {
          const aScore = Number(a.seller?.id === baseProduct.seller?.id) + Number(a.condition === baseProduct.condition);
          const bScore = Number(b.seller?.id === baseProduct.seller?.id) + Number(b.condition === baseProduct.condition);
          return bScore - aScore;
        })
        .slice(0, 4);
      setSuggestedProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch suggested products", err);
      setSuggestedProducts([]);
    }
  };

  const fetchChat = async () => {
    if (!product) return;
    try {
      const res = await api.get(`/market/chat/${product.id}/`);
      const nextMessages = Array.isArray(res.data) ? res.data : [];
      if (!chatOpen && nextMessages.length > lastMessageRef.current) {
        setChatUnread(nextMessages.length - lastMessageRef.current);
      }
      lastMessageRef.current = nextMessages.length;
      setMessages(nextMessages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !product) return;
    setChatSending(true);
    try {
      await api.post(`/market/chat/${product.id}/`, { message: newMessage.trim() });
      setNewMessage("");
      await fetchChat();
    } catch (err) {
      toast.error(t("common.failed"));
    } finally {
      setChatSending(false);
    }
  };

  const sendOffer = async () => {
    if (!offerPrice.trim() || !product) return;
    setOfferSending(true);
    try {
      await api.post(`/market/offer/send/${product.id}/`, {
        offered_price: offerPrice,
      });
      toast.success(t("product.offerSentToast"));
      setOfferPrice("");
    } catch (err) {
      toast.error(t("common.failed"));
    } finally {
      setOfferSending(false);
    }
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    const next = [
      {
        id: Date.now(),
        author: currentUser?.first_name || "User",
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        date: new Date().toISOString(),
      },
      ...reviews,
    ];
    setReviews(next);
    localStorage.setItem(reviewKey, JSON.stringify(next));
    setReviewForm({ rating: 5, comment: "" });
    toast.success(t("product.reviewSaved"));
  };

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

  const gallery = [product.pic_1, product.pic_2, product.pic_3].filter(Boolean);
  const activeImage = makeImgUrl(gallery[selectedImage]) || "https://picsum.photos/seed/product/1200/900";
  const isSeller = currentUser?.id === product?.seller?.id;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <Container className="market-detail-page py-4 py-lg-5">
      <div className="market-detail-topbar">
        <Button
          variant="link"
          onClick={() => navigate("/marketplace")}
          className="market-detail-back"
        >
          <FaArrowLeft className="me-2" /> {t("product.back")}
        </Button>
      </div>

      <Row className="g-4">
        <Col xl={7}>
          <Card className="market-detail-hero-card">
            <Card.Body>
              <div className="market-detail-gallery">
                <div className="market-detail-main-image-wrap">
                  <img src={activeImage} alt={product.title} className="market-detail-main-image" />
                  <div className="market-detail-image-badges">
                    <Badge className="market-detail-pill">
                      <FaTag size={11} /> {product.condition || "New"}
                    </Badge>
                    <Badge className="market-detail-pill">
                      <FaHeart size={11} /> {averageRating}
                    </Badge>
                  </div>
                </div>
                {gallery.length > 1 && (
                  <div className="market-detail-thumbs">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={`market-detail-thumb ${selectedImage === index ? "is-active" : ""}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img src={makeImgUrl(image)} alt={`thumb-${index}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="market-detail-copy">
                <div className="market-detail-title-row">
                  <div>
                    <h1>{product.title}</h1>
                    <p>{product.description}</p>
                  </div>
                  <div className="market-detail-price-block">
                    <span>{t("market.price")}</span>
                    <strong>${product.price}</strong>
                  </div>
                </div>

                <div className="market-detail-trust-grid">
                  <div className="market-detail-trust-card">
                    <FaUserCircle className="market-detail-trust-icon" />
                    <div>
                      <span>{t("product.sellerLabel")}</span>
                      <strong>{product.seller?.first_name || "Seller"}</strong>
                    </div>
                  </div>
                  <div className="market-detail-trust-card">
                    <FaShieldAlt className="market-detail-trust-icon" />
                    <div>
                      <span>{t("product.verifiedLabel")}</span>
                      <strong>{reviews.length} {t("product.reviewsLabel")}</strong>
                    </div>
                  </div>
                  <div className="market-detail-trust-card">
                    <FaStar className="market-detail-trust-icon" />
                    <div>
                      <span>{t("product.ratingLabel")}</span>
                      <strong>{averageRating}/5</strong>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="market-detail-side-card">
            <Card.Body>
              <div className="market-detail-side-head">
                <div>
                  <span className="market-detail-kicker">{t("product.offerZone")}</span>
                  <h3>{t("product.makeOfferTitle")}</h3>
                </div>
                <Badge className="market-detail-rating-chip">
                  <FaStar size={11} /> {averageRating}
                </Badge>
              </div>

              {!isSeller ? (
                <>
                  <InputGroup className="market-detail-offer-group mb-3">
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
                      onClick={sendOffer}
                      disabled={offerSending}
                    >
                      {offerSending ? <Spinner size="sm" /> : <><FaMoneyBillWave className="me-2" /> {t("product.offerBtn")}</>}
                    </Button>
                  </InputGroup>
                  <Button
                    className="market-detail-chat-launch"
                    onClick={() => setChatOpen((prev) => !prev)}
                  >
                    <FaCommentDots className="me-2" />
                    {chatOpen ? t("product.hideChat") : t("product.openChat")}
                  </Button>
                </>
              ) : (
                <div className="market-detail-seller-note">{t("product.sellerNote")}</div>
              )}
            </Card.Body>
          </Card>

          <Card className="market-detail-side-card mt-4">
            <Card.Body>
              <div className="market-detail-side-head">
                <div>
                  <span className="market-detail-kicker">{t("product.communityTitle")}</span>
                  <h3>{t("product.commentsTitle")}</h3>
                </div>
              </div>

              <Form onSubmit={submitReview} className="market-review-form">
                <Row className="g-3">
                  <Col sm={4}>
                    <Form.Select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    >
                      {[5, 4, 3, 2, 1].map((rate) => (
                        <option key={rate} value={rate}>{rate} {t("product.starsWord")}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={8}>
                    <Form.Control
                      placeholder={t("product.commentPlaceholder")}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                    />
                  </Col>
                </Row>
                <Button type="submit" className="market-review-btn mt-3">
                  {t("product.addComment")}
                </Button>
              </Form>

              <div className="market-review-list mt-4">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="market-review-item">
                    <div className="market-review-top">
                      <strong>{review.author}</strong>
                      <span>{Array.from({ length: 5 }).map((_, idx) => idx < review.rating ? <FaStar key={idx} /> : <FaRegStar key={idx} />)}</span>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                )) : (
                  <div className="text-muted">{t("product.noComments")}</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <section className="market-suggested-block mt-5">
        <div className="market-detail-section-head">
          <div>
            <span className="market-detail-kicker">{t("product.suggestedTitle")}</span>
            <h3>{t("product.suggestedSubtitle")}</h3>
          </div>
        </div>
        <Row className="g-4">
          {suggestedProducts.map((item) => (
            <Col md={6} xl={3} key={item.id}>
              <Link to={`/market/${item.id}`} state={{ product: item }} className="market-suggested-card">
                <div className="market-suggested-image-wrap">
                  <img src={makeImgUrl(item.pic_1) || "https://picsum.photos/seed/suggested/600/400"} alt={item.title} />
                </div>
                <div className="market-suggested-copy">
                  <h4>{item.title}</h4>
                  <div className="market-suggested-meta">
                    <span>${item.price}</span>
                    <small>{item.condition}</small>
                  </div>
                </div>
              </Link>
            </Col>
          ))}
          {suggestedProducts.length === 0 && (
            <Col xs={12}>
              <div className="market-detail-seller-note">{t("market.noProducts")}</div>
            </Col>
          )}
        </Row>
      </section>

      {!isSeller && (
      <div className={`market-chat-fab ${chatOpen ? "is-open" : ""}`}>
        {!chatOpen && (
          <button type="button" className="market-chat-bubble" onClick={() => setChatOpen(true)}>
            <FaCommentDots />
            {chatUnread > 0 && <span className="market-chat-unread">{chatUnread}</span>}
          </button>
        )}

        {chatOpen && (
          <Card className="market-chat-panel">
            <Card.Header className="market-chat-header">
              <div>
                <strong>{t("product.chatTitle")}</strong>
                <small>{product.title}</small>
              </div>
              <button type="button" className="market-chat-close" onClick={() => setChatOpen(false)}>×</button>
            </Card.Header>
            <Card.Body className="market-chat-messages">
              {messages.length > 0 ? messages.map((msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`market-chat-message ${String(msg.sender) === String(currentUser?.id) ? "is-own" : ""}`}
                >
                  <div className="market-chat-author">{msg.sender_name}</div>
                  <div className="market-chat-bubble-copy">{msg.message}</div>
                </div>
              )) : (
                <div className="text-muted">{t("product.startChatHint")}</div>
              )}
              <div ref={chatEndRef} />
            </Card.Body>
            <Card.Footer className="market-chat-footer">
              <Form onSubmit={sendMessage}>
                <InputGroup className="market-chat-input">
                  <Form.Control
                    className="border-0 bg-transparent text-main px-3"
                    placeholder={t("product.messagePlaceholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="border-0 px-4" disabled={chatSending}>
                    {chatSending ? <Spinner size="sm" /> : <FaPaperPlane />}
                  </Button>
                </InputGroup>
              </Form>
            </Card.Footer>
          </Card>
        )}
      </div>
      )}
    </Container>
  );
};

export default ProductDetail;
