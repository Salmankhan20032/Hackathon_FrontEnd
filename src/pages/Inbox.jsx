import React, { useState, useEffect } from "react";
import { Container, ListGroup, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { FaUserCircle, FaEnvelopeOpenText } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";
import { motion } from "framer-motion";

const Inbox = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await api.get("/market/inbox/");
        setChats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="grow" variant="primary" /></div>;

  return (
    <Container className="py-5" style={{ maxWidth: "700px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-main mb-4 fw-900 d-flex align-items-center gap-3">
            <FaEnvelopeOpenText className="text-primary" /> {t("inbox.title")}
        </h2>
        
        {chats.length === 0 ? (
          <div className="glass-panel p-5 text-center rounded-5">
             <p className="text-muted fw-800 mb-0 opacity-50">{t("inbox.empty")}</p>
          </div>
        ) : (
          <ListGroup className="border-0 shadow-sm rounded-5 overflow-hidden">
            {chats.map((chat, index) => (
              <ListGroup.Item
                key={index}
                action
                className="glass-panel border-0 border-bottom d-flex align-items-center p-4 transition-all"
                style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border) !important' }}
                onClick={() => {
                  navigate("/marketplace");
                }}
              >
                <div className="rounded-circle bg-primary bg-opacity-10 p-1 me-3">
                   <FaUserCircle size={45} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 fw-900 text-main">{chat.other_user_name}</h6>
                    <small className="text-muted fw-700">
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                     <Badge bg="info" className="bg-opacity-10 text-info fw-900 border border-info border-opacity-25" style={{ fontSize: '0.65rem' }}>
                        {t("inbox.regarding")} {chat.product_title}
                     </Badge>
                  </div>
                  <p className="mb-0 text-truncate text-muted fw-600" style={{ fontSize: '0.9rem' }}>
                    {chat.last_message}
                  </p>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </motion.div>
    </Container>
  );
};

export default Inbox;
