import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function AddTeacher() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", phone_number: "", department: "" });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const departments = [
        'Computer Science', 'Information Technology', 'Electronics & Communication Engineering',
        'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
        'Chemical Engineering', 'Biotechnology', 'Business Administration', 'Commerce',
        'Arts', 'Science', 'Medical', 'Law', 'Architecture', 'Design'
    ];

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user changes input
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleBlur = async (field) => {
        const value = formData[field];
        if (!value) return;

        let newErrors = { ...errors };

        if (field === 'email') {
            if (!validateEmail(value)) {
                setErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
                return;
            }
        }

        if (field === 'phone_number') {
            if (!/^\d{10}$/.test(value)) {
                setErrors(prev => ({ ...prev, phone_number: 'Phone number must be exactly 10 digits.' }));
                return;
            }
        }

        try {
            // Check uniqueness in backend
            const res = await axios.post("http://127.0.0.1:8000/api/check-unique-teacher/", { [field]: value });
            // If success, it means unique (based on views_v3 logic usually returning 200 for unique)
            setErrors(prev => ({ ...prev, [field]: null }));
        } catch (err) {
            if (err.response && err.response.data && err.response.data[field]) {
                setErrors(prev => ({ ...prev, [field]: err.response.data[field] }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final Validation
        if (!validateEmail(formData.email)) {
            Swal.fire('Invalid Email', 'Please provide a valid email format.', 'error');
            return;
        }
        if (errors.email || errors.phone_number) {
            Swal.fire('Validation Error', 'Please fix the highlighted errors.', 'warning');
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("phone_number", formData.phone_number);
        data.append("department", formData.department);
        if (image) data.append("profile", image);

        try {
            await axios.post("http://127.0.0.1:8000/api/admin/add-teacher/", data, { headers: { "Content-Type": "multipart/form-data" } });
            Swal.fire({ icon: 'success', title: 'Success!', text: 'Teacher added successfully.', timer: 1500, showConfirmButton: false }).then(() => navigate('/admin-dashboard/teachers'));
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || err.response?.data?.email || 'Failed to add teacher', 'error');
        } finally {
            setIsSubmitting(false);
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
                <button onClick={() => navigate('/admin-dashboard/teachers')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Back to Teachers
                </button>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ color: '#172554', marginBottom: '20px' }}>Add New Teacher</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #cbd5e1', position: 'relative' }}>
                                {preview ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: '#94a3b8', textAlign: 'center' }}><Upload size={24} style={{ marginBottom: '5px' }} /><div style={{ fontSize: '0.7rem' }}>Upload Photo</div></div>}
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.email ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                            />
                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                onBlur={() => handleBlur('phone_number')}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: errors.phone_number ? '1px solid #ef4444' : '1px solid #e2e8f0' }}
                            />
                            {errors.phone_number && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{errors.phone_number}</span>}
                        </div>
                        <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Department</label><input type="text" name="department" value={formData.department} placeholder="Type department name..." onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} /></div>
                        <button type="submit" disabled={isSubmitting} style={{ background: '#1E3A8A', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>{isSubmitting ? "Adding..." : <><UserPlus size={20} style={{ marginRight: '8px' }} /> Add Teacher</>}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddTeacher;
