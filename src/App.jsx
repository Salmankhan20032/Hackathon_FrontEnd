import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import Navigation from "./components/Navigation";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Boarding from "./pages/Boarding";
import Marketplace from "./pages/Marketplace";
import CreateProduct from "./pages/CreateProduct";
import ProductDetail from "./pages/ProductDetail";
import Inbox from "./pages/Inbox";
import Dashboard from "./pages/Dashboard";
import TravelPlanner from "./pages/TravelPlanner";
import FindJobs from "./pages/FindJobs";
import Discounts from "./pages/Discounts";
import CVBuilder from "./pages/CVBuilder";
import CareerRoadmap from "./pages/CareerRoadmap";
import { useTheme } from "./ThemeContext";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className="App">
        <Navigation />
        <ToastContainer
          theme={theme === "dark" ? "dark" : "light"}
          position="top-right"
        />

        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/internships"
              element={
                <ProtectedRoute>
                  <Internships />
                </ProtectedRoute>
              }
            />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market/create"
              element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market/inbox"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/internships/:id"
              element={
                <ProtectedRoute>
                  <InternshipDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <FindJobs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/travel"
              element={
                <ProtectedRoute>
                  <TravelPlanner />
                </ProtectedRoute>
              }
            />

            <Route
              path="/boarding"
              element={
                <ProtectedRoute>
                  <Boarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-roadmap"
              element={
                <ProtectedRoute>
                  <CareerRoadmap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discounts"
              element={
                <ProtectedRoute>
                  <Discounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cv-builder"
              element={
                <ProtectedRoute>
                  <CVBuilder />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
