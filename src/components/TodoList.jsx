import React, { useState, useEffect } from "react";
import { Form, Spinner, Badge } from "react-bootstrap";
import { FaCheck, FaPlus, FaTrash, FaStar, FaGraduationCap, FaFire, FaCircle, FaTerminal, FaChevronRight } from "react-icons/fa";
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

  const deleteTodo = async (id) => {
    try {
      await api.post(`/todo/delete/${id}/`);
      fetchData();
    } catch (error) { console.error(error); }
  };

  if (fetching) return <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>;

  const activeMissions = todos.filter(t => !t.is_completed);

  return (
    <div className="todo-module h-100 d-flex flex-column">
      <div className="todo-header p-4 pb-2">
        <Form onSubmit={addTodo}>
          <div className="todo-input-wrap">
            <input
              type="text"
              placeholder={t("todo.placeholder")}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="todo-input"
            />
            <button 
              type="button"
              className={`todo-star-btn ${isUrgent ? 'active' : ''}`}
              onClick={() => setIsUrgent(!isUrgent)}
            >
              <FaStar />
            </button>
            <button type="submit" disabled={loading} className="todo-add-btn">
              {loading ? <Spinner size="sm" /> : <FaPlus />}
            </button>
          </div>
        </Form>
      </div>

      <div className="todo-body px-4 pb-4">
        <AnimatePresence>
          {internships.map(intern => (
            <motion.div 
              key={`intern-${intern.id}`}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="mission-item intern"
            >
              <div className="mission-icon"><FaGraduationCap /></div>
              <div className="mission-info">
                <div className="m-title">{intern.title}</div>
                <div className="m-tag">{t("todo.enrolled")}</div>
              </div>
              <FaChevronRight className="m-arrow" />
            </motion.div>
          ))}

          {activeMissions.map(todo => (
            <motion.div 
              key={`todo-${todo.id}`}
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className={`mission-item ${todo.is_urgent ? 'urgent' : ''}`}
            >
              <button className="mission-check" onClick={() => markComplete(todo.id)}>
                <FaCheck />
              </button>
              <div className="mission-info">
                <div className="m-title">{todo.title}</div>
                {todo.is_urgent && <div className="m-tag">{t("todo.urgent")}</div>}
              </div>
              <button className="mission-delete" onClick={() => deleteTodo(todo.id)}>
                <FaTrash size={10} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeMissions.length === 0 && internships.length === 0 && (
          <div className="todo-empty">
            <FaTerminal size={32} className="opacity-10 mb-3" />
            <p className="fw-700 small opacity-30">{t("todo.noTasks")}</p>
          </div>
        )}
      </div>

      <style>{`
        .todo-module { background: transparent; }
        .todo-body {
          overflow: visible;
          max-height: none;
        }
        .todo-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-body);
          border: 1px solid var(--glass-border);
          padding: 8px 12px;
          border-radius: 18px;
          transition: all 0.3s ease;
        }
        .todo-input-wrap:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .todo-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          padding: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-main);
          outline: none;
        }
        .todo-star-btn {
          border: none; background: transparent; color: var(--text-muted); opacity: 0.3;
          transition: all 0.2s ease;
        }
        .todo-star-btn.active { color: #f59e0b; opacity: 1; transform: scale(1.2); }
        .todo-add-btn {
          width: 34px; height: 34px; border-radius: 10px; border: none;
          background: var(--accent-primary); color: white; display: flex;
          align-items: center; justify-content: center;
        }

        .mission-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .mission-item:hover { transform: scale(1.02); background: var(--bg-card); }
        
        .mission-check {
          width: 24px; height: 24px; border: 2px solid var(--glass-border);
          border-radius: 8px; background: transparent; color: transparent;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
        }
        .mission-item:hover .mission-check { border-color: var(--accent-primary); color: rgba(var(--accent-primary-rgb), 0.2); }
        .mission-check:hover { background: var(--accent-primary); color: white !important; border-color: var(--accent-primary) !important; }

        .mission-icon {
          width: 32px; height: 32px; border-radius: 10px; background: var(--bg-body);
          display: flex; align-items: center; justify-content: center; color: var(--accent-primary);
        }

        .mission-info { flex-grow: 1; min-width: 0; }
        .m-title { font-weight: 800; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .m-tag { font-size: 0.65rem; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; }
        .urgent .m-tag { color: #f59e0b; }
        .intern .m-tag { color: #3b82f6; }

        .m-arrow { color: var(--text-muted); opacity: 0.2; }
        .mission-delete {
          border: none; background: transparent; color: #ef4444; opacity: 0;
          transition: opacity 0.2s ease;
        }
        .mission-item:hover .mission-delete { opacity: 0.4; }
        .mission-delete:hover { opacity: 1 !important; }

        .todo-empty { padding: 60px 0; text-align: center; }
      `}</style>
    </div>
  );
};

export default TodoList;
