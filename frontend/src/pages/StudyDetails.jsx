import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../css/studyDetails.css";

const BASE_URL = "http://127.0.0.1:8000/api";
const showValue = (v) => (v ? v : "NULL");

import { Search, Calendar, User, Award, List } from "lucide-react";

export default function StudyDetails() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [tab, setTab] = useState("current");
  const [currentStudy, setCurrentStudy] = useState(null);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  const [editingEndDate, setEditingEndDate] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");

  const loadCurrentStudy = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/student-dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentStudy(res.data.active_study || null);
    } catch {
      setCurrentStudy(null);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/study/my-studies/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadCurrentStudy();
    loadHistory();
  }, []);

  const saveEndDate = async () => {
    if (!newEndDate) {
      Swal.fire("Required ❌", "Please select a date", "warning");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/study/update-enddate/${currentStudy.study_id}/`,
        { end_date: newEndDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Updated ✅", "End date updated", "success");
      setEditingEndDate(false);
      loadCurrentStudy();
    } catch {
      Swal.fire("Error ❌", "Failed to update end date", "error");
    }
  };

  return (
    <div className="study-details-container animate-fade-in">
      <h2>Study Journey 📘</h2>

      <div className="study-tabs">
        <button
          className={tab === "current" ? "active" : ""}
          onClick={() => setTab("current")}
        >
          <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Current Study
        </button>

        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          <List size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Study History
        </button>
      </div>

      {tab === "current" && (
        <div className="animate-slide-up">
          {loadingCurrent ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading study details...</p>
          ) : currentStudy ? (
            <div className="study-card">
              <p>
                <span><User size={18} style={{ color: '#1E3A8A', marginRight: '10px' }} /> <b>Partner:</b></span>
                <span>{currentStudy.partner}</span>
              </p>
              <p>
                <span><Award size={18} style={{ color: '#f59e0b', marginRight: '10px' }} /> <b>Offer:</b></span>
                <span>{showValue(currentStudy.offer)}</span>
              </p>
              <p>
                <span><Search size={18} style={{ color: '#3B82F6', marginRight: '10px' }} /> <b>Want:</b></span>
                <span>{showValue(currentStudy.want)}</span>
              </p>
              <p>
                <span><b>Level:</b></span>
                <span className={`status-badge progress`}>{showValue(currentStudy.level)}</span>
              </p>
              <p>
                <span><b>Status:</b></span>
                <span className={`status-badge ${currentStudy.status.toLowerCase()}`}>{currentStudy.status}</span>
              </p>

              <p>
                <span><b>Teacher / Mentor:</b></span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {currentStudy.teacher_name || "Not Assigned"}
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate("/dashboard/search-teacher", {
                        state: {
                          study_id: currentStudy.study_id,
                          from: "/dashboard/study-details"
                        },
                      })
                    }
                  >
                    ✏️ Change
                  </button>
                </span>
              </p>

              <p>
                <span><Calendar size={18} style={{ color: '#172554', marginRight: '10px' }} /> <b>End Date:</b></span>
                {!editingEndDate ? (
                  <span>
                    {currentStudy.end_date}
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingEndDate(true);
                        setNewEndDate(currentStudy.end_date);
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </span>
                ) : (
                  <span style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      style={{ padding: '5px', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                    />
                    <button className="save-btn" onClick={saveEndDate}>
                      Save ✅
                    </button>
                  </span>
                )}
              </p>

              <p>
                <span><b>Start Date:</b></span>
                <span>{currentStudy.start_date}</span>
              </p>
            </div>
          ) : (
            <div className="study-card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
              <h3 style={{ color: '#172554' }}>No active study found</h3>
              <p style={{ border: 'none', justifyContent: 'center', color: '#64748b' }}>Connect with someone to start your journey!</p>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="animate-slide-up">
          <input
            className="search-box"
            placeholder="Search history by partner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {history.length === 0 ? (
            <div className="study-card" style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ border: 'none', justifyContent: 'center' }}>No study history found ❌</p>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Offer</th>
                    <th>Want</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Teacher</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .filter(h =>
                      h.partner_name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(h => (
                      <tr key={h.study_id}>
                        <td style={{ fontWeight: '600', color: '#1e293b' }}>{h.partner_name}</td>
                        <td>{showValue(h.offer)}</td>
                        <td>{showValue(h.want)}</td>
                        <td>{showValue(h.level)}</td>
                        <td>
                          <span className={`status-badge ${h.status.toLowerCase()}`}>
                            {h.status}
                          </span>
                        </td>
                        <td>{h.teacher_name || "—"}</td>
                        <td>{h.start_date}</td>
                        <td>{h.end_date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

