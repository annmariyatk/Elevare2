import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, Phone, GraduationCap, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowRight, BookOpen, Star, Trophy, Loader,
  Users, TrendingUp, ArrowLeft
} from "lucide-react";
import logo from "../assets/logo.png";
import Swal from 'sweetalert2';
import "../css/Signup.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    department: "",
    year: "1",
    password: "",
    confirm_password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState({ email: false, phone_number: false });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pass) => {
    // Min 8 chars, at least one letter and one number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pass);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific error
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    // Real-time password validation
    if (name === 'password') {
      if (value && !validatePassword(value)) {
        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters, include a letter and a number" }));
      } else {
        setErrors(prev => ({ ...prev, password: null }));
      }
    }

    // Real-time confirm password validation
    if (name === 'confirm_password') {
      if (value && formData.password && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirm_password: "Passwords do not match" }));
      } else {
        setErrors(prev => ({ ...prev, confirm_password: null }));
      }
    }
  };

  const handleBlur = async (field) => {
    if (!formData[field]) return;

    if (field === 'email') {
      if (!validateEmail(formData.email)) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address (e.g., user@example.com) ✉️" }));
        return;
      }
    }

    if (field === 'phone_number' && !/^\d{10}$/.test(formData.phone_number)) {
      setErrors(prev => ({ ...prev, phone_number: "Phone number must be exactly 10 digits 📱" }));
      return;
    }

    if (field === 'email' || field === 'phone_number') {
      try {
        await axios.post("http://127.0.0.1:8000/api/check-unique/", {
          [field]: formData[field]
        });
      } catch (err) {
        if (err.response && err.response.data) {
          const errMsg = err.response.data[field];
          if (errMsg) {
            setErrors(prev => ({ ...prev, [field]: errMsg + " ❌" }));
          }
        }
      }
    }
  };

  // Real-time email uniqueness check with debouncing
  useEffect(() => {
    const checkEmailUniqueness = async () => {
      if (!formData.email || !validateEmail(formData.email)) return;

      setChecking(prev => ({ ...prev, email: true }));
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/check-unique/", {
          email: formData.email
        });
        // If no error in response, email is unique
        if (response.data.email) {
          setErrors(prev => ({ ...prev, email: response.data.email + " ❌" }));
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.email) {
          setErrors(prev => ({ ...prev, email: err.response.data.email + " ❌" }));
        }
      } finally {
        setChecking(prev => ({ ...prev, email: false }));
      }
    };

    const timeoutId = setTimeout(checkEmailUniqueness, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  // Real-time phone uniqueness check with debouncing
  useEffect(() => {
    const checkPhoneUniqueness = async () => {
      if (!formData.phone_number || !/^\d{10}$/.test(formData.phone_number)) return;

      setChecking(prev => ({ ...prev, phone_number: true }));
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/check-unique/", {
          phone_number: formData.phone_number
        });
        // If no error in response, phone is unique
        if (response.data.phone_number) {
          setErrors(prev => ({ ...prev, phone_number: response.data.phone_number + " ❌" }));
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.phone_number) {
          setErrors(prev => ({ ...prev, phone_number: err.response.data.phone_number + " ❌" }));
        }
      } finally {
        setChecking(prev => ({ ...prev, phone_number: false }));
      }
    };

    const timeoutId = setTimeout(checkPhoneUniqueness, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.phone_number]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check for all errors
    const currentErrors = { ...errors };
    if (!validateEmail(formData.email)) currentErrors.email = "Invalid email format";
    if (!validatePassword(formData.password)) currentErrors.password = "Password is too weak";
    if (formData.password !== formData.confirm_password) currentErrors.confirm_password = "Passwords do not match";

    const hasErrors = Object.values(currentErrors).some(err => err);
    if (hasErrors) {
      setErrors(currentErrors);
      Swal.fire('Validation Error', 'Please fix the errors in the form before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/signup/", formData);
      Swal.fire({
        title: 'Welcome to Elevare!',
        text: 'Account created successfully. Please login with your new credentials.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      }).then(() => navigate('/login'));
    } catch (err) {
      console.error(err);
      const backendErrors = err.response?.data || {};
      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        Swal.fire('Error', 'Please correct the highlighted fields.', 'error');
      } else {
        Swal.fire('Error', 'Signup failed. Please try again later.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="elevare-signup-page">
      <div className="signup-container">
        {/* Left Panel */}
        <motion.div
          className="left-panel redesign-variant"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative background elements */}
          <div className="decor-dot dot-1"></div>
          <div className="decor-dot dot-2"></div>
          <div className="decor-dot dot-3"></div>

          <div className="welcome-content">
            <div className="welcome-header">
              <h1>Welcome to Your <br /><span className="highlight">Skill-Sharing Community</span></h1>
              <p className="welcome-subtitle">
                Join thousands of students sharing knowledge, building skills, and empowering each other's futures. Your journey to excellence starts here.
              </p>
            </div>

            <div className="features-section">
              <div className="feature-card glass-card">
                <div className="feature-icon small-icon"><Users size={20} /></div>
                <div className="feature-text">
                  <h3>Connect with Peers</h3>
                  <p>Build meaningful connections with fellow students</p>
                </div>
              </div>

              <div className="feature-card glass-card">
                <div className="feature-icon small-icon"><BookOpen size={20} /></div>
                <div className="feature-text">
                  <h3>Learn & Teach</h3>
                  <p>Share your expertise and gain new skills</p>
                </div>
              </div>

              <div className="feature-card glass-card">
                <div className="feature-icon small-icon"><TrendingUp size={20} /></div>
                <div className="feature-text">
                  <h3>Grow Together</h3>
                  <p>Elevate as a community towards success</p>
                </div>
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
                onClick={() => navigate("/login")}
                className="back-to-login-btn"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#64748b', marginBottom: '10px', padding: '0',
                  fontSize: '0.9rem', fontWeight: '600'
                }}
              >
                <ArrowLeft size={18} /> Back to Login
              </button>
              <img src={logo} alt="Elevare Logo" className="logo-main" />
              <h2>Create Account</h2>
              <p className="form-subtitle">Fill in the details to start your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Username</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      name="username" type="text"
                      value={formData.username} onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address</label>
                  <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                    <Mail size={18} className="input-icon" />
                    <input
                      name="email" type="email"
                      value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')} required
                    />
                    {checking.email && <Loader size={18} className="input-icon-right spin" />}
                    {!checking.email && formData.email && validateEmail(formData.email) && !errors.email && (
                      <CheckCircle size={18} className="input-icon-right success" />
                    )}
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label>Phone Number</label>
                  <div className={`input-wrapper ${errors.phone_number ? 'error' : ''}`}>
                    <Phone size={18} className="input-icon" />
                    <input
                      name="phone_number" type="text"
                      value={formData.phone_number} onChange={handleChange} onBlur={() => handleBlur('phone_number')} required
                    />
                    {checking.phone_number && <Loader size={18} className="input-icon-right spin" />}
                    {!checking.phone_number && formData.phone_number && /^\d{10}$/.test(formData.phone_number) && !errors.phone_number && (
                      <CheckCircle size={18} className="input-icon-right success" />
                    )}
                  </div>
                  {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
                </div>

                <div className="form-field">
                  <label>Year</label>
                  <div className="select-wrapper">
                    <GraduationCap size={18} className="input-icon" />
                    <select name="year" value={formData.year} onChange={handleChange}>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="5">5th Year</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Department</label>
                  <div className="input-wrapper">
                    <GraduationCap size={18} className="input-icon" />
                    <input
                      name="department" type="text"
                      value={formData.department} onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className="input-wrapper password-group">
                  <Lock size={18} className="input-icon" />
                  <input
                    name="password" type={showPassword ? "text" : "password"}
                    value={formData.password} onChange={handleChange} required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-field">
                <label>Confirm Password</label>
                <div className="input-wrapper password-group">
                  <Lock size={18} className="input-icon" />
                  <input
                    name="confirm_password" type={showPassword ? "text" : "password"}
                    value={formData.confirm_password} onChange={handleChange} required
                  />
                </div>
                {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
              </div>

              <motion.button
                type="submit" className="submit-button"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </motion.button>

              <div className="login-link-section">
                Already have an account? <Link to="/login" className="login-link">Login</Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;