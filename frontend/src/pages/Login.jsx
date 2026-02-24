import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Star, Trophy, ArrowLeft
} from "lucide-react";
import logo from "../assets/logo.png";
import Swal from 'sweetalert2';
import "../css/Signup.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // Min 8 chars, Uppercase, Lowercase, Number, Special Char
    // Relaxed for Login, but can be strict if required.
    // Keeping it strict as requested "validate email and password format"
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      if (!email) {
        setErrors(prev => ({ ...prev, email: "Email is required" }));
      } else if (!validateEmail(email)) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      } else {
        setErrors(prev => ({ ...prev, email: null }));
      }
    }

    if (field === 'password') {
      if (!password) {
        setErrors(prev => ({ ...prev, password: "Password is required" }));
      } else if (!validatePassword(password)) {
        // Optional: Can hide specific password rules on login for security, but user asked for validation
        setErrors(prev => ({ ...prev, password: "Password format is invalid (Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special)" }));
      } else {
        setErrors(prev => ({ ...prev, password: null }));
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final Validation before Submit
    let valid = true;
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (!validatePassword(password)) {
      newErrors.password = "Invalid password format";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", { email, password });

      localStorage.setItem("token", res.data.token || "dummy-token");
      const isAdmin = res.data.role === 'admin' || res.data.is_admin || res.data.isAdmin;

      if (isAdmin) {
        localStorage.setItem("admin_id", res.data.admin_id);
        localStorage.setItem("role", "admin");
        navigate("/admin-dashboard");
      } else {
        localStorage.setItem("student_id", res.data.student_id);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("role", "student");
        navigate("/dashboard");
      }
    } catch (err) {
      // Improve error handling
      const errorMessage = err.response?.data?.error || 'Invalid email or password';
      Swal.fire('Login Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="elevare-signup-page login-page">
      <div className="signup-container">
        {/* Left Panel */}
        <motion.div
          className="left-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="welcome-content">
            <div className="welcome-header">
              <h1>Welcome Back to <br /><span className="highlight">Elevare</span></h1>
              <p className="welcome-subtitle">Continue your journey of learning and collaboration. Stay connected with your peers.</p>
            </div>

            <div className="features-section">
              <div className="feature-card">
                <div className="feature-icon"><BookOpen size={24} /></div>
                <div className="feature-text">
                  <h3>Resume Learning</h3>
                  <p>Pick up right where you left off in your latest study modules.</p>
                </div>
                <ArrowRight className="feature-arrow" size={20} />
              </div>

              <div className="feature-card">
                <div className="feature-icon"><Star size={24} /></div>
                <div className="feature-text">
                  <h3>Check Progress</h3>
                  <p>View your assessments, ratings, and certifications anytime.</p>
                </div>
                <ArrowRight className="feature-arrow" size={20} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="right-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="form-container">
            <div className="form-header">
              <button
                onClick={() => navigate("/")}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#64748b', marginBottom: '20px', padding: '0',
                  fontSize: '0.9rem', fontWeight: '600'
                }}
              >
                <ArrowLeft size={18} /> Back to Home
              </button>
              <img src={logo} alt="Elevare Logo" className="logo-main" />
              <h2>Login</h2>
              <p className="form-subtitle">Access your personal dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="signup-form">
              <div className="form-field">
                <label>Email Address</label>
                <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                    }}
                    onBlur={() => handleBlur('email')}
                    required
                  />
                </div>
                {errors.email && <span className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className={`input-wrapper password-group ${errors.password ? 'error' : ''}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                    }}
                    onBlur={() => handleBlur('password')}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#1a73e8', fontWeight: '600', textDecoration: 'none' }}>Forgot Password?</Link>
                </div>
              </div>

              <motion.button
                type="submit" className="submit-button"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </motion.button>

              <div className="login-link-section">
                Don't have an account? <Link to="/signup" className="login-link">Sign Up</Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
