import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Search, Filter, Trash2, ExternalLink } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";
// reusing adminDashboard styles for specific table layouts if needed, 
// but focusing on matching dashboard.css classes

function Users() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [deptList, setDeptList] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/admin/student-departments/")
            .then(res => setDeptList(res.data))
            .catch(err => console.error("Error fetching depts", err));
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [search, department]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/admin/students/", {
                params: { search, department }
            });
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the student and their data!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://127.0.0.1:8000/api/admin/student/delete/${id}/`);
                    Swal.fire('Deleted!', 'User has been removed.', 'success');
                    fetchStudents(); // Refresh list
                } catch (err) {
                    Swal.fire('Error', 'Failed to delete student.', 'error');
                }
            }
        });
    };

    const handleOpen = (id) => {
        navigate(`/admin-dashboard/student-details`, { state: { studentId: id } });
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

            <div className="admin-main-content animate-fade-in" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ color: '#1E3A8A', margin: 0, fontSize: '2rem', fontWeight: '800' }}>Manage Users 👥</h2>
                        <p style={{ color: '#64748b', margin: '5px 0 0' }}>Manage student records and monitor their progress</p>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="overview-card" style={{
                    display: 'flex', gap: '20px', marginBottom: '30px',
                    padding: '25px', background: 'white', borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', top: '12px', left: '15px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 45px',
                                border: '1px solid #e2e8f0', borderRadius: '12px',
                                outline: 'none', transition: 'border-color 0.2s',
                                fontSize: '1rem'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Filter size={20} style={{ position: 'absolute', top: '12px', left: '15px', color: '#94a3b8' }} />
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 45px',
                                border: '1px solid #e2e8f0', borderRadius: '12px',
                                outline: 'none', background: 'white', cursor: 'pointer',
                                fontSize: '1rem', appearance: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        >
                            <option value="">All Departments</option>
                            {deptList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                        <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>▼</span>
                    </div>
                </div>

                <div className="overview-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                            <p style={{ fontSize: '1.1rem' }}>Loading users...</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderBottom: 'none' }}>
                                    <tr>
                                        <th style={{ padding: '18px 25px', color: '#ffffff', fontWeight: '600', borderBottom: 'none' }}>Student</th>
                                        <th style={{ padding: '18px 25px', color: '#ffffff', fontWeight: '600', borderBottom: 'none' }}>Contact</th>
                                        <th style={{ padding: '18px 25px', color: '#ffffff', fontWeight: '600', borderBottom: 'none' }}>Department</th>
                                        <th style={{ padding: '18px 25px', color: '#ffffff', fontWeight: '600', borderBottom: 'none', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, idx) => (
                                        <tr key={student.student_id} style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background 0.2s',
                                        }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{student.username}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>ID: #{student.student_id}</div>
                                            </td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <div style={{ color: '#475569', marginBottom: '4px' }}>{student.email}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{student.phone_number}</div>
                                            </td>
                                            <td style={{ padding: '20px 25px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    background: '#E0F2FE',
                                                    color: '#0369a1',
                                                    borderRadius: '50px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {student.department}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleOpen(student.student_id)}
                                                        style={{
                                                            background: '#1E3A8A',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                                    >
                                                        <ExternalLink size={16} /> Details
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(student.student_id)}
                                                        style={{
                                                            background: '#fee2e2',
                                                            color: '#dc2626',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'none'; }}
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                                                <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>No users found 🔍</div>
                                                <p>Try adjusting your search or filters</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Users;
