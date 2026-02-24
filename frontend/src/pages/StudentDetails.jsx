import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { ArrowLeft, Download, FileText, GraduationCap } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function StudentDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.studentId;
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState("history");
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [historySearch, setHistorySearch] = useState("");
    const [assessmentSearch, setAssessmentSearch] = useState("");

    useEffect(() => {
        if (!id) {
            navigate('/admin-dashboard/users');
            return;
        }
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/student/${id}/`);
            setData(res.data);
        } catch (err) {
            console.error("Error fetching details", err);
            Swal.fire('Error', 'Could not load student details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAssessment = async (assessmentId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will revert the assessment to 'Submitted' and cancel the associated certificate!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(`http://127.0.0.1:8000/api/admin/assessment/cancel/${assessmentId}/`);
                    Swal.fire('Reverted!', 'Assessment status has been reset.', 'success');
                    fetchDetails(); // Refresh UI
                } catch (err) {
                    Swal.fire('Error', 'Failed to revert assessment.', 'error');
                }
            }
        });
    };

    if (loading) return (
        <div className="admin-dashboard-container">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="admin-main-content">
                <p style={{ padding: '40px', color: '#64748b', fontSize: '1.1rem' }}>Loading student intelligence...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="admin-dashboard-container">
            <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="admin-main-content">
                <p style={{ padding: '40px', color: '#ef4444', fontSize: '1.1rem' }}>Student data not found or server error.</p>
                <button onClick={() => navigate('/admin-dashboard/users')} style={{ marginLeft: '40px', padding: '10px 20px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Return to Users</button>
            </div>
        </div>
    );

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

            <div className="admin-main-content animate-fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/admin-dashboard/users')}
                    style={{
                        background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', marginBottom: '20px', fontSize: '1rem',
                        fontWeight: '500', transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#1E3A8A'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                >
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Users
                </button>

                <div className="overview-card" style={{ marginBottom: '30px', padding: '30px', background: 'white', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold'
                        }}>
                            {data.student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ color: '#172554', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>{data.student.username}</h2>
                            <p style={{ color: '#64748b', margin: '5px 0 0' }}>
                                {data.student.email} • <span style={{ color: '#1e3a8a', fontWeight: '700' }}>{data.student.department}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '10px', marginBottom: '25px',
                    background: 'white', padding: '8px', borderRadius: '12px',
                    width: 'fit-content', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <button
                        onClick={() => setActiveTab("history")}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === "history" ? '#1E3A8A' : 'transparent',
                            color: activeTab === "history" ? 'white' : '#64748b',
                            cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
                        }}
                    >
                        Study History
                    </button>

                    <button
                        onClick={() => setActiveTab("assessments")}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === "assessments" ? '#1E3A8A' : 'transparent',
                            color: activeTab === "assessments" ? 'white' : '#64748b',
                            cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
                        }}
                    >
                        Assessments ({data.assessments.length})
                    </button>
                </div>

                {/* HISTORY TAB */}
                {activeTab === "history" && (
                    <div className="overview-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '700' }}>Recent Study Connections</h3>
                            <input
                                type="text"
                                placeholder="Search by partner or skill..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                style={{
                                    padding: '8px 15px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                    outline: 'none', width: '250px', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Partner</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Skill Practiced</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Start Date</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history
                                        .filter(h =>
                                            h.partner_name.toLowerCase().includes(historySearch.toLowerCase()) ||
                                            (h.my_skill && h.my_skill.toLowerCase().includes(historySearch.toLowerCase()))
                                        )
                                        .map((h) => (
                                            <tr key={h.study_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{h.partner_name}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ background: '#f8fafc', padding: '5px', borderRadius: '4px' }}>
                                                            <GraduationCap size={16} color="#64748b" />
                                                        </div>
                                                        {h.my_skill}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>{h.start_date}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        background:
                                                            h.status === 'Completed' ? '#dcfce7' :
                                                                h.status === 'Cancelled' ? '#fee2e2' : '#f1f5f9',
                                                        color:
                                                            h.status === 'Completed' ? '#166534' :
                                                                h.status === 'Cancelled' ? '#991b1b' : '#475569',
                                                    }}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    {data.history.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No study history found for this student.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ASSESSMENTS TAB */}
                {activeTab === "assessments" && (
                    <div className="overview-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '700' }}>Academic Assessments</h3>
                            <input
                                type="text"
                                placeholder="Search by project or type..."
                                value={assessmentSearch}
                                onChange={(e) => setAssessmentSearch(e.target.value)}
                                style={{
                                    padding: '8px 15px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                    outline: 'none', width: '250px', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Project</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Submission Type</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'right' }}>Resources</th>
                                        <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.assessments
                                        .filter(a =>
                                            (a.project_title && a.project_title.toLowerCase().includes(assessmentSearch.toLowerCase())) ||
                                            (a.assessment_work && a.assessment_work.toLowerCase().includes(assessmentSearch.toLowerCase()))
                                        )
                                        .map((a) => (
                                            <tr key={a.assessment_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{a.project_title || 'Untitled Project'}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        background: '#f1f5f9', padding: '4px 8px',
                                                        borderRadius: '6px', fontSize: '0.85rem'
                                                    }}>{a.assessment_work || 'N/A'}</span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ color: '#16a34a', fontWeight: '600' }}>● {a.status}</span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        {a.assessment_file && (
                                                            <a href={`http://127.0.0.1:8000${a.assessment_file}`} download target="_blank" rel="noreferrer"
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                                    color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem',
                                                                    fontWeight: '600', padding: '6px 12px', background: '#eff6ff',
                                                                    borderRadius: '6px', border: '1px solid #dbeafe'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = '#eff6ff'}
                                                            >
                                                                <Download size={14} /> Work
                                                            </a>
                                                        )}
                                                        {a.validation_form && (
                                                            <a href={`http://127.0.0.1:8000${a.validation_form}`} download target="_blank" rel="noreferrer"
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                                    color: '#b45309', textDecoration: 'none', fontSize: '0.9rem',
                                                                    fontWeight: '600', padding: '6px 12px', background: '#fffbeb',
                                                                    borderRadius: '6px', border: '1px solid #fef3c7'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#fef3c7'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = '#fffbeb'}
                                                            >
                                                                <Download size={14} /> Validation
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                    {a.status === 'Completed' && (
                                                        <button
                                                            onClick={() => handleCancelAssessment(a.assessment_id)}
                                                            style={{
                                                                background: '#fee2e2',
                                                                color: '#dc2626',
                                                                border: '1px solid #fecaca',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                fontWeight: '600',
                                                                fontSize: '0.85rem',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    {data.assessments.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No assessments submitted yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentDetails;
