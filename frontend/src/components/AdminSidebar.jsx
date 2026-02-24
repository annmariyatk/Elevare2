import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import {
    Users,
    UserPlus,
    UserCheck,
    MessageSquare,
    HelpCircle,
    LogOut,
    Home,
    BookOpen,
    Briefcase // NEW
} from 'lucide-react';
import "../css/adminDashboard.css";

function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [helpCenterCount, setHelpCenterCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch("http://127.0.0.1:8000/api/admin/notifications/counts/", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setHelpCenterCount(data.help_center || 0);
                    setReviewCount(data.testimonials || 0);
                }
            } catch (err) {
                console.error("Failed to fetch admin counts", err);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    const handleSignOut = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <motion.div
            className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
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
                className="admin-logo"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
            >
                <img src={logo} alt="Elevare Logo" />
            </motion.div>

            <nav className="admin-nav">
                {/* NEW: Home Link */}
                <NavLink to="/admin-dashboard" end className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    <Home size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/admin-dashboard/users" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    <Users size={20} />
                    <span>Manage Users</span>
                </NavLink>

                {/* NEW: Manage Teachers */}
                <NavLink to="/admin-dashboard/teachers" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    <BookOpen size={20} />
                    <span>Manage Teachers</span>
                </NavLink>

                {/* Updated: Add Admin directs to signup */}
                <NavLink to="/admin-signup" className="admin-nav-item">
                    <UserCheck size={20} />
                    <span>Add Admin</span>
                </NavLink>

                {/* Updated: Add Teacher directs to page */}
                <NavLink to="/admin-dashboard/add-teacher" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    <UserPlus size={20} />
                    <span>Add Teacher</span>
                </NavLink>

                <NavLink to="/admin-dashboard/post-opportunity" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    <Briefcase size={20} />
                    <span>Post Internship/Course</span>
                </NavLink>

                <NavLink
                    to="/admin-dashboard/testimonials"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={20} />
                        <span>Testimonials</span>
                    </div>
                    {reviewCount > 0 && (
                        <span style={{
                            background: '#F59E0B', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
                            padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center'
                        }}>
                            {reviewCount}
                        </span>
                    )}
                </NavLink>

                <NavLink
                    to="/admin-dashboard/help"
                    className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <HelpCircle size={20} />
                        <span>Help Center</span>
                    </div>
                    {helpCenterCount > 0 && (
                        <span style={{
                            background: '#EF4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold',
                            padding: '2px 8px', borderRadius: '12px', minWidth: '20px', textAlign: 'center'
                        }}>
                            {helpCenterCount}
                        </span>
                    )}
                </NavLink>

                <button onClick={handleSignOut} className="sign-out-btn">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </nav>
        </motion.div>
    );
}

export default AdminSidebar;
