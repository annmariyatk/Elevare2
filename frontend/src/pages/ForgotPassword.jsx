import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Mail, Lock, ShieldCheck, ArrowLeft, Key, Smartphone, FileCheck
} from "lucide-react";
import logo from "../assets/logo.png";
import Swal from 'sweetalert2';
import "../css/Signup.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/forgot-password/request/", { email });
            Swal.fire('OTP Sent ✅', 'Check your email for the verification code', 'success');
            setStep(2);
        } catch (err) {
            Swal.fire('Error ❌', err.response?.data?.error || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return Swal.fire('Error ❌', 'Passwords do not match', 'error');
        }

        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/forgot-password/reset/", {
                email,
                otp,
                new_password: newPassword
            });
            Swal.fire('Success ✅', 'Password has been reset successfully', 'success');
            navigate("/login");
        } catch (err) {
            Swal.fire('Error ❌', err.response?.data?.error || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="elevare-signup-page forgot-password-page">
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
                            <h1>Secure your <br /><span className="highlight">Account</span></h1>
                            <p className="welcome-subtitle">We'll help you get back to your learning journey safely and quickly.</p>
                        </div>

                        <div className="features-section">
                            <div className="feature-card">
                                <div className="feature-icon"><Smartphone size={24} /></div>
                                <div className="feature-text">
                                    <h3>Verification</h3>
                                    <p>We send a secure OTP to your registered email address.</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon"><FileCheck size={24} /></div>
                                <div className="feature-text">
                                    <h3>Reset Password</h3>
                                    <p>Choose a new strong password to protect your account info.</p>
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
                            <img src={logo} alt="Elevare Logo" className="logo-main" />
                            <h2>{step === 1 ? "Reset Password" : "Create New Password"}</h2>
                            <p className="form-subtitle">{step === 1 ? "Enter your email to receive an OTP" : "Enter the verification code and your new password"}</p>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleRequestOtp} className="signup-form">
                                <div className="form-field">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <motion.button
                                    type="submit" className="submit-button"
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </motion.button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="signup-form">
                                <div className="form-field">
                                    <label>Verification Code (OTP)</label>
                                    <div className="input-wrapper">
                                        <ShieldCheck size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            maxLength={6}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>New Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Confirm New Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit" className="submit-button"
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Update Password"}
                                </motion.button>

                                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="login-link"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Resend OTP?
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="login-link-section">
                            Remember your password? <Link to="/login" className="login-link">Login</Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default ForgotPassword;
