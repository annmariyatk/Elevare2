import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useOutletContext } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000/api";

function Assessment() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { setData } = useOutletContext();

  // =========================
  // MARK AS VIEWED
  // =========================
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await axios.post(`${BASE_URL}/notifications/mark-viewed/`,
          { section: "assessment" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update parent state to clear badge immediately
        if (setData) {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              notifications: {
                ...prev.notifications,
                assessment: 0
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to mark assessment as viewed", err);
      }
    };
    markAsViewed();
  }, [token, setData]);

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  const [studyId, setStudyId] = useState(null);
  const [level, setLevel] = useState("");
  const [partnerName, setPartnerName] = useState("");

  // Assessment fields
  const [projectTitle, setProjectTitle] = useState("");
  const [assessmentWork, setAssessmentWork] = useState("");
  const [assessmentFile, setAssessmentFile] = useState(null);
  const [confirmSigned, setConfirmSigned] = useState(false);

  // Rating
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // =========================
  // FETCH ASSESSMENT STATUS (AJAX REFRESH)
  // =========================
  const fetchAssessmentStatus = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/assessment/status/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.eligible) {
        setEligible(true);
        setStudyId(res.data.study_id);
        setLevel(res.data.my_level);
        setPartnerName(res.data.partner_name);

        // 🔄 Reset form for next assessment
        setProjectTitle("");
        setAssessmentWork("");
        setAssessmentFile(null);
        setRating(0);
        setHoverRating(0);
      } else {
        Swal.fire("Info", res.data.message, "info").then(() =>
          navigate("/dashboard")
        );
      }
    } catch {
      Swal.fire("Error ❌", "Unable to load assessment", "error").then(() =>
        navigate("/dashboard")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchAssessmentStatus();
    // eslint-disable-next-line
  }, []);

  // =========================
  // SAVE RATING
  // =========================
  const saveRating = async () => {
    if (!rating) {
      Swal.fire("Required ⭐", "Please select rating", "warning");
      return false;
    }

    await axios.post(
      `${BASE_URL}/rating/save/`,
      { study_id: studyId, rating_value: rating },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  };

  // =========================
  // SUBMIT ASSESSMENT
  // =========================
  const submitAssessment = async () => {
    // Validate only for Medium / Hard
    if (level === "Medium" || level === "Hard") {
      if (!projectTitle || !assessmentWork || !assessmentFile) {
        Swal.fire(
          "Missing Fields ❌",
          "Please complete all assessment fields (Title, Work, and Assessment File)",
          "warning"
        );
        return false;
      }
    }

    const formData = new FormData();
    formData.append("study_id", studyId);

    if (projectTitle) formData.append("project_title", projectTitle);
    if (assessmentWork) formData.append("assessment_work", assessmentWork);
    if (assessmentFile) formData.append("assessment_file", assessmentFile);

    await axios.post(`${BASE_URL}/assessment/submit/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return true;
  };

  // =========================
  // SUBMIT ALL
  // =========================
  const handleSubmitAll = async () => {
    if ((level === "Medium" || level === "Hard") && !confirmSigned) {
      Swal.fire("Confirmation Required ❌", "Please confirm that the document is signed by your department.", "warning");
      return;
    }
    try {
      const ratingOk = await saveRating();
      if (!ratingOk) return;

      const assessmentOk = await submitAssessment();
      if (!assessmentOk) return;

      Swal.fire(
        "Completed ✅",
        "Assessment submitted successfully",
        "success"
      ).then(() => {
        fetchAssessmentStatus(); // 🔥 LOAD NEXT ASSESSMENT
      });
    } catch {
      Swal.fire("Error ❌", "Something went wrong", "error");
    }
  };

  // =========================
  // STAR COMPONENT
  // =========================
  const Star = ({ index }) => {
    const filled = hoverRating >= index || rating >= index;
    return (
      <span
        style={{
          fontSize: "32px",
          cursor: "pointer",
          color: filled ? "#f5b301" : "#aaa",
        }}
        onMouseEnter={() => setHoverRating(index)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(index)}
      >
        {filled ? "★" : "☆"}
      </span>
    );
  };

  if (loading) return <h3>Loading...</h3>;
  if (!eligible) return null;

  const isMediumHard = (["Medium", "Hard"].includes(level) || ["medium", "hard"].includes(level));
  const canSubmit = rating && (!isMediumHard || confirmSigned);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-overview animate-slide-up" style={{
        width: '100%',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "40px", color: '#1e3a8a', fontSize: '2rem', fontWeight: '800' }}>Assessment Submission 📝</h2>

        {isMediumHard && (
          <div style={{ background: "#E5F0FA", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "40px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h4 style={{ margin: 0, color: '#334155', fontSize: '1.2rem' }}>Project Details</h4>
              <a
                href="/ELAVRE_Skill_Completion_Verification_Form.docx"
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#1e3a8a',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1e40af')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#1e3a8a')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Form ⬇️
              </a>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Project Title</label>
              <input
                type="text"
                className="form-input"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title..."
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Assessment Work (Link/Description)</label>
              <input
                type="text"
                className="form-input"
                value={assessmentWork}
                onChange={(e) => setAssessmentWork(e.target.value)}
                placeholder="Git link or short description..."
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem" }}
              />
            </div>



            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Assessment File (Project ZIP/Document)</label>
              <input
                type="file"
                style={{ width: "100%", padding: "12px", background: "white", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                onChange={(e) => setAssessmentFile(e.target.files[0])}
              />
            </div>

            {/* ✅ Discipline Checkbox - Robust Implementation */}
            <label style={{
              marginTop: '25px',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid #F87171',
              background: '#FEF2F2',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                id="disciplineCheck"
                checked={confirmSigned}
                onChange={(e) => setConfirmSigned(e.target.checked)}
                style={{
                  appearance: 'auto',
                  WebkitAppearance: 'checkbox',
                  width: '24px',
                  height: '24px',
                  minWidth: '24px',
                  minHeight: '24px',
                  cursor: 'pointer',
                  accentColor: '#DC2626',
                  marginTop: '0',
                  border: '2px solid #DC2626'
                }}
              />
              <span
                style={{
                  fontSize: '0.9rem',
                  color: '#991B1B',
                  lineHeight: '1.5',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flex: 1
                }}
              >
                <b>I confirm that this form is signed by department.</b> Uploading false document will lead to disciplinary action.
              </span>
            </label>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: '15px', color: '#1e3a8a', fontSize: '1.5rem' }}>Rate Your Partner ⭐</h3>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem', color: '#64748b' }}>
            How was your experience learning with <b>{partnerName}</b>?
          </p>

          <div style={{ marginBottom: "40px", display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ transition: 'transform 0.2s', display: 'inline-block' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <Star index={i} />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitAll}
            disabled={!canSubmit}
            className="btn btn-primary"
            style={{
              padding: "18px 50px",
              fontSize: "1.2rem",
              opacity: canSubmit ? 1 : 0.6,
              cursor: canSubmit ? "pointer" : "not-allowed",
              borderRadius: '50px',
              width: '100%',
              boxShadow: canSubmit ? '0 10px 20px -5px rgba(37, 99, 235, 0.4)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            Save & Submit Assessment ✅
          </button>
        </div>
      </div>
    </div >
  );
}

export default Assessment;
