import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { MessageSquare, Reply, User } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function HelpCenter() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/admin/help/issues/");
            setIssues(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (issueId) => {
        const { value: text } = await Swal.fire({
            input: 'textarea',
            inputLabel: 'Reply to Student',
            inputPlaceholder: 'Type your message here...',
            inputAttributes: {
                'aria-label': 'Type your message here'
            },
            showCancelButton: true
        });

        if (text) {
            try {
                await axios.post(`http://127.0.0.1:8000/api/admin/help/reply/${issueId}/`, {
                    reply: text
                });
                Swal.fire('Sent!', 'Your reply has been sent.', 'success');
                fetchIssues();
            } catch (err) {
                Swal.fire('Error', 'Failed to send reply.', 'error');
            }
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
                <h2 style={{ color: '#172554' }}>Help Center Support</h2>

                <div className="dashboard-overview">
                    {loading ? <p>Loading issues...</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {issues.map(issue => (
                                <div key={issue.issue_id} style={{
                                    border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px',
                                    background: 'white', position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                        {issue.type === "Student" ? (
                                            issue.student_profile ? (
                                                <img
                                                    src={`http://127.0.0.1:8000${issue.student_profile}`}
                                                    alt="Profile"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    marginRight: '15px', background: '#f1f5f9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <User size={20} />
                                                </div>
                                            )
                                        ) : (
                                            issue.teacher_profile ? (
                                                <img
                                                    src={`http://127.0.0.1:8000${issue.teacher_profile}`}
                                                    alt="Profile"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    marginRight: '15px', background: '#f1f5f9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <User size={20} />
                                                </div>
                                            )
                                        )}
                                        <div>
                                            <h4 style={{ margin: 0, color: '#1e293b' }}>
                                                {issue.type === "Student" ? issue.student_name : issue.teacher_name}
                                                <span style={{ fontSize: '0.7rem', marginLeft: '8px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {issue.type}
                                                </span>
                                            </h4>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {new Date(issue.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            {issue.status === 1 ? (
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Replied</span>
                                            ) : (
                                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Pending</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px', color: '#334155' }}>
                                        {issue.issue}
                                    </div>

                                    {issue.reply ? (
                                        <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '15px', marginLeft: '20px' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold', margin: '0 0 5px' }}>You replied:</p>
                                            <p style={{ margin: 0, color: '#475569' }}>{issue.reply}</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleReply(issue.issue_id)}
                                            style={{
                                                background: '#1E3A8A', color: 'white', border: 'none', padding: '8px 16px',
                                                borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            <Reply size={16} style={{ marginRight: '6px' }} /> Reply
                                        </button>
                                    )}
                                </div>
                            ))}
                            {issues.length === 0 && <p>No issues found.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HelpCenter;
