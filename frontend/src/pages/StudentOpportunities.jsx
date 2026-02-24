import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Search, Briefcase, BookOpen, User, Plus, ExternalLink } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css"; // Reuse dashboard styles

function StudentOpportunities() {
    const student_id = localStorage.getItem("student_id");
    const { setData } = useOutletContext();
    const token = localStorage.getItem("token");

    // =========================
    // MARK AS VIEWED
    // =========================
    useEffect(() => {
        const markAsViewed = async () => {
            try {
                await axios.post("http://127.0.0.1:8000/api/notifications/mark-viewed/",
                    { section: "internships_courses" },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (setData) {
                    setData(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            notifications: {
                                ...prev.notifications,
                                internships_courses: 0
                            }
                        };
                    });
                }
            } catch (err) {
                console.error("Failed to mark internships as viewed", err);
            }
        };
        markAsViewed();
    }, [token, setData]);
    const [activeTab, setActiveTab] = useState("all"); // all, internship, course
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // New Post Form
    const [newPost, setNewPost] = useState({
        title: "",
        type: "Internship",
        description: "",
        link: ""
    });

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/opportunities/list/", {});
            setOpportunities(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/opportunities/create/", {
                ...newPost,
                student_id: student_id
            });

            if (res.data.email_error) {
                Swal.fire('Posted but Email Failed', `Opportunity posted, but email failed: ${res.data.email_error}`, 'warning');
            } else {
                Swal.fire('Posted!', res.data.message, 'success');
            }
            setShowModal(false);
            setNewPost({ title: "", type: "Internship", description: "", link: "" });
            fetchOpportunities();
        } catch (err) {
            Swal.fire('Error', 'Failed to post opportunity.', 'error');
        }
    };

    const filtered = opportunities.filter(o => activeTab === 'all' || o.type === activeTab);

    return (
        <div className="animate-fade-in" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#172554', margin: 0, fontSize: '1.75rem' }}>Internships & Courses</h2>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: '#1E3A8A', color: 'white', border: 'none', padding: '10px 20px',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: '600'
                    }}
                >
                    <Plus size={18} style={{ marginRight: '6px' }} /> Post Opportunity
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['all', 'Internship', 'Course'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            background: activeTab === tab ? '#172554' : '#DBEAFE',
                            color: activeTab === tab ? 'white' : '#172554', cursor: 'pointer', fontWeight: '600',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List Grid - 4 per row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
                width: '100%'
            }}>
                {filtered.map(item => (
                    <div key={item.post_id} style={{
                        background: 'white', borderRadius: '16px', padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative',
                        border: item.is_admin ? '2px solid #1E3A8A' : '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s',
                    }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div>
                            {item.is_admin && (
                                <span style={{
                                    position: 'absolute', top: '-10px', right: '10px',
                                    background: '#1E3A8A', color: 'white', padding: '4px 10px',
                                    borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                                    boxShadow: '0 4px 10px rgba(30, 58, 138, 0.3)'
                                }}>
                                    VERIFIED
                                </span>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>
                                <User size={12} style={{ marginRight: '4px' }} />
                                {item.posted_by} • {new Date(item.date).toLocaleDateString()}
                            </div>

                            <h3 style={{ margin: '0 0 10px', color: '#1e293b', display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: '700' }}>
                                {item.type === 'Internship' ? <Briefcase size={18} style={{ marginRight: '8px', color: '#10b981' }} /> : <BookOpen size={18} style={{ marginRight: '8px', color: '#f59e0b' }} />}
                                {item.title}
                            </h3>

                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.description}
                            </p>
                        </div>

                        <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
                                color: '#1E3A8A', fontWeight: '700', fontSize: '0.85rem',
                                padding: '8px 0', borderTop: '1px solid #f1f5f9', width: '100%',
                                marginTop: 'auto'
                            }}
                        >
                            View Opportunity <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                        </a>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Post an Opportunity</h3>
                        <form onSubmit={handlePostSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Title</label>
                                <input
                                    type="text" required
                                    value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Type</label>
                                <select
                                    value={newPost.type} onChange={e => setNewPost({ ...newPost, type: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                >
                                    <option>Internship</option>
                                    <option>Course</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Description</label>
                                <textarea
                                    required rows="4"
                                    value={newPost.description} onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600' }}>Link</label>
                                <input
                                    type="url" required placeholder="https://..."
                                    value={newPost.link} onChange={e => setNewPost({ ...newPost, link: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e2e8f0', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1E3A8A', color: 'white', cursor: 'pointer' }}>Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentOpportunities;
