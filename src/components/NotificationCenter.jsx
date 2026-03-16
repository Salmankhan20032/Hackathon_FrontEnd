import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaTimes, FaBriefcase, FaShoppingBag, FaGraduationCap, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const typeIcons = {
  job: <FaBriefcase size={14} className="text-primary" />,
  market: <FaShoppingBag size={14} className="text-success" />,
  internship: <FaGraduationCap size={14} className="text-warning" />,
  cv: <FaFileAlt size={14} className="text-info" />,
  general: <FaCheckCircle size={14} className="text-secondary" />,
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

    try {
      const cvRes = await api.get("/cv/");
      const cv = cvRes.data || {};
      let score = 0;
      if (cv.summary && cv.summary.length > 10) score += 25;
      if (cv.skills && cv.skills.length > 0) score += 25;
      if (cv.work_experience && cv.work_experience.length > 0) score += 25;
      if (cv.education_details && cv.education_details.length > 0) score += 25;
      if (score < 75) {
        notifs.push({
          id: now + 20,
          title: t("notif.cvScoreTitle").replace("{score}", score),
          body: t("notif.cvScoreBody"),
          type: "cv",
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

  const refresh = () => {
    localStorage.removeItem("app_notifications");
    setNotifications([]);
    generateNotifications();
  };

  return (
    <div className="position-relative" ref={ref} style={{ zIndex: 1200 }}>
      <Button
        variant="link"
        className="p-2 position-relative text-main border-0"
        onClick={() => { setOpen(o => !o); if (unreadCount > 0) markAllRead(); }}
        style={{ borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}
        title={t("notif.title")}
      >
        <FaBell size={16} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="position-absolute top-0 end-0 badge rounded-pill bg-danger"
              style={{ fontSize: "0.55rem", minWidth: "16px", height: "16px", padding: "0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="position-absolute end-0 shadow-lg"
            style={{
              top: "calc(100% + 12px)",
              width: "340px",
              background: "var(--glass-bg)",
              backdropFilter: "blur(25px) saturate(200%)",
              border: "1px solid var(--glass-border)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <span className="fw-900 text-main" style={{ fontSize: "0.9rem" }}>🔔 {t("notif.title")}</span>
              <div className="d-flex gap-2">
                <Button variant="link" size="sm" className="p-0 text-muted fw-800 small text-decoration-none" onClick={refresh}>{t("notif.refresh")}</Button>
              </div>
            </div>

            <div style={{ maxHeight: "380px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaBell size={24} className="mb-2 opacity-25" />
                  <p className="small fw-900 opacity-50">{t("notif.caughtUp")}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="d-flex align-items-start gap-3 px-4 py-3"
                    onClick={() => markRead(n.id)}
                    style={{
                      borderBottom: "1px solid var(--glass-border)",
                      cursor: "pointer",
                      background: n.read ? "transparent" : "rgba(var(--accent-primary-rgb, 79, 172, 254), 0.1)",
                    }}
                  >
                    <div className="flex-shrink-0 mt-1">{typeIcons[n.type] || typeIcons.general}</div>
                    <div className="flex-grow-1">
                      <div className="fw-900 text-main" style={{ fontSize: "0.82rem" }}>{n.title}</div>
                      <div className="text-muted fw-700" style={{ fontSize: "0.75rem" }}>{n.body}</div>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 rounded-circle bg-primary" style={{ width: "8px", height: "8px", marginTop: "6px" }}></div>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-muted flex-shrink-0"
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    >
                      <FaTimes size={10} />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
