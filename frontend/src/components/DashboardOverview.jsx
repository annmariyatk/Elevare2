import React from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
// css imported in parent dashboard.css

function DashboardOverview() {
  const { data, setData } = useOutletContext();
  const token = localStorage.getItem("token");

  if (!data) return <div>Loading...</div>;

  // =========================
  // UPDATE STUDY STATUS
  // =========================
  const handleStatusChange = async (studyId, status) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/update-study-status/${studyId}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success ✅", `Study ${status}`, "success");

      const res = await axios.get(
        "http://127.0.0.1:8000/api/student-dashboard/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(res.data);
    } catch (err) {
      Swal.fire("Error ❌", err.response?.data?.error || "Failed to update study", "error");
    }
  };

  // =========================
  // LATEST 5 HISTORY
  // =========================
  const history = (data.history || [])
    .filter(h => h.status !== "Started" && h.status !== "Progress")
    .slice(0, 5);

  // 🔥 Safe display helper
  const showValue = (val) =>
    val && val.toString().trim() !== "" ? val : "NULL";

  return (
    <motion.div
      className="dashboard-overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >

      {/* ================= PROFILE WARNING ================= */}
      {data.profile_incomplete && Object.values(data.profile_incomplete).some(v => v) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          style={{
            background: "#FEF2F2",
            border: "1px solid #F87171",
            borderRadius: "12px",
            padding: "15px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            color: "#991B1B",
            flexWrap: "wrap"
          }}
        >
          <div style={{ background: "#FEE2E2", padding: "10px", borderRadius: "50%", flexShrink: 0 }}>
            ⚠️
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h4 style={{ margin: "0 0 5px 0", fontSize: "1rem", fontWeight: "700" }}>Profile Incomplete</h4>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#B91C1C" }}>
              Please complete your profile details to get the best experience. Missing:
              {data.profile_incomplete.about && <b> About Me,</b>}
              {data.profile_incomplete.picture && <b> Profile Picture,</b>}
              {data.profile_incomplete.skills && <b> Skills</b>}
            </p>
          </div>
          <a href="/dashboard/account/profile" style={{
            background: "#DC2626",
            color: "white",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "600",
            whiteSpace: "nowrap"
          }}>
            Update Now →
          </a>
        </motion.div>
      )}

      {/* ================= WELCOME BANNER ================= */}
      <motion.div
        className="welcome-banner"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: 'linear-gradient(180deg, #1a3a5c 0%, #0f2744 50%, #1a3a5c 100%)',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          position: 'relative',
          marginBottom: '16px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 20px rgba(23, 37, 84, 0.3)',
        }}
      >
        <div style={{ zIndex: 2, maxWidth: '60%', minWidth: '250px' }}>
          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)', opacity: 0.8, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '500' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Welcome back, <br />
            <span style={{
              color: '#FCD34D',
              textShadow: '0 4px 12px rgba(252, 211, 77, 0.3)',
              display: 'inline-block'
            }}>
              {data.username}!
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.25rem)', opacity: 0.9, fontWeight: '400', letterSpacing: '0.5px' }}>
            Ready to elevate your skills today?
          </p>
        </div>

        <div style={{
          position: 'absolute',
          right: '20px',
          bottom: '-40px',
          height: '140%',
          zIndex: 1,
          filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.2))',
          display: window.innerWidth < 768 ? 'none' : 'block'
        }}>
          <img
            src="/anime.png"
            alt="Student"
            style={{ height: '100%', objectFit: 'contain' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>


      </motion.div>

      {/* ================= STATS ROW (Below Banner) ================= */}
      <motion.div
        className="overview-cards"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.15 } }
        }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}
      >
        <motion.div
          className="overview-card"
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          whileHover={{ y: -5 }}
          style={{
            background: '#DBEAFE',
            color: '#1E3A8A',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          {data.notifications?.assessment > 0 && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-5px',
              background: '#EF4444', color: 'white', fontSize: '0.75rem',
              fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)'
            }}>
              {data.notifications.assessment} New
            </span>
          )}
          <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', opacity: 0.9, marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>Completed Skills</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0, fontWeight: '700' }}>{data.completed_skills ?? 0}</h2>
        </motion.div>

        <motion.div
          className="overview-card"
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          whileHover={{ y: -5 }}
          style={{
            background: '#DBEAFE',
            color: '#1E3A8A',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          {data.notifications?.certificates > 0 && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-5px',
              background: '#EF4444', color: 'white', fontSize: '0.75rem',
              fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)'
            }}>
              {data.notifications.certificates} New
            </span>
          )}
          <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', opacity: 0.9, marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>Certificates</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0, fontWeight: '700' }}>{data.certificates ?? 0}</h2>
        </motion.div>

        <motion.div
          className="overview-card"
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          whileHover={{ y: -5 }}
          style={{
            background: '#DBEAFE',
            color: '#1E3A8A',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', opacity: 0.9, marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase' }}>Cancelled Studies</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0, fontWeight: '700' }}>{data.cancelled_studies ?? 0}</h2>
        </motion.div>
      </motion.div>

      {/* ================= ACTIVE STUDY ================= */}
      <AnimatePresence>
        {data.active_study && data.active_study.status !== "Completed" ? (
          <motion.div
            className="active-study"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'white',
              padding: 'clamp(12px, 3vw, 16px)',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#2563EB', fontWeight: '600' }}>Active Study</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Partner</p>
                <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#1E293B', fontWeight: '600', margin: 0, wordBreak: 'break-word' }}>{data.active_study.partner}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Level</p>
                <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#1E293B', fontWeight: '600', margin: 0 }}>{showValue(data.active_study.level)}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>You Offer</p>
                <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#1E293B', fontWeight: '600', margin: 0, wordBreak: 'break-word' }}>{showValue(data.active_study.offer)}</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>You Want</p>
                <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#1E293B', fontWeight: '600', margin: 0, wordBreak: 'break-word' }}>{showValue(data.active_study.want)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '16px', background: '#FEF3C7', borderRadius: '12px', border: '1px solid #FCD34D', flexWrap: 'wrap' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#92400E' }}><strong>Duration:</strong> {data.active_study.start_date} → {data.active_study.end_date}</p>
              </div>
            </div>

            <div className="action-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Mark as Complete Button Logic */}
              <button
                className="btn btn-complete"
                disabled={
                  data.active_study.status === "Started" ||
                  (data.active_study.status === "Progress" && !data.active_study.skills_assigned)
                }
                onClick={() =>
                  handleStatusChange(
                    data.active_study.study_id,
                    "Completed"
                  )
                }
                style={{
                  flex: 1,
                  minWidth: '150px',
                  background: (data.active_study.status === "Progress" && data.active_study.skills_assigned)
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : '#CBD5E1', // Grayed out when disabled
                  color: 'white',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                  cursor: (data.active_study.status === "Progress" && data.active_study.skills_assigned) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: (data.active_study.status === "Progress" && data.active_study.skills_assigned)
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : 'none',
                  opacity: (data.active_study.status === "Progress" && data.active_study.skills_assigned) ? 1 : 0.7
                }}
                onMouseOver={(e) => {
                  if (data.active_study.status === "Progress" && data.active_study.skills_assigned) {
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (data.active_study.status === "Progress" && data.active_study.skills_assigned) {
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {data.active_study.status === "Started" ? "Locked: Starter Phase" :
                  !data.active_study.skills_assigned ? "Waiting for Skills..." :
                    "✓ Mark as Complete"}
              </button>

              <button
                className="btn btn-cancel"
                onClick={() =>
                  handleStatusChange(
                    data.active_study.study_id,
                    "Cancelled"
                  )
                }
                style={{
                  flex: 1,
                  minWidth: '150px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✕ Cancel Study
              </button>
            </div>
          </motion.div>
        ) : null
        }
      </AnimatePresence>

      {/* ================= HISTORY ================= */}
      <motion.div
        className="history"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: 'white',
          padding: 'clamp(12px, 3vw, 16px)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '12px', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#2563EB', fontWeight: '600' }}>Recent History</h3>

        {
          history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"></path>
              </svg>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>No history yet</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="history-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'transparent' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Partner</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Offer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Want</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Start</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>End</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.05) }}
                      style={{
                        background: '#F8FAFC',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#EEF2FF'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    >
                      <td style={{ padding: '16px', borderRadius: '12px 0 0 12px', fontWeight: '600', color: '#1E293B', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)' }}>{h.partner}</td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)' }}>{showValue(h.offer_skill)}</td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)' }}>{showValue(h.want_skill)}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: h.status === 'Completed' ? '#D1FAE5' : '#FEE2E2',
                          color: h.status === 'Completed' ? '#065F46' : '#991B1B',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {h.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)' }}>{h.start_date}</td>
                      <td style={{ padding: '16px', borderRadius: '0 12px 12px 0', color: '#64748b', fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)' }}>{h.end_date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </motion.div>
    </motion.div>
  );
}

export default DashboardOverview;