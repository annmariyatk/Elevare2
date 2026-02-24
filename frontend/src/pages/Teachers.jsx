import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import { Search, Filter, Trash2, Mail, Briefcase } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/dashboard.css";

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [deptList, setDeptList] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/admin/teacher-departments/")
            .then(res => setDeptList(res.data))
            .catch(err => console.error("Error fetching depts", err));
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [search, department]);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/admin/teachers/", {
                params: { search, department }
            });
            setTeachers(res.data);
        } catch (err) {
            console.error("Error fetching teachers", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently remove the teacher!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://127.0.0.1:8000/api/admin/teacher/delete/${id}/`);
                    Swal.fire('Deleted!', 'Teacher has been removed.', 'success');
                    fetchTeachers();
                } catch (err) {
                    Swal.fire('Error', 'Failed to delete teacher.', 'error');
                }
            }
        });
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
                <h2 style={{ color: '#172554' }}>Manage Teachers</h2>

                <div className="search-filter-bar" style={{
                    display: 'flex', gap: '15px', marginBottom: '20px',
                    background: 'white', padding: '15px', borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 10px 10px 40px',
                                border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Filter size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#64748b' }} />
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{
                                padding: '10px 10px 10px 40px',
                                border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none',
                                minWidth: '200px'
                            }}
                        >
                            <option value="">All Departments</option>
                            {deptList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>
                </div>

                {/* Teachers Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {loading ? <p>Loading...</p> : teachers.map((teacher) => (
                        <div key={teacher.teacher_id} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0', transition: 'transform 0.2s',
                            position: 'relative'
                        }}>
                            <img
                                src={teacher.profile ? `http://127.0.0.1:8000${teacher.profile}` : "https://via.placeholder.com/100"}
                                alt={teacher.name}
                                style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    objectFit: 'cover', marginBottom: '15px', border: '3px solid #f1f5f9'
                                }}
                            />
                            <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', color: '#1e293b' }}>{teacher.name}</h3>
                            <p style={{ margin: '0 0 15px', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase size={14} style={{ marginRight: '4px' }} /> {teacher.department}
                            </p>

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', color: '#475569' }}>
                                    <Mail size={14} style={{ marginRight: '5px' }} /> Email
                                </span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', whiteSpace: 'nowrap' }} title={teacher.email}>
                                    {teacher.email}
                                </span>
                            </div>

                            <button
                                onClick={() => handleDelete(teacher.teacher_id)}
                                style={{
                                    marginTop: '15px', width: '100%', padding: '10px',
                                    background: '#fef2f2', color: '#ef4444',
                                    border: '1px solid #fecaca', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: '500', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Trash2 size={16} style={{ marginRight: '6px' }} /> Remove Teacher
                            </button>
                        </div>
                    ))}
                    {!loading && teachers.length === 0 && <p>No teachers found.</p>}
                </div>

            </div>
        </div>
    );
}

export default Teachers;
