import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import "../css/dashboard.css";

function Sidebar({ data, setData, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const studyId = data?.active_study?.study_id;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const [notificationCounts, setNotificationCounts] = useState({
    skillshare: 0,
    assessment: 0,
    chat: 0,
    resources: 0,
    certificates: 0,
    internships_courses: 0
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync with parent data if available
  useEffect(() => {
    if (data?.notifications) {
      setNotificationCounts(data.notifications);
    }
  }, [data]);

  const showNoStudyAlert = (text) => {
    Swal.fire({
      title: "No Active Study ❌",
      text: text,
      icon: "warning",
      confirmButtonText: "OK ✅",
    });
  };

  // ✅ CHAT should remain blocked
  const handleChatClick = (e) => {
    if (!studyId) {
      e.preventDefault();
      showNoStudyAlert("You can chat only after connecting with a student.");
    } else {
      markViewed("chat");
    }
  };

  const markViewed = async (section) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistic UI update
      setNotificationCounts(prev => ({ ...prev, [section]: 0 }));
      if (setData) {
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: {
              ...prev.notifications,
              [section]: 0
            }
          };
        });
      }

      await fetch("http://127.0.0.1:8000/api/notifications/mark-viewed/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ section })
      });
    } catch (err) {
      console.error("Failed to mark as viewed", err);
    }
  };

  // Close sidebar on link click (mobile)
  const handleLinkClick = (onClick, section) => (e) => {
    if (onClick) onClick(e);
    if (section) markViewed(section);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#EF4444",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/");
      }
    });
  };
  // Fetch notification counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://127.0.0.1:8000/api/notifications/counts/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const counts = await res.json();
          setNotificationCounts(counts);
          // Sync with parent data too
          if (setData) {
            setData(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                notifications: counts
              };
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch notification counts", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Map counts to routes
  const getBadgeCount = (route) => {
    switch (route) {
      case "/dashboard/share-skill": return notificationCounts.skillshare;
      case "/dashboard/resources": return notificationCounts.resources;
      case "/dashboard/assessment": return notificationCounts.assessment;
      case "/dashboard/certificates": return notificationCounts.certificates;
      case "/dashboard/opportunities": return notificationCounts.internships_courses;
      default:
        if (route.startsWith("/dashboard/chat")) return notificationCounts.chat;
        return 0;
    }
  };

  return (
    <motion.div
      className={`sidebar ${sidebarOpen ? "open" : ""}`}
      variants={{
        open: { x: 0, opacity: 1 },
        closed: { x: "-100%", opacity: 1 }
      }}
      initial={false}
      animate={sidebarOpen || !isMobile ? "open" : "closed"}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Mobile Close Button */}
      <button
        className="sidebar-close-btn"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <motion.div
        className="logo"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src={logo} alt="Logo" />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}
      >
        {[
          { to: "/dashboard", label: "Home" },
          { to: "/dashboard/share-skill", label: "Share Skill", section: "skillshare" },
          { to: "/dashboard/resources", label: "Resources", section: "resources" },
          { to: studyId ? `/dashboard/chat/${studyId}` : "#", label: "Chat", onClick: handleChatClick }, // Chat handled manually
          { to: "/dashboard/study-details", label: "Study Details" },
          { to: "/dashboard/assessment", label: "Assessment", section: "assessment" },
          { to: "/dashboard/certificates", label: "Certificates", section: "certificates" },
          { to: "/dashboard/opportunities", label: "Internships & Courses", section: "internships_courses" },
          { to: "/dashboard/connect", label: "Connect" },
          { to: "/dashboard/account", label: "Account" }
        ].map((item, idx) => {
          const count = getBadgeCount(item.to);
          return (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
            >
              <NavLink
                to={item.to}
                onClick={handleLinkClick(item.onClick, item.section)}
                className={({ isActive }) => isActive ? "active" : ""}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                <span style={{ flex: 1 }}>{item.label}</span>
                {count > 0 && (
                  <span className="nav-badge" style={{
                    background: '#EF4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    minWidth: '22px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                    marginLeft: '8px',
                    flexShrink: 0
                  }}>
                    {count}
                  </span>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        style={{
          background: '#FEE2E2',
          color: '#991B1B',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          marginTop: 'auto',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          minHeight: '44px'
        }}
        whileHover={{ scale: 1.05, background: '#FECACA' }}
        whileTap={{ scale: 0.95 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </motion.button>
    </motion.div>
  );
}

export default Sidebar;