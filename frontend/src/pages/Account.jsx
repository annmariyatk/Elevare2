import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import "../css/account.css";

export default function Account() {
  const student_id = localStorage.getItem("student_id");

  const navItems = [
    { to: "profile", label: "Profile", icon: "👤", color: "#3B82F6" },
    { to: "help", label: "Help & Support", icon: "❓", color: "#10B981" },
    { to: "review", label: "Rate Website", icon: "⭐", color: "#F59E0B" },
    { to: "privacy", label: "Privacy Settings", icon: "🔒", color: "#8B5CF6" }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '30px' }}
      >
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "800",
          color: "#1E3A8A",
          marginBottom: "8px",
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Account Settings
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Manage your profile, preferences, and account settings</p>
      </motion.div>

      {/* NAVIGATION CARDS */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        {navItems.map((item, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Link
              to={item.to}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: '2px solid #F1F5F9',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: item.color
                }} />
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#1E293B',
                  marginBottom: '4px'
                }}>
                  {item.label}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  {item.label === 'Profile' && 'Update your personal information'}
                  {item.label === 'Help & Support' && 'Get help or report issues'}
                  {item.label === 'Rate Website' && 'Share your feedback with us'}
                  {item.label === 'Privacy Settings' && 'Manage your privacy preferences'}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CONTENT AREA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="account-content"
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'left',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '2px solid #F1F5F9'
        }}


      >
        <Outlet />
      </motion.div>
    </div>
  );
}
