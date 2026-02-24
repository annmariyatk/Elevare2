import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { User, Search } from "lucide-react";
import Swal from "sweetalert2";
import "../css/dashboard.css";

function SearchTeacher() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const { study_id } = location.state || {};

  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ Fetch all active teachers
  useEffect(() => {
    document.title = "Find a Mentor | Elevare";
    const fetchTeachers = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "http://127.0.0.1:8000/api/teachers/list/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeachers(res.data || []);
        setFilteredTeachers(res.data || []);
        setLoading(false);
      } catch (err) {
        console.log("Teachers List Error:", err.response?.data || err);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [token]);

  // ✅ Filter teachers
  useEffect(() => {
    let temp = [...teachers];

    if (department) {
      temp = temp.filter((t) => t.department === department);
    }

    if (searchText.trim()) {
      temp = temp.filter((t) =>
        t.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredTeachers(temp);
  }, [searchText, department, teachers]);

  const uniqueDepartments = [...new Set(teachers.map((t) => t.department))];

  // ✅ Select teacher → update study_connection.teacher_id
  const handleSelectTeacher = async (teacher) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/study/select-teacher/${study_id}/`,
        { teacher_id: teacher.teacher_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await Swal.fire({
        title: "Mentor Selected! ✅",
        text: `${teacher.name} is now your mentor. An email has been sent to them.`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false
      });

      const fromPath = location.state?.from || "/dashboard/form";
      navigate(fromPath, { state: { study_id } });
    } catch (err) {
      console.log("Select Teacher Error:", err.response?.data || err);
      Swal.fire("Error ❌", "Failed to select mentor", "error");
    }
  };

  if (!study_id) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px' }}>
        <div className="overview-card">
          <h2>Invalid Access ❌</h2>
          <button className="btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ✅ Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#172554', margin: 0, fontSize: '1.8rem' }}>Find a Mentor 👨‍🏫</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0' }}>Connect with an experienced student to guide your skill journey</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9', color: '#475569', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          Go Back
        </button>
      </div>

      {/* ✅ Search + Filter */}
      <div className="overview-card" style={{
        display: 'flex', gap: '20px', marginBottom: '30px',
        padding: '20px', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'flex-start', textAlign: 'left'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search mentor by name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              background: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1E3A8A';
              e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: 'white',
            minWidth: '220px',
            cursor: 'pointer',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#1E3A8A';
            e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map((dep, index) => (
            <option key={index} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Loading */}
      {loading && <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Searching for mentors...</div>}

      {/* ✅ Teacher Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {filteredTeachers.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '50px', gridColumn: '1/-1', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.2rem' }}>No mentors found matching your criteria. ❌</p>
          </div>
        ) : (
          filteredTeachers.map((t, idx) => (
            <div className="overview-card animate-slide-up" key={t.teacher_id} style={{
              animationDelay: `${idx * 0.05}s`,
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                overflow: 'hidden', border: '3px solid #f1f5f9',
                marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                {t.profile ? (
                  <img src={t.profile} alt="teacher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#475569'
                  }}>
                    <User size={40} />
                  </div>
                )}
              </div>

              <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: '1.25rem' }}>{t.name}</h3>

              <div style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 5px', color: '#1E3A8A', fontWeight: '600' }}>{t.department}</p>
              </div>

              <button
                className="btn-primary"
                onClick={() => handleSelectTeacher(t)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px',
                  background: '#1E3A8A', color: 'white', border: 'none',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#172554'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1E3A8A'}
              >
                Select Mentor
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchTeacher;
