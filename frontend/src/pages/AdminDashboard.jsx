import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle, XCircle, Users } from "lucide-react";
import "../css/dashboard.css"; // Use the main dashboard CSS for matching theme
import "../css/adminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    completed: 0,
    canceled: 0,
    total: 0,
    chart_data: []
  });

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/dashboard-stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
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
        onClick={() => setSidebarOpen(false)}
      />

      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="admin-main-content">
        <h2 style={{ color: '#1e3a8a' }}>Admin Dashboard</h2>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircle size={32} />
            </div>
            <div className="stat-details">
              <h3>{stats.completed}</h3>
              <p>Completed Studies</p>
            </div>
          </div>

          <div className="stat-card canceled">
            <div className="stat-icon">
              <XCircle size={32} />
            </div>
            <div className="stat-details">
              <h3>{stats.canceled}</h3>
              <p>Canceled Studies</p>
            </div>
          </div>

          <div className="stat-card total">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-details">
              <h3>{stats.total}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>

        {!loading && (
          <section className="chart-container" style={{ marginTop: '30px' }}>
            <div className="chart-header">
              <h2>Monthly Statistics</h2>
            </div>
            <div style={{ width: '100%', height: 350, minHeight: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chart_data && stats.chart_data.length > 0 ? stats.chart_data : [{ name: 'No Data', completed: 0, canceled: 0 }]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} name="Canceled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
