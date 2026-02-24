import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/chat.css";

const API_BASE = "http://127.0.0.1:8000/api/chat/";

function Chat() {
  const navigate = useNavigate();
  const { study_id } = useParams();
  const token = localStorage.getItem("token");
  const { setData } = useOutletContext();

  // =========================
  // MARK AS VIEWED
  // =========================
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await axios.post("http://127.0.0.1:8000/api/notifications/mark-viewed/",
          { section: "chat" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (setData) {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              notifications: {
                ...prev.notifications,
                chat: 0
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to mark chat as viewed", err);
      }
    };
    markAsViewed();
  }, [token, setData]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatClosed, setChatClosed] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  const bottomRef = useRef(null);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================
  // FETCH
  // =========================
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}${study_id}/messages/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.message && res.data.message !== "Success") {
        if (res.data.data?.length === 0 || !res.data.data) {
          setChatClosed(true);
          setCloseReason(res.data.message);
          return;
        }
      }

      setMessages(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      if (err.response?.data?.error) {
        setChatClosed(true);
        setCloseReason(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AUTO REFRESH
  // =========================
  useEffect(() => {
    if (!study_id) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [study_id]);

  // =========================
  // SEND
  // =========================
  const handleSend = async () => {
    if (!text.trim() || chatClosed) return;

    try {
      await axios.post(
        `${API_BASE}${study_id}/send/`,
        { message_text: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setText("");
      fetchMessages();
    } catch (err) {
      const msg = err.response?.data?.error || "Chat room is currently closed";
      Swal.fire("Chat Room Locked", msg, "info");
      setChatClosed(true);
      setCloseReason(msg);
    }
  };

  if (!study_id) {
    return <h2>Invalid Access ❌</h2>;
  }

  if (chatClosed) {
    return (
      <div className="dashboard-content" style={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: '500px',
          border: '1px solid #DBEAFE'
        }}>
          <p style={{
            fontSize: '1.25rem',
            color: '#1E3A8A',
            fontWeight: '600',
            lineHeight: '1.6',
            margin: 0
          }}>
            {closeReason || "You can chat only after connecting with a student."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content chat-full-window" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', padding: '10px 20px' }}>
      <div className="chat-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid #DBEAFE'
      }}>
        <div style={{ padding: '25px 30px', borderBottom: '1px solid #DBEAFE', background: '#F8FAFC', color: '#1E3A8A' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Study Chat Room 💬</h2>
          <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>Collaborate and grow with your study partner</p>
        </div>

        <div className="chat-box" style={{
          flex: 1,
          padding: '30px',
          overflowY: 'auto',
          background: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#1E3A8A' }}>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#1E3A8A' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👋</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No messages yet.</p>
              <p style={{ opacity: 0.7 }}>Start the conversation by typing below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = String(msg.sender_id) === String(localStorage.getItem("student_id"));
              return (
                <div key={msg.message_id} className="chat-message" style={{
                  maxWidth: '75%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)' : 'white',
                  color: isMe ? 'white' : '#172554',
                  padding: '14px 20px',
                  borderRadius: '18px',
                  borderBottomRightRadius: isMe ? '4px' : '18px',
                  borderBottomLeftRadius: isMe ? '18px' : '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  border: isMe ? 'none' : '1px solid #DBEAFE'
                }}>
                  {!isMe && <b style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: '#1E3A8A' }}>{msg.sender_name}</b>}
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.message_text}</p>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area" style={{ padding: '25px 30px', background: 'white', borderTop: '1px solid #DBEAFE', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={chatClosed}
            placeholder={chatClosed ? "Chat is closed" : "Type your message here..."}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '16px 25px',
              borderRadius: '50px',
              border: '2px solid #DBEAFE',
              outline: 'none',
              background: '#F8FAFC',
              fontSize: '1rem',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
            onBlur={(e) => e.target.style.borderColor = '#DBEAFE'}
          />
          <button
            onClick={handleSend}
            disabled={chatClosed || !text.trim()}
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 35px',
              borderRadius: '50px',
              fontWeight: '700',
              cursor: (chatClosed || !text.trim()) ? 'default' : 'pointer',
              opacity: (chatClosed || !text.trim()) ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.3s'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
