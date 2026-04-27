import React, { useState, useEffect, useRef } from "react";
import { Badge, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  Briefcase, 
  ShoppingBag, 
  GraduationCap, 
  CheckCircle2, 
  FileText 
} from "lucide-react";
import api from "../api";
import { useLanguage } from "../LanguageContext";

const typeIcons = {
  job: <Briefcase size={14} />,
  market: <ShoppingBag size={14} />,
  internship: <GraduationCap size={14} />,
  cv: <FileText size={14} />,
  general: <CheckCircle2 size={14} />,
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
    <div className="notif-center-lucide" ref={ref}>
      <button
        className="util-btn"
        onClick={() => { setOpen(o => !o); if (unreadCount > 0) markAllRead(); }}
        title={t("notif.title")}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="notif-badge-dot"
            />
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="notif-dropdown-lucide"
          >
            <div className="notif-header-lucide">
              <span className="fw-900 small text-uppercase ls-2 opacity-50">{t("notif.title")}</span>
              {notifications.length > 0 && (
                 <button className="notif-clear-btn" onClick={() => setNotifications([])}>Clear All</button>
              )}
            </div>

            <div className="notif-list-lucide">
              {notifications.length === 0 ? (
                <div className="notif-empty-lucide">
                  <p className="fw-700 small opacity-30 mb-0">{t("notif.caughtUp")}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item-lucide ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notif-type-icon-lucide">{typeIcons[n.type] || typeIcons.general}</div>
                    <div className="notif-content-lucide">
                      <div className="notif-item-title-lucide">{n.title}</div>
                      <div className="notif-item-body-lucide">{n.body}</div>
                    </div>
                    <button className="notif-dismiss-lucide" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}>
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .notif-center-lucide { position: relative; }
        
        .notif-badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border: 2px solid var(--bg-card);
          border-radius: 50%;
          pointer-events: none;
        }

        .notif-dropdown-lucide {
          position: absolute;
          top: calc(100% + 15px);
          right: -10px;
          width: 340px;
          background: var(--bg-card);
          backdrop-filter: blur(30px);
          border: 1px solid var(--glass-border);
          border-radius: 28px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 2000;
        }

        .notif-header-lucide {
          padding: 20px 24px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notif-clear-btn {
          border: none;
          background: transparent;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
          opacity: 0.7;
          transition: all 0.2s ease;
        }
        .notif-clear-btn:hover { opacity: 1; }

        .notif-list-lucide {
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .notif-empty-lucide {
          padding: 60px 20px;
          text-align: center;
        }

        .notif-item-lucide {
          padding: 18px 24px;
          display: flex;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--glass-border);
          position: relative;
        }
        .notif-item-lucide:hover { background: rgba(0,0,0,0.02); }
        [data-theme='dark'] .notif-item-lucide:hover { background: rgba(255,255,255,0.03); }
        
        .notif-item-lucide.unread { background: rgba(var(--accent-primary-rgb), 0.04); }

        .notif-type-icon-lucide {
          width: 36px;
          height: 36px;
          background: rgba(var(--accent-primary-rgb), 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .notif-content-lucide { flex-grow: 1; min-width: 0; }
        .notif-item-title-lucide { font-weight: 800; font-size: 0.9rem; color: var(--text-main); margin-bottom: 2px; }
        .notif-item-body-lucide { font-weight: 500; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; }

        .notif-dismiss-lucide {
          border: none;
          background: transparent;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
          padding: 4px;
        }
        .notif-item-lucide:hover .notif-dismiss-lucide { opacity: 0.6; }
        .notif-dismiss-lucide:hover { opacity: 1 !important; color: #ef4444; }

        .ls-2 { letter-spacing: 0.15em; }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
