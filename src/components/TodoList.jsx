import React, { useState, useEffect } from "react";
import { Card, Form, Button, ListGroup, Badge, Spinner, Row, Col } from "react-bootstrap";
import { FaCheck, FaPlus, FaTrash, FaStar, FaGraduationCap, FaFire, FaRegCircle, FaTerminal, FaTimes } from "react-icons/fa";
import api from "../api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../LanguageContext";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [internships, setInternships] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const [todoRes, internRes] = await Promise.all([
        api.get("/todo/list/"),
        api.get("/internships/my/")
      ]);
      const todoItems = Array.isArray(todoRes.data?.todos) ? todoRes.data.todos : [];
      const internshipItems = Array.isArray(internRes.data) ? internRes.data : [];
      setTodos(todoItems);
      setInternships(internshipItems.filter(i => i.status === 'Enrolled'));
    } catch (error) {
      console.error("Fetch error", error);
      setTodos([]);
      setInternships([]);
    } finally {
      setFetching(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo) return;
    setLoading(true);
    try {
      await api.post("/todo/create/", { title: newTodo, is_urgent: isUrgent });
      setNewTodo("");
      setIsUrgent(false);
      fetchData();
      toast.success(t("todo.successToast"));
    } catch (error) {
      toast.error(t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id) => {
    try {
      await api.post(`/todo/complete/${id}/`);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const toggleUrgent = async (id) => {
    try {
      await api.post(`/todo/toggle-urgent/${id}/`);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const deleteTodo = async (id) => {
    try {
      await api.post(`/todo/delete/${id}/`);
      fetchData();
      toast.warn(t("todo.deleteToast"));
    } catch (error) { console.error(error); }
  };

  const urgentTasks = todos.filter(t => t.is_urgent && !t.is_completed);
  const regularTasks = todos.filter(t => !t.is_urgent && !t.is_completed);
  const completedTasks = todos.filter(t => t.is_completed);

  if (fetching) return <div className="text-center p-5"><Spinner animation="grow" variant="primary" /></div>;

  return (
    <div className="todo-workspace p-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-900 mb-0 d-flex align-items-center gap-2 text-main">
          <FaTerminal className="text-primary" /> {t("todo.title")}
        </h4>
        <Badge bg="primary" className="rounded-pill p-2 px-3 fw-900 shadow-sm border-0" style={{ fontSize: '0.7rem' }}>
            {todos.filter(t_item => !t_item.is_completed).length + internships.length} {t("todo.active")}
        </Badge>
      </div>

      <Form onSubmit={addTodo} className="mb-4">
        <div className="glass-panel p-2 rounded-4 d-flex align-items-center gap-2 border-0 shadow-sm bg-white bg-opacity-10">
          <Form.Control
            type="text"
            placeholder={t("todo.placeholder")}
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="bg-transparent border-0 text-main-important placeholder-muted focus-none fw-600"
            style={{ boxShadow: 'none' }}
          />
          <Button 
            variant={isUrgent ? "warning" : "outline-light"} 
            className="border-0 rounded-circle p-2 d-flex align-items-center justify-content-center transition-all bg-opacity-10"
            style={{ width: '38px', height: '38px', background: isUrgent ? 'rgba(255, 193, 7, 0.2)' : 'transparent' }}
            onClick={() => setIsUrgent(!isUrgent)}
          >
            <FaStar className={isUrgent ? "text-warning" : "text-muted opacity-40"} />
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="ms-1 border-0 rounded-4 p-2 px-3 d-flex align-items-center justify-content-center launch-btn shadow-lg"
          >
            {loading ? <Spinner size="sm" /> : <><span className="small fw-900 me-2 d-none d-sm-inline">{t("todo.launch")}</span> <FaPlus size={14} /></>}
          </Button>
        </div>
      </Form>

      <div className="mission-sections custom-scrollbar" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
        
        {/* SECTION 1: URGENT */}
        <AnimatePresence>
          {urgentTasks.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
              <h6 className="text-warning small fw-900 uppercase tracking-widest mb-3 d-flex align-items-center gap-2">
                <FaFire /> {t("todo.critical")}
              </h6>
              {urgentTasks.map(todo => (
                <div key={todo.id} className="todo-item urgent glass-panel mb-2 p-3 rounded-4 d-flex justify-content-between align-items-center border-start border-warning border-4 shadow-sm">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-warning">
                       <FaFire />
                    </div>
                    <span className="fw-800 text-main truncate-1">{todo.title}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button 
                      variant="link" 
                      className="p-1 px-3 text-decoration-none text-success bg-success bg-opacity-10 rounded-pill hover-bg-success d-flex align-items-center gap-1 fw-900" 
                      onClick={() => markComplete(todo.id)}
                      style={{ fontSize: '0.65rem' }}
                    >
                      <FaCheck /> {t("todo.done")}
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-1 text-danger opacity-50 hover-opacity-100" 
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 2: INTERNSHIPS */}
        <AnimatePresence>
          {internships.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
              <h6 className="text-info small fw-900 uppercase tracking-widest mb-3 d-flex align-items-center gap-2">
                <FaGraduationCap /> {t("todo.ongoing")}
              </h6>
              {internships.map(intern => (
                <div key={intern.id} className="todo-item internship glass-panel mb-2 p-3 rounded-4 d-flex justify-content-between align-items-center border-start border-info border-4 shadow-sm" style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '42px', height: '42px', flexShrink: 0, border: '2px solid rgba(13, 202, 240, 0.2)' }}>
                       <FaGraduationCap className="text-info" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-900 text-main small truncate-1">{intern.title}</div>
                      <div className="text-info opacity-75 mt-0 fw-800" style={{ fontSize: '0.6rem' }}>{t("todo.stayFocused")}</div>
                    </div>
                  </div>
                  <Badge bg="info" className="bg-opacity-10 text-info border border-info border-opacity-25 fw-900 px-2 shadow-sm" style={{ fontSize: '0.6rem' }}>{t("todo.enrolled")}</Badge>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3: REGULAR TODOS */}
        <div className="mb-4">
          <h6 className="text-primary small fw-900 uppercase tracking-widest mb-3 d-flex align-items-center gap-2">
            {t("todo.daily")}
          </h6>
          {regularTasks.map(todo => (
            <div key={todo.id} className="todo-item glass-panel mb-2 p-3 rounded-4 d-flex justify-content-between align-items-center shadow-sm">
              <div className="d-flex align-items-center gap-3">
                <div className="text-muted opacity-50">
                   <FaRegCircle />
                </div>
                <span className="fw-800 text-main opacity-90 truncate-1">{todo.title}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button 
                   variant="link" 
                   className="p-1 px-2 text-decoration-none text-success bg-success bg-opacity-5 rounded-pill hover-bg-success fw-900" 
                   onClick={() => markComplete(todo.id)}
                   style={{ fontSize: '0.7rem' }}
                >
                   <FaCheck />
                </Button>
                <Button 
                   variant="link" 
                   className="p-1 text-danger opacity-30 hover-opacity-100" 
                   onClick={() => deleteTodo(todo.id)}
                >
                   <FaTrash size={12} />
                </Button>
                <Button variant="link" className="p-0 text-muted opacity-50" onClick={() => toggleUrgent(todo.id)}>
                   <FaStar size={14} />
                </Button>
              </div>
            </div>
          ))}
          {regularTasks.length === 0 && urgentTasks.length === 0 && (
            <div className="text-center p-5 border-dashed rounded-4 text-muted small fw-800 opacity-50">
              {t("todo.noTasks")}
            </div>
          )}
        </div>

        {/* COMPLETED */}
        {completedTasks.length > 0 && (
          <div className="opacity-50">
            <h6 className="text-muted small fw-900 uppercase mb-3">{t("todo.resolved")}</h6>
            {completedTasks.map(todo => (
              <div key={todo.id} className="todo-item glass-panel mb-2 p-2 px-3 rounded-4 d-flex justify-content-between align-items-center grayscale">
                <span className="text-muted text-decoration-line-through small truncate-1 fw-800">{todo.title}</span>
                <div className="d-flex gap-2 align-items-center">
                  <FaCheck className="text-success small" />
                  <FaTrash className="text-danger small cursor-pointer opacity-50 hover-opacity-100" onClick={() => deleteTodo(todo.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .todo-workspace { color: var(--text-main); }
        .glass-panel { background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); }
        .todo-item { transition: all 0.3s ease; }
        .todo-item:hover { transform: translateX(5px); background: rgba(var(--accent-primary-rgb), 0.1); }
        .grayscale { filter: grayscale(1); }
        .border-dashed { border: 2px dashed var(--glass-border); }
        .placeholder-muted::placeholder { color: var(--text-muted); opacity: 0.5; }
        .focus-none:focus { outline: none; border: none; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.2em; }
        .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .hover-opacity-100:hover { opacity: 1 !important; }
        .transition-all { transition: all 0.3s ease; }
        .launch-btn { 
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .launch-btn:hover { 
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4);
        }
        .launch-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
};

export default TodoList;
