import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, User, Shield } from "lucide-react";
import "../css/account.css";

function StudentHelp() {
    const student_id = localStorage.getItem("student_id");
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/support/my-issues/${student_id}/`);
            setIssues(res.data.reverse()); // Show oldest first for chat flow? Or newest top? 
            // Chat usually oldest top. Let's reverse to show chronological order if we render as chat.
            setLoading(false);
            scrollToBottom();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newIssue.trim()) return;

        try {
            await axios.post("http://127.0.0.1:8000/api/support/create/", {
                student_id: student_id,
                issue: newIssue
            });
            setNewIssue("");
            fetchIssues();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="help-chat-container" style={{
            maxWidth: '800px', margin: '0 auto', background: 'white',
            borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', height: '600px'
        }}>
            <div className="chat-header" style={{
                padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
                borderRadius: '12px 12px 0 0'
            }}>
                <h3 style={{ margin: 0, color: '#172554' }}>Help & Support</h3>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                    Report an issue or ask a question. An admin will reply shortly.
                </p>
            </div>

            <div className="chat-messages" style={{
                flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
                {loading ? <p>Loading...</p> : issues.map((item) => (
                    <div key={item.issue_id} className="message-group">
                        {/* Student Message */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <div style={{
                                background: '#1E3A8A', color: 'white', padding: '12px 16px',
                                borderRadius: '12px 12px 0 12px', maxWidth: '70%',
                                boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)'
                            }}>
                                <div style={{ fontSize: '0.85rem', marginBottom: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    You
                                </div>
                                {item.issue}
                            </div>
                        </div>

                        {/* Admin Reply */}
                        {item.reply ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    background: '#f1f5f9', color: '#334155', padding: '12px 16px',
                                    borderRadius: '12px 12px 12px 0', maxWidth: '70%', border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#3B82F6', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                        <Shield size={12} style={{ marginRight: '4px' }} /> Support Team
                                    </div>
                                    {item.reply}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginRight: '5px' }}>
                                    Sent • Pending reply
                                </span>
                            </div>
                        )}
                    </div>
                ))}
                {issues.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                        No messages yet. Start the conversation!
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} style={{
                padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px'
            }}>
                <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="Type your issue here..."
                    style={{
                        flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={!newIssue.trim()}
                    style={{
                        background: '#1E3A8A', color: 'white', border: 'none', borderRadius: '8px',
                        padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

export default StudentHelp;
