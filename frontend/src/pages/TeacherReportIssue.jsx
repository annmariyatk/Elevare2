import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Lock,
    MessageSquare,
    Send,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    User
} from "lucide-react";
import Swal from "sweetalert2";
import "../css/landing.css"; // Reuse landing styles where possible

function TeacherReportIssue() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Issue
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [issue, setIssue] = useState("");
    const [loading, setLoading] = useState(false);
    const [teacherName, setTeacherName] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/support/send-teacher-otp/", { email });
            Swal.fire({
                title: "OTP Sent! 📧",
                text: res.data.message,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
            setStep(2);
        } catch (err) {
            Swal.fire("Error ❌", err.response?.data?.error || "Failed to send OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/support/verify-teacher-otp/", { email, otp });
            setTeacherName(res.data.name || "Mentor");
            setStep(3);
        } catch (err) {
            Swal.fire("Error ❌", err.response?.data?.error || "Invalid OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitIssue = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/support/create/", {
                teacher_id: null, // Backend should find by email if we send it or if we verify first
                email: email,
                issue: issue
            });
            await Swal.fire({
                title: "Report Submitted! ✅",
                text: "Thank you for your feedback. We will get back to you soon.",
                icon: "success"
            });
            navigate("/"); // Direct back to landing page
        } catch (err) {
            Swal.fire("Error ❌", "Failed to submit issue", "error");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
    };

    return (
        <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F0F4FF 0%, #E2E8F0 100%)', padding: '20px' }}>
            <motion.div
                className="login-card"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    background: 'white',
                    borderRadius: '24px',
                    padding: 'clamp(20px, 5vw, 40px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    margin: '0 10px'
                }}
            >
                {/* Back Button */}
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}
                    style={{ position: 'absolute', top: '24px', left: '24px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                    <ArrowLeft size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--navy-soft)',
                        color: 'var(--primary-blue)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                        Teacher Support
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {step === 1 && "Start by entering your registered email"}
                        {step === 2 && "Enter the verification code sent to you"}
                        {step === 3 && `Hello ${teacherName}, what issue are you facing?`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP}
                        >
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="contact-btn"
                                disabled={loading}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700' }}
                            >
                                {loading ? "SENDING..." : "SEND VERIFICATION CODE"}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleVerifyOTP}
                        >
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                                    <Lock size={16} /> Enter OTP
                                </label>
                                <input
                                    type="text"
                                    placeholder="6-digit code"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
                                    Verification code sent to <strong>{email}</strong>
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="contact-btn"
                                disabled={loading}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700' }}
                            >
                                {loading ? "VERIFYING..." : "VERIFY & PROCEED"}
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmitIssue}
                        >
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
                                    <MessageSquare size={16} /> Describe Your Issue
                                </label>
                                <textarea
                                    placeholder="Type your issue details here..."
                                    value={issue}
                                    onChange={(e) => setIssue(e.target.value)}
                                    required
                                    rows="5"
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', resize: 'none' }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="contact-btn"
                                disabled={loading}
                                style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Send size={20} />
                                {loading ? "SUBMITTING..." : "SUBMIT REPORT"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Need immediate assistance? <br />
                        <a href="mailto:support@elevare.com" style={{ color: 'var(--primary-blue)', fontWeight: '600', textDecoration: 'none' }}>
                            Email us at support@elevare.com
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default TeacherReportIssue;
