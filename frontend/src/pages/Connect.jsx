import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, FileText } from "lucide-react";
import Swal from "sweetalert2";
import "../css/connect.css";

const STUDENT_DETAIL_API = "http://127.0.0.1:8000/api/student/";
const DASHBOARD_API = "http://127.0.0.1:8000/api/student-dashboard/";
const LATEST_SKILL_API = "http://127.0.0.1:8000/api/student-skill/latest/";
const CREATE_STUDY_API = "http://127.0.0.1:8000/api/studyconnection/create/";
const STARTED_STUDY_API = "http://127.0.0.1:8000/api/study/active-started/";
const UPDATE_STATUS_API = "http://127.0.0.1:8000/api/update-study-status/";

function Connect() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const { student_id } = location.state || {};
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // Auto-Redirect if Study "Started"
  // =============================
  useEffect(() => {
    const checkActiveStudy = async () => {
      try {
        const res = await axios.get(STARTED_STUDY_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.exists) {
          navigate("/dashboard/form", { state: { study_id: res.data.study_id } });
        }
      } catch (err) {
        console.error("Error checking active study:", err);
      }
    };
    checkActiveStudy();
  }, [token, navigate]);

  // =============================
  // Fetch Student Profile
  // =============================
  useEffect(() => {
    if (!student_id) {
      navigate("/dashboard/connect");
      return;
    }

    axios
      .get(`${STUDENT_DETAIL_API}${student_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [student_id, token, navigate]);

  // =============================
  // START BUTTON
  // =============================
  const handleStart = async () => {
    try {
      // 1. Check for "Started" connection
      const startedRes = await axios.get(STARTED_STUDY_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (startedRes.data.exists) {
        const { study_id } = startedRes.data;
        const result = await Swal.fire({
          title: "Existing Study Found 📚",
          text: "You have an existing study that is already started. Do you want to continue it or cancel and start fresh?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Continue Existing",
          cancelButtonText: "Cancel and Start New",
          confirmButtonColor: "#1E3A8A",
          cancelButtonColor: "#d33",
        });

        if (result.isConfirmed) {
          // Continue -> Go to Form
          navigate("/dashboard/form", { state: { study_id } });
          return;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Cancel -> Update status and redirect
          await axios.post(`${UPDATE_STATUS_API}${study_id}/`,
            { status: "Cancelled" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Cancelled", "Your previous study has been cancelled.", "success");
          navigate("/dashboard/connect");
          return;
        } else {
          // User closed Swal without clicking buttons
          return;
        }
      }

      // 2. Check current logged-in user's latest skill status
      const mySkillRes = await axios.get(LATEST_SKILL_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // status=1 means Available, status=0 means Busy/Active Study
      if (mySkillRes.data.exists && mySkillRes.data.status === 0) {
        Swal.fire(
          "Active Study ⚠️",
          "You are already in an active study. Please complete it first.",
          "warning"
        );
        return;
      }

      // 3. Check partner's latest skill status (from fetched student data)
      // If status=0, they are busy. If status=1, they are available.
      if (student.latest_skill_status === 0) {
        Swal.fire(
          "Partner Busy ⚠️",
          "This student is already in an active study.",
          "warning"
        );
        return;
      }

      if (student.latest_skill_status === null || student.latest_skill_status === undefined) {
        Swal.fire(
          "No Skills ⚠️",
          "This student has not posted any skills to connect with.",
          "warning"
        );
        return;
      }

      // 4. Create Study
      const createRes = await axios.post(
        CREATE_STUDY_API,
        { student2_id: student_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const study_id = createRes.data.study_id;

      // 5. Go Form
      navigate("/dashboard/form", {
        state: { study_id },
      });
    } catch (err) {
      Swal.fire(
        "Error ❌",
        err.response?.data?.error || "Something went wrong",
        "error"
      );
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!student) return <p>Student not found ❌</p>;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="dashboard-overview animate-slide-up" style={{ maxWidth: '850px', margin: '0 auto', background: 'transparent', border: 'none', boxShadow: 'none' }}>
        {/* Header Profile */}
        <div className="profile-header" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
          padding: '25px 30px',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 10px 30px -10px rgba(30, 58, 138, 0.3)'
        }}>
          <div className="profile-avatar" style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            color: '#1E3A8A',
            overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            {student.picture ? (
              <img src={student.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              student.username[0].toUpperCase()
            )}
          </div>

          <div className="profile-details">
            <h2 style={{ margin: 0, fontSize: '1.9rem', fontWeight: '800', color: 'white' }}>{student.username}</h2>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>Year {student.year}</span>
              <span>{student.department}</span>
            </p>
          </div>
        </div>

        {/* Content Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div className="connect-section-card" style={{
            background: 'white',
            padding: '15px 25px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ color: '#1E3A8A', marginBottom: '8px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ℹ️ About
            </h3>
            <p style={{ lineHeight: 1.6, color: '#475569', fontSize: '0.95rem', margin: 0 }}>{student.about_me || "No information added."}</p>
          </div>

          <div className="connect-section-card" style={{
            background: 'white',
            padding: '15px 25px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ color: '#1E3A8A', marginBottom: '8px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚡ Skills
            </h3>
            <p style={{ lineHeight: 1.6, color: '#475569', fontSize: '0.95rem', margin: 0 }}>{student.skills || "No skills added."}</p>
          </div>

          <div className="connect-section-card" style={{
            background: 'white',
            padding: '15px 25px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ color: '#172554', marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} /> Accomplishments & Certificates
            </h3>
            {(() => {
              const imageCerts = student.certificates?.filter(cert =>
                cert.file && cert.file.match(/\.(jpeg|jpg|gif|png|webp)$/i)
              ) || [];

              return imageCerts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                  {imageCerts.map((cert) => (
                    <div key={cert.id} style={{
                      background: 'white',
                      padding: '10px',
                      borderRadius: '15px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} className="student-cert-card">
                      <div style={{
                        width: '100%',
                        height: '140px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #dbeafe',
                        position: 'relative'
                      }} className="cert-image-container">
                        <img src={cert.file} alt="Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="cert-literal-img" />
                      </div>

                      <div style={{ padding: '0 5px 5px' }}>
                        <a
                          href={cert.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '8px',
                            borderRadius: '10px',
                            background: '#1E3A8A',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            transition: 'all 0.3s ease'
                          }}
                          className="view-cert-btn"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem', margin: 0 }}>
                  No certificates and accomplishment shared yet.
                </p>
              );
            })()}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ textAlign: "center", marginTop: 25 }}>
          <button
            className="btn btn-primary"
            onClick={handleStart}
            style={{
              padding: '12px 40px',
              fontSize: '1.1rem',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
              boxShadow: '0 8px 15px -5px rgba(37, 99, 235, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 25px -5px rgba(37, 99, 235, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 15px -5px rgba(37, 99, 235, 0.3)';
            }}
          >
            Start Connection 🚀
          </button>
        </div>

      </div >
    </div >
  );
}

export default Connect;
