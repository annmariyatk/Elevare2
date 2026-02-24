import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "../css/dashboard.css";

function Dashboard() {
  const [data, setData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/student-dashboard/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Dashboard API Error:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      });
  }, [navigate]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside (mobile)
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  if (!data) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
    }}>
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid #DBEAFE',
            borderTop: '4px solid #1E3A8A',
            borderRadius: '50%'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          style={{
            fontSize: '1.2rem',
            color: '#1E3A8A',
            fontWeight: '600'
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading your dashboard...
        </motion.p>
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Toggle */}
      <motion.button
        className="menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {sidebarOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </motion.button>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={handleOverlayClick}
      />

      <Sidebar data={data} setData={setData} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet context={{ data, setData }} />
      </motion.div>
    </div>
  );
}

export default Dashboard;