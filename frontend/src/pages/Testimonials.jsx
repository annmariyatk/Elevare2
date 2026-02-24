import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { Check, Star, User, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function Testimonials() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/admin/reviews/");
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/review/approve/${id}/`);
            Swal.fire('Approved!', 'Review is now public.', 'success');
            fetchReviews();
        } catch (err) {
            Swal.fire('Error', 'Failed to approve review.', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This testimonial will be removed from the landing page!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/review/delete/${id}/`);
                Swal.fire('Deleted!', 'Testimonial has been removed.', 'success');
                fetchReviews();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete testimonial.', 'error');
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
                <h2 style={{ color: '#1F3E5A' }}>Website Reviews</h2>

                <div className="dashboard-overview">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700' }}>Student</th>
                                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700' }}>Rating</th>
                                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700' }}>Review</th>
                                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700' }}>Status</th>
                                <th style={{ padding: '16px 20px', color: '#475569', fontWeight: '700' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map(r => (
                                <tr key={r.review_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {r.student_profile ? (
                                                <img
                                                    src={`http://127.0.0.1:8000${r.student_profile}`}
                                                    alt=""
                                                    style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '30px', height: '30px', borderRadius: '50%',
                                                    marginRight: '10px', background: '#f1f5f9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <User size={16} />
                                                </div>
                                            )}
                                            {r.student_name}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', color: '#fbbf24' }}>
                                            {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" strokeWidth={0} />)}
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>{r.review}</td>
                                    <td>
                                        {r.status === 1 ? (
                                            <span style={{ color: '#166534', background: '#dcfce7', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Approved</span>
                                        ) : (
                                            <span style={{ color: '#9a3412', background: '#ffedd5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Pending</span>
                                        )}
                                    </td>
                                    <td style={{ display: 'flex', gap: '8px' }}>
                                        {r.status === 0 && (
                                            <button
                                                onClick={() => handleApprove(r.review_id)}
                                                style={{
                                                    background: '#336B91', color: 'white', border: 'none',
                                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                <Check size={14} style={{ marginRight: '4px' }} /> Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(r.review_id)}
                                            style={{
                                                background: '#ef4444', color: 'white', border: 'none',
                                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                            title="Delete Review"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No reviews found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Testimonials;
