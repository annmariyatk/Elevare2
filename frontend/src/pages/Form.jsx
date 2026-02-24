import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/form.css";

function Form() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { study_id } = location.state || {};

  // =========================
  // Skill States
  // =========================
  const [offerType, setOfferType] = useState("none");
  const [offerOther, setOfferOther] = useState("");

  const [wantType, setWantType] = useState("none");
  const [wantOther, setWantOther] = useState("");

  const [level, setLevel] = useState("Basic");

  // =========================
  // Other States
  // =========================
  const [endDate, setEndDate] = useState("");
  const [validationFile, setValidationFile] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [mentorLocked, setMentorLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // Guard
  // =========================
  if (!study_id) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h2>Invalid Access ❌</h2>
          <button onClick={() => navigate("/dashboard")}>Back</button>
        </div>
      </div>
    );
  }

  const needValidation = wantType === "other";

  // =========================
  // CHECK TEACHER STATUS
  // =========================
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/study/get-selected-teacher/${study_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.teacher) {
          setSelectedTeacher(res.data.teacher);
          setMentorLocked(true); // disable
        } else {
          setSelectedTeacher(null);
          setMentorLocked(false); // enable
        }
      })
      .catch(() => {
        setMentorLocked(false);
      });
  }, [study_id, token]);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (!endDate) return alert("Please select End Date ❌");
    if (needValidation && !validationFile)
      return alert("Validation form required ❌");

    const payload = {
      offer:
        offerType === "other" && offerOther.trim()
          ? offerOther.trim()
          : null,
      want:
        wantType === "other" && wantOther.trim()
          ? wantOther.trim()
          : null,
      level,
    };

    if (!payload.offer && !payload.want) {
      return alert("Please provide at least one skill (Offer or Want) before submitting ❌");
    }

    try {
      setLoading(true);

      // Save Skill
      await axios.post(
        "http://127.0.0.1:8000/api/student-skill/",
        { ...payload, study_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update End Date
      await axios.post(
        `http://127.0.0.1:8000/api/study/update-enddate/${study_id}/`,
        { end_date: endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create Assessment
      if (payload.offer || payload.want) {
        await axios.post(
          "http://127.0.0.1:8000/api/assessment/create-for-both/",
          { study_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Upload Validation
      if (needValidation && validationFile) {
        const fd = new FormData();
        fd.append("validation_form_file", validationFile);
        fd.append("study_id", study_id);
        await axios.post(
          "http://127.0.0.1:8000/api/assessment/upload-validation-form/",
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Study setup completed ✅");
      navigate("/dashboard"); // Redirect to dashboard home as requested
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      minHeight: '80vh'
    }}>
      <div className="dashboard-overview animate-slide-up" style={{
        maxWidth: '750px',
        width: '100%',
        margin: '0',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        background: 'white'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#1F3E5A', fontSize: '2rem', fontWeight: '800' }}>Study Setup Form 📝</h2>

        {/* ===== MENTOR ===== */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '10px', display: 'block' }}>Mentor Status</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <Link
              to="/dashboard/search-teacher"
              state={{ study_id }}
              className={`btn ${mentorLocked ? 'btn-complete' : 'btn-primary'}`}
              style={{
                pointerEvents: mentorLocked ? "none" : "auto",
                opacity: mentorLocked ? 0.8 : 1,
                textDecoration: 'none',
                fontSize: '1rem',
                padding: '12px 24px',
                borderRadius: '50px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {mentorLocked ? "Mentor Selected ✓" : "Search Mentor 🔍"}
            </Link>
            {mentorLocked && <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>Locked 🔒</span>}
          </div>
          {selectedTeacher && (
            <div style={{ marginTop: '15px', padding: '15px 20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', color: '#0369a1' }}>
              Selected Mentor: <b style={{ fontSize: '1.1rem' }}>{selectedTeacher.name}</b>
            </div>
          )}
        </div>

        <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #C4D9EB' }} />

        {/* OFFER */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Skill I Offer</label>
          <div className="radio-group" style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
            {['none', 'other'].map(type => (
              <label key={type} style={{
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '50px',
                border: offerType === type ? '2px solid #2563eb' : '2px solid #e2e8f0',
                background: offerType === type ? '#f1f5f9' : 'white',
                color: offerType === type ? '#2563eb' : '#64748b',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  checked={offerType === type}
                  onChange={() => setOfferType(type)}
                  style={{ display: 'none' }}
                />
                {type === 'none' ? 'None' : 'Other (Custom)'}
              </label>
            ))}
          </div>
          {offerType === "other" && (
            <div className="animate-fade-in" style={{ marginTop: '10px' }}>
              <input
                className="form-input"
                placeholder="Enter skill you offer..."
                value={offerOther}
                onChange={(e) => setOfferOther(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          )}
        </div>

        {/* WANT */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Skill I Want</label>
          <div className="radio-group" style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
            {['none', 'other'].map(type => (
              <label key={type} style={{
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '50px',
                border: wantType === type ? '2px solid #2563eb' : '2px solid #e2e8f0',
                background: wantType === type ? '#f1f5f9' : 'white',
                color: wantType === type ? '#2563eb' : '#64748b',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  checked={wantType === type}
                  onChange={() => setWantType(type)}
                  style={{ display: 'none' }}
                />
                {type === 'none' ? 'None' : 'Other (Custom)'}
              </label>
            ))}
          </div>
          {wantType === "none" && (
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px', fontStyle: 'italic' }}>
              ℹ️ No assessment will be required for you since you are not learning a new skill.
            </p>
          )}
          {wantType === "other" && (
            <div className="animate-fade-in" style={{ marginTop: '10px' }}>
              <input
                className="form-input"
                placeholder="Enter skill you want..."
                value={wantOther}
                onChange={(e) => setWantOther(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          )}
        </div>

        {/* LEVEL */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Level</label>
          <div style={{ position: 'relative' }}>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', appearance: 'none', background: 'white' }}
            >
              <option value="Basic">Basic</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>▼</span>
          </div>
        </div>

        {/* END DATE */}
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '8px', display: 'block' }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', fontFamily: 'inherit' }}
          />
        </div>

        {/* VALIDATION */}
        {needValidation && (
          <div className="animate-fade-in" style={{ marginTop: '30px', padding: '20px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fcd34d' }}>
            <p style={{ marginBottom: '15px', color: '#b45309', fontSize: '1rem' }}>
              <b>Validation Required:</b> You chose a custom skill. Please download the form, fill it, and upload it.
            </p>
            <a
              href="/ELAVRE_Skill_Validation_Form_Marian_College.docx"
              download
              style={{ color: '#336B91', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              Download Form ⬇️
            </a>
            <div style={{ marginTop: '15px' }}>
              <p style={{ marginBottom: '5px', color: '#b45309', fontSize: '0.9rem', fontWeight: '600' }}>
                Upload Validation Form
              </p>
              <input
                type="file"
                onChange={(e) => setValidationFile(e.target.files[0])}
                style={{ width: '100%', padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #fcd34d' }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '40px', fontSize: '1.2rem', padding: '16px', borderRadius: '50px', background: '#336B91', boxShadow: '0 10px 20px -5px rgba(51, 107, 145, 0.4)' }}
        >
          {loading ? "Submitting..." : "Save & Complete Setup ✅"}
        </button>
      </div>
    </div>
  );
}

export default Form;
