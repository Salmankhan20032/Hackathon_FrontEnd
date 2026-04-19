import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTimes, FaBriefcase, FaShoppingBag, FaGraduationCap, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const typeIcons = {
  job: <FaBriefcase size={12} />,
  market: <FaShoppingBag size={12} />,
  internship: <FaGraduationCap size={12} />,
  cv: <FaFileAlt size={12} />,
  general: <FaCheckCircle size={12} />,
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const { t } = useLanguage();

  const getGeneralPool = () => [
    { title: t("notif.cvReady"), body: t("notif.cvBody"), type: "cv" },
    { title: t("notif.internReady"), body: t("notif.internBody"), type: "internship" },
    { title: t("notif.vibeReady"), body: t("notif.vibeBody"), type: "general" },
    { title: t("notif.roadmapReady"), body: t("notif.roadmapBody"), type: "job" },
    { title: t("notif.marketReady"), body: t("notif.marketBody"), type: "market" },
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("app_notifications") || "[]");
    if (stored.length > 0) {
      setNotifications(stored);
    } else {
      generateNotifications();
    }

    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const generateNotifications = async () => {
    const notifs = [];
    const now = Date.now();
    const pool = getGeneralPool();

    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 2);
    shuffled.forEach((n, i) => notifs.push({ ...n, id: now + i, read: false, time: new Date().toISOString() }));

    try {
      const res = await api.get("/internships/my/");
      const active = (res.data || []).filter(i => i.status === "Enrolled").slice(0, 1);
      if (active.length > 0) {
        notifs.push({
          id: now + 10,
          title: t("notif.deadlineTitle"),
          body: t("notif.deadlineBody").replace("{title}", active[0].title),
          type: "internship",
          read: false,
          time: new Date().toISOString()
        });
      }
    } catch (_) {}

    setNotifications(notifs);
    localStorage.setItem("app_notifications", JSON.stringify(notifs));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("app_notifications", JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("app_notifications", JSON.stringify(updated));
  };

  const dismiss = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("app_notifications", JSON.stringify(updated));
  };

  return (
    <div className="notif-center" ref={ref}>
      <button
        className="nav-icon-btn"
        onClick={() => { setOpen(o => !o); if (unreadCount > 0) markAllRead(); }}
        title={t("notif.title")}
      >
        <FaBell />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="notif-badge"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="notif-dropdown"
          >
            <div className="notif-header">
              <span className="fw-800 fs-small text-uppercase ls-2 opacity-50">{t("notif.title")}</span>
              {notifications.length > 0 && (
                 <button className="notif-clear-btn" onClick={() => setNotifications([])}>Clear</button>
              )}
            </div>

            <div className="notif-list custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <p className="fw-700 small opacity-30 mb-0">{t("notif.caughtUp")}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notif-type-icon">{typeIcons[n.type] || typeIcons.general}</div>
                    <div className="notif-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-body">{n.body}</div>
                    </div>
                    <button className="notif-dismiss" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}>
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .notif-center { position: relative; }
        .notif-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border: 2px solid var(--glass-bg);
          border-radius: 50%;
          font-size: 0;
        }
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: -10px;
          width: 320px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 2000;
        }
        .notif-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-clear-btn {
          border: none;
          background: transparent;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
          opacity: 0.6;
        }
        .notif-clear-btn:hover { opacity: 1; }
        
        .notif-list {
          max-height: 350px;
          overflow-y: auto;
        }
        .notif-empty {
          padding: 40px 20px;
          text-align: center;
        }
        .notif-item {
          padding: 16px 20px;
          display: flex;
          gap: 15px;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid var(--glass-border);
          position: relative;
        }
        .notif-item:hover { background: rgba(0,0,0,0.02); }
        .notif-item.unread { background: rgba(var(--accent-primary-rgb), 0.03); }
        
        .notif-type-icon {
          width: 32px;
          height: 32px;
          background: var(--bg-body);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
        }
        .notif-content { flex-grow: 1; min-width: 0; }
        .notif-item-title { font-weight: 800; font-size: 0.85rem; margin-bottom: 2px; color: var(--text-main); }
        .notif-item-body { font-weight: 500; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
        
        .notif-dismiss {
          border: none;
          background: transparent;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        .notif-item:hover .notif-dismiss { opacity: 0.5; }
        .notif-dismiss:hover { opacity: 1 !important; color: #ef4444; }

        .fs-small { font-size: 0.65rem; }
        .ls-2 { letter-spacing: 0.15em; }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
