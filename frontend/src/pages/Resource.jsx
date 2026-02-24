import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Folder, Upload, Eye, FileText, Download, Search, AlertCircle } from "lucide-react";
import "../css/resource.css";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function Resources() {
  const token = localStorage.getItem("token");
  const { setData } = useOutletContext();

  // =========================
  // MARK AS VIEWED
  // =========================
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await axios.post(`${BASE_URL}/notifications/mark-viewed/`,
          { section: "resources" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (setData) {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              notifications: {
                ...prev.notifications,
                resources: 0
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to mark resources as viewed", err);
      }
    };
    markAsViewed();
  }, [token, setData]);

  const [mode, setMode] = useState(null); // upload | view
  const [studyId, setStudyId] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CHECK ACTIVE STUDY (UPLOAD ONLY)
  // =========================
  const checkActiveStudy = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/resources/active-study/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.exists) {
        Swal.fire({
          icon: "warning",
          title: "No Active Study ❌",
          text: "Resources can only be uploaded during an active study connection.",
          confirmButtonColor: "#2563eb"
        });
        return null;
      }

      return res.data.study_id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const LATEST_SKILL_API = "http://127.0.0.1:8000/api/student-skill/latest/";

  // =========================
  // UPLOAD
  // =========================
  const handleUploadClick = async () => {
    // 1. Check for active study (existing logic)
    const id = await checkActiveStudy();
    if (!id) return;

    // 2. Check strict StudentSkill status = 0 (User Request)
    try {
      const skillRes = await axios.get(LATEST_SKILL_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!skillRes.data.exists || skillRes.data.status !== 0) {
        Swal.fire({
          icon: "warning",
          title: "Action Restricted ⚠️",
          text: "Resources can only be uploaded when your status is Active (0).",
          confirmButtonColor: "#f59e0b"
        });
        return;
      }

      setStudyId(id);
      setMode("upload");

    } catch (err) {
      console.error("Skill check failed", err);
      // Optional: allow proceed or block? safest is to block or just alert.
      // We'll block to be safe as per requirement.
      Swal.fire("Error ❌", "Could not verify account status.", "error");
    }
  };

  const uploadResource = async () => {
    if (!file) {
      Swal.fire("Missing File ❌", "Please select a file to upload", "warning");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("study_id", studyId);
    formData.append("file", file);
    formData.append("title", title); // Include title

    try {
      await axios.post(`${BASE_URL}/resources/upload/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Uploaded ✅",
        text: "Resource shared with your study partner.",
        timer: 2000,
        showConfirmButton: false
      });
      setFile(null);
      setTitle(""); // Reset title
      setMode(null);
    } catch (err) {
      Swal.fire("Error ❌", "Failed to upload resource", "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VIEW ALL RESOURCES
  // =========================
  const handleViewClick = async () => {
    setMode("view");
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/resources/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPartners(res.data.partners || []);
    } catch {
      Swal.fire("Error ❌", "Unable to load resources", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.partner_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="resources-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#172554', margin: 0, fontSize: '1.8rem' }}>📚 Resource Library</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0' }}>Manage and share study materials with your partners</p>
        </div>
      </div>

      <div className="resource-layout">
        {/* Main Content Area */}
        <div className="resource-main">
          <div className="resource-actions" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <button
              onClick={handleUploadClick}
              style={{
                background: mode === 'upload' ? '#172554' : '#1E3A8A',
                color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
                transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
              }}
            >
              <Upload size={18} /> Upload Resource
            </button>
            <button
              onClick={handleViewClick}
              style={{
                background: mode === 'view' ? '#172554' : 'white',
                color: mode === 'view' ? 'white' : '#1E3A8A',
                border: '1px solid #1E3A8A', padding: '12px 24px', borderRadius: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              <Eye size={18} /> View Resources
            </button>
          </div>

          {/* UPLOAD BOX */}
          {mode === "upload" && (
            <div className="overview-card animate-slide-up" style={{ maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload color="#1E3A8A" /> Share New Material
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                Your file will be visible to your current active study partner.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b', fontWeight: 'bold', marginBottom: '5px' }}>
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 5 Notes, Exam Schedule..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                    outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{
                border: '2px dashed #e2e8f0', padding: '40px', borderRadius: '12px',
                textAlign: 'left', marginBottom: '20px', background: '#f8fafc'
              }}>
                <input
                  type="file"
                  id="resource-file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor="resource-file" style={{ cursor: 'pointer' }}>
                  <div style={{ background: '#f1f5f9', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 15px 0' }}>
                    <Folder color="#1E3A8A" size={30} />
                  </div>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {file ? file.name : "Click to select a file"}
                  </span>
                  <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Images, Videos, Audio, PPT, Docs, or Text
                  </p>
                </label>
              </div>

              <button
                disabled={loading}
                onClick={uploadResource}
                style={{
                  width: '100%', padding: '12px', background: '#3B82F6', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Uploading..." : "Save and Share"}
              </button>
            </div>
          )}

          {/* VIEW BOX */}
          {mode === "view" && (
            <div className="animate-slide-up">
              <div style={{ marginBottom: '25px', position: 'relative', maxWidth: '500px' }}>
                <Search size={18} style={{ position: 'absolute', top: '12px', left: '15px', color: '#94a3b8', opacity: 0.7 }} />
                <input
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 45px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    background: 'white'
                  }}
                  placeholder="Search resources by partner name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1E3A8A';
                    e.target.style.boxShadow = '0 0 0 4px rgba(30, 58, 138, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'left', padding: '50px 0' }}>Loading resources...</div>
              ) : filteredPartners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                  <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '15px' }} />
                  <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>No resources found matching your search.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {filteredPartners.map((p, idx) => (
                    <div key={idx} className="overview-card" style={{ height: 'fit-content' }}>
                      <h4 style={{ margin: '0 0 15px', color: '#172554', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '8px' }}>👤</div>
                        {p.partner_name}
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.values(p.resources.reduce((acc, r) => ({ ...acc, [r.file_url]: r }), {})).map((r, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FileText size={18} color="#64748b" />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '600', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.title || r.file_name}
                                </span>
                                {r.title && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.file_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <a
                              href={r.file_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none',
                                color: '#1E3A8A', fontSize: '0.85rem', fontWeight: '600',
                                background: 'white', padding: '6px 12px', borderRadius: '6px',
                                border: '1px solid #dbeafe', transition: 'all 0.2s'
                              }}
                            >
                              <Download size={14} /> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === null && (
            <div style={{
              textAlign: 'left', padding: '80px 40px', background: 'white',
              borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
            }}>
              <div style={{ background: '#f0f7ff', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 25px 0' }}>
                <Folder color="#1E3A8A" size={40} />
              </div>
              <h3 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Welcome to your Resource Hub</h3>
              <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 0 32px 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
                A centralized space to trade knowledge. Upload materials for your current partner or browse shared documents from previous studies.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleUploadClick} style={{ background: '#1E3A8A', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>Get Started</button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Area */}
        <div className="resource-sidebar">
          {/* Stats Card */}
          <div className="sidebar-card animate-slide-up">
            <h4>📈 Library Stats</h4>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-label">Shared Files</span>
                <span className="stat-value">{partners.reduce((acc, p) => acc + p.resources.length, 0)}</span>
              </div>
              <div className="stat-item" style={{ border: 'none' }}>
                <span className="stat-label">Active Connections</span>
                <span className="stat-value">{partners.length}</span>
              </div>
            </div>
          </div>


          {/* Categories Card */}
          <div className="sidebar-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h4>🏷️ Categories</h4>
            <div className="category-pills">
              {['Notes', 'Exams', 'Slides', 'Videos', 'Codes', 'PDFs', 'Images'].map((cat, i) => (
                <span key={i} className="category-pill">{cat}</span>
              ))}
            </div>
          </div>

          {/* Quick Help */}
          <div className="sidebar-card animate-slide-up" style={{ border: 'none', background: 'linear-gradient(135deg, #1E3A8A 0%, #1a3266 100%)', animationDelay: '0.3s' }}>
            <h4 style={{ color: 'white' }}>💡 Pro Tip</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.5' }}>
              Add descriptive titles to your files so your study partners can easily find them later!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
