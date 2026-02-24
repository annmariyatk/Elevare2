import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/connectfriend.css";

const BASE_URL = "http://127.0.0.1:8000/api";

function ConnectFriend() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkActiveStudy();
    // eslint-disable-next-line
  }, []);

  // =========================
  // CHECK ACTIVE STUDY CONDITION
  // =========================
  const checkActiveStudy = async () => {
    try {
      // ✅ Check if student has a started/progress study without skill assigned
      const res = await axios.get(`${BASE_URL}/study/active-started/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.exists) {
        navigate("/dashboard/form", {
          state: { study_id: res.data.study_id },
        });
        return;
      }

      // If no active/pending study setup, load students
      loadStudents();
    } catch (err) {
      console.error("Study check failed", err);
      loadStudents(); // fallback to show students if check fails
    }
  };

  // =========================
  // LOAD STUDENTS
  // =========================
  const loadStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/connect/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================
  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  // =========================
  // STAR RENDER
  // =========================
  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < full ? "filled" : ""}`}>
        ★
      </span>
    ));
  };

  if (loading) return <p style={{ padding: 20 }}>Loading students…</p>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h2 style={{ color: '#172554', marginBottom: '12px', fontSize: '2rem', fontWeight: '800' }}>Students Hub 🤝</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Find and connect with peers from your college.</p>
      </div>

      <div style={{ position: 'relative', maxWidth: '500px', margin: '0 0 40px 0' }}>
        <input
          type="text"
          placeholder="Search students by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="connect-search"
          style={{
            width: '100%',
            padding: '14px 20px',
            paddingLeft: '45px',
            borderRadius: '12px',
            border: '2px solid #e2e8f0',
            fontSize: '1rem',
            outline: 'none',
            background: 'white',
            boxShadow: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#1E3A8A';
            e.target.style.boxShadow = '0 0 0 4px rgba(30, 58, 138, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
        <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: 0.7 }}>🔍</span>
      </div>

      <div className="connect-grid animate-slide-up">
        {filteredStudents.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'left', padding: '40px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.1rem' }}>No students found matching your search.</p>
          </div>
        )}

        {filteredStudents.map((s) => (
          <div className="connect-card" key={s.student_id} style={{
            background: 'white',
            borderRadius: '24px',
            padding: '30px',
            textAlign: 'left',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            }}
          >
            <div className="connect-avatar" style={{
              width: '90px',
              height: '90px',
              margin: '0 0 20px 0',
              borderRadius: '50%',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#cbd5e1',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}>
              {s.picture ? (
                <img
                  src={s.picture}
                  alt={s.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <span className="avatar-icon">👤</span>
              )}
            </div>

            <h3 style={{ margin: '0 0 8px', color: '#172554', fontSize: '1.4rem', fontWeight: '700' }}>{s.username}</h3>
            <p className="dept" style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px', fontWeight: '500' }}>{s.department}</p>

            <div className="rating" style={{ marginBottom: '25px', color: '#fbbf24', fontSize: '1.1rem' }}>
              {renderStars(s.rating)}
              <span className="rating-value" style={{ color: '#94a3b8', fontSize: '0.9rem', marginLeft: '8px', fontWeight: '600' }}>
                {s.rating ? Number(s.rating).toFixed(1) : 'New'}
              </span>
            </div>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/dashboard/connect-student", {
                  state: { student_id: s.student_id },
                })
              }
              style={{
                borderRadius: '50px',
                width: '100%',
                padding: '14px',
                fontWeight: '600',
                background: '#DBEAFE',
                color: '#1E3A8A',
                border: '1px solid #bfdbfe',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#1E3A8A';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#DBEAFE';
                e.target.style.color = '#1E3A8A';
              }}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConnectFriend;
