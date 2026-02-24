import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../css/shareSkill.css";

const BASE_URL = "http://127.0.0.1:8000/api";

function ShareSkill() {
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
          { section: "skillshare" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (setData) {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              notifications: {
                ...prev.notifications,
                skillshare: 0
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to mark skillshare as viewed", err);
      }
    };
    markAsViewed();
  }, [token, setData]);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const endRef = useRef(null);

  const loadPosts = async () => {
    const res = await axios.get(`${BASE_URL}/share-skill/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  // =========================
  // Template Composer State
  // =========================
  const [selectedType, setSelectedType] = useState(null); // 'exchange', 'give', 'request'
  const [skillA, setSkillA] = useState("");
  const [skillB, setSkillB] = useState("");
  const [description, setDescription] = useState("");

  const handlePost = async () => {
    let finalMessage = "";

    if (selectedType === 'exchange') {
      if (!skillA.trim() || !skillB.trim()) return alert("Please fill both skills.");
      finalMessage = `I offer: ${skillA.trim()} | I want: ${skillB.trim()}. ${description ? `(${description})` : ''} Please connect with me!`;
    } else if (selectedType === 'give') {
      if (!skillA.trim()) return alert("Please fill the skill you offer.");
      finalMessage = `I offer: ${skillA.trim()} | I don't want anything in return. ${description ? `(${description})` : ''} Feel free to connect if you need help!`;
    } else if (selectedType === 'request') {
      if (!skillA.trim()) return alert("Please fill the skill you want.");
      finalMessage = `I want: ${skillA.trim()} | I have nothing to offer. ${description ? `(${description})` : ''} If you're interested, please connect!`;
    } else {
      return alert("Please select a message type.");
    }

    await axios.post(
      `${BASE_URL}/share-skill/post/`,
      { message: finalMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSkillA("");
    setSkillB("");
    setDescription("");
    setSelectedType(null);
    loadPosts();
  };

  return (
    <div className="share-skill-container animate-fade-in">
      {/* Decorative background elements */}
      <div className="decor-dot" style={{ top: '10%', left: '5%', width: '150px', height: '150px', background: 'rgba(30, 58, 138, 0.03)', borderRadius: '50%', position: 'absolute', pointerEvents: 'none' }}></div>
      <div className="decor-dot" style={{ bottom: '20%', right: '10%', width: '200px', height: '200px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '50%', position: 'absolute', pointerEvents: 'none' }}></div>

      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <h2>Share Skill Room 📣</h2>
            <span className="subtitle">Connect with fellow students and trade knowledge</span>
          </div>
          <div className="online-status-badge">
            <div className="status-dot"></div>
            Online
          </div>
        </div>

        {/* Warning Notice */}
        <div className="warning-notice">
          <span>📢</span>
          <span>Please use the templates below to maintain a professional skill-sharing environment.</span>
        </div>

        {/* Chat Box */}
        <div className="chat-box">
          {posts.map((p) => {
            const isMe = p.student.username === localStorage.getItem("username");
            return (
              <div className={`msg-row animate-slide-up ${isMe ? 'is-me' : ''}`} key={p.post_id}>
                {/* PROFILE */}
                <div className={`msg-avatar ${isMe ? 'is-me' : ''}`}>
                  {p.student.profile ? (
                    <img src={p.student.profile} alt="profile" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isMe ? 'white' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>

                {/* MESSAGE */}
                <div className={`msg-content ${isMe ? 'is-me' : ''}`}>
                  <div className="msg-username">{p.student.username}</div>
                  <div className={`msg-bubble ${isMe ? 'is-me' : ''}`}>
                    {p.message}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">
                      {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {!isMe && p.student.latest_skill_status === 1 && (
                      <button
                        className="connect-btn"
                        onClick={() => navigate("/dashboard/connect", { state: { student_id: p.student.student_id } })}
                      >
                        Connect 🚀
                      </button>
                    )}
                    {!isMe && p.student.latest_skill_status === 0 && (
                      <span className="busy-status">Busy ⏳</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>

        {/* NEW COMPOSER UI */}
        <div className="composer">
          {!selectedType ? (
            <div className="composer-selector">
              <p className="composer-header">What would you like to share?</p>
              <div className="template-buttons">
                <button className="template-btn" onClick={() => setSelectedType('exchange')}>✨ Skill Exchange</button>
                <button className="template-btn" onClick={() => setSelectedType('give')}>🤝 Offer Help</button>
                <button className="template-btn" onClick={() => setSelectedType('request')}>🙋‍♂️ Need Help</button>
              </div>
            </div>
          ) : (
            <div className="composer-form animate-fade-in">
              <div className="composer-form-header">
                <span className="composer-form-title">
                  {selectedType === 'exchange' && "🔄 Skill Exchange"}
                  {selectedType === 'give' && "🎁 Giving Help"}
                  {selectedType === 'request' && "❓ Requesting Help"}
                </span>
                <button className="change-type-btn" onClick={() => setSelectedType(null)}>Change Type ✕</button>
              </div>

              <div className="composer-inputs">
                {selectedType === 'exchange' && (
                  <>
                    <input className="composer-input" value={skillA} onChange={e => setSkillA(e.target.value)} placeholder="Skill I offer..." />
                    <span className="input-separator">for</span>
                    <input className="composer-input" value={skillB} onChange={e => setSkillB(e.target.value)} placeholder="Skill I want..." />
                  </>
                )}
                {selectedType === 'give' && (
                  <input className="composer-input flex-1" value={skillA} onChange={e => setSkillA(e.target.value)} placeholder="Skill I can teach..." />
                )}
                {selectedType === 'request' && (
                  <input className="composer-input flex-1" value={skillA} onChange={e => setSkillA(e.target.value)} placeholder="Skill I want to learn..." />
                )}

                <input
                  className="composer-input flex-1"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional description (e.g. time, level)..."
                />

                <button
                  className="send-btn"
                  onClick={handlePost}
                  disabled={!skillA.trim() || (selectedType === 'exchange' && !skillB.trim())}
                >
                  Send ➤
                </button>
              </div>

              {/* Preview */}
              <div className="message-preview">
                Preview: {
                  selectedType === 'exchange' ? `I offer: ${skillA || '...'} | I want: ${skillB || '...'}. ${description ? `(${description})` : ''} Please connect with me!` :
                    selectedType === 'give' ? `I offer: ${skillA || '...'} | I don't want anything in return. ${description ? `(${description})` : ''} Feel free to connect if you need help!` :
                      `I want: ${skillA || '...'} | I have nothing to offer. ${description ? `(${description})` : ''} If you're interested, please connect!`
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareSkill;
