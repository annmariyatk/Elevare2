import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function AdminPostOpportunity() {
    const [formData, setFormData] = useState({
        title: "",
        type: "Internship",
        description: "",
        link: ""
    });

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/opportunities/create/", {
                ...formData,
                is_admin: true
            });

            if (res.data.email_error) {
                Swal.fire('Posted but Email Failed', `Opportunity posted, but email failed: ${res.data.email_error}`, 'warning');
            } else {
                Swal.fire('Posted!', res.data.message, 'success');
            }
            setFormData({ title: "", type: "Internship", description: "", link: "" });
        } catch (err) {
            Swal.fire('Error', 'Failed to create opportunity.', 'error');
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
                <h2 style={{ color: '#172554' }}>Post Internship or Course</h2>

                <div className="dashboard-overview" style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                            <input
                                type="text" required
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Type</label>
                            <select
                                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                <option>Internship</option>
                                <option>Course</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea
                                required rows="5"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Link</label>
                            <input
                                type="url" required placeholder="https://..."
                                value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '12px 30px', borderRadius: '8px', border: 'none', background: '#1E3A8A', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                            Post Now
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminPostOpportunity;
