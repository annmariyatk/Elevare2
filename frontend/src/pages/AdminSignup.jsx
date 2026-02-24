import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, AlertTriangle, Copy
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminSidebar from "../components/AdminSidebar";

import "../css/Signup.css"; // Reusing Signup styles

import logo from "../assets/logo.png";

function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = async () => {
    if (!formData.email) return;

    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email format. Please use user@example.com" }));
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/check-unique-admin/", { email: formData.email });
    } catch (err) {
      setErrors(prev => ({ ...prev, email: "Email already in use." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
      return;
    }

    if (errors.email) {
      Swal.fire('Error', 'Please fix the email error before submission.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/admin/create-auto/", {
        username: formData.username,
        email: formData.email,
      });

      const { auto_password } = res.data;
      setGeneratedPassword(auto_password);
      setShowPasswordModal(true);
      setIsSubmitting(false);

    } catch (err) {
      console.error(err);
      setErrors(err.response?.data || { general: "Signup failed. Please try again." });
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Password copied to clipboard.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleCloseModal = () => {
    Swal.fire({
      title: 'Have you saved the password?',
      text: "You won't be able to see it again!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, I saved it!',
      cancelButtonText: 'No, let me copy it'
    }).then((result) => {
      if (result.isConfirmed) {
        setShowPasswordModal(false);
        navigate("/admin-dashboard");
      }
    });
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
        <div className="elevare-signup-page admin-signup-page" style={{ height: 'auto', minHeight: 'unset', padding: '0', background: 'transparent' }}>
          <div className="signup-container" style={{ margin: '0 auto', maxWidth: '900px', boxShadow: 'none', border: 'none' }}>
            {/* Left Panel */}
            <motion.div
              className="left-panel"
              style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)', borderRadius: '24px 0 0 24px' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="welcome-content">
                <div className="welcome-header">
                  <h1>Admin Access<br /><span className="highlight" style={{ color: '#FCD34D' }}>Elevare Dashboard</span></h1>
                  <p className="welcome-subtitle">Create an account to manage the platform.</p>
                </div>
              </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div
              className="right-panel"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ borderRadius: '0 24px 24px 0' }}
            >
              <div className="form-container">
                <div className="form-header">
                  <img src={logo} alt="Elevare Logo" className="logo-main" />
                  <h2>Admin Registration</h2>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                  <div className="form-field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <motion.button type="submit" className="submit-button" style={{ background: '#1E3A8A' }} disabled={isSubmitting}>
                    {isSubmitting ? "Generating..." : "Generate Admin Account"}
                  </motion.button>

                  <div className="login-link-section">
                    Back to <Link to="/login" className="login-link">Login</Link>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="terms-modal-overlay">
            <motion.div className="terms-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none' }}><AlertTriangle size={48} color="#f59e0b" /></div>
              <h3>Save Your Password!</h3>
              <p>Please copy and save it securely.</p>
              <div style={{ background: '#f4f6f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{generatedPassword}</span>
                <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8' }}><Copy size={20} /></button>
              </div>
              <button className="submit-button" onClick={handleCloseModal} style={{ background: '#1E3A8A', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%' }}>I have saved it</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminSignup;
