import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Eye, Download, FileText, X } from "lucide-react";
import logo from "../assets/logo.png";

const BASE_URL = "http://127.0.0.1:8000/api";

function Certificate() {
  const token = localStorage.getItem("token");
  const { setData } = useOutletContext();

  // =========================
  // MARK AS VIEWED
  // =========================
  useEffect(() => {
    const markAsViewed = async () => {
      try {
        await axios.post(`${BASE_URL}/notifications/mark-viewed/`,
          { section: "certificates" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (setData) {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              notifications: {
                ...prev.notifications,
                certificates: 0
              }
            };
          });
        }
      } catch (err) {
        console.error("Failed to mark certificates as viewed", err);
      }
    };
    markAsViewed();
  }, [token, setData]);
  const [certificates, setCertificates] = useState([]);
  const [viewedCert, setViewedCert] = useState(null); // The certificate currently in the modal
  const certRef = useRef();

  // Load certificates
  useEffect(() => {
    axios
      .get(`${BASE_URL}/certificates/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCertificates(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  // Handle Download PDF
  const handleDownload = (cert) => {
    // We need to render the certificate off-screen or use the one in the modal if open.
    // If not open, we must open it temporarily or use a hidden container. 
    // For simplicity, we'll open the modal (if not open) then download.

    const elementToCheck = viewedCert?.certificate_id === cert.certificate_id ? certRef.current : null;

    if (elementToCheck) {
      // Already visible
      generatePDF(elementToCheck, cert);
    } else {
      // Use a hidden render approach? 
      // Better User Experience: Open the view mode, then download.
      setViewedCert(cert);
      setTimeout(() => {
        if (certRef.current) {
          generatePDF(certRef.current, cert);
        }
      }, 500); // Wait for modal animation/render
    }
  };

  const generatePDF = (element, cert) => {
    const opt = {
      margin: 0,
      filename: `Elevare_Certificate_${cert.skill}_${cert.student_name}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    const button = element.querySelector('.hide-on-print');
    if (button) button.style.display = 'none';

    html2pdf().set(opt).from(element).save().then(() => {
      if (button) button.style.display = 'block';
    });
  };

  return (
    <div className="certificate-page animate-fade-in" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "50px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#1e3a8a", marginBottom: "10px" }}>
          My Certificates 🎓
        </h2>
        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
          Verify and download your earned credentials.
        </p>
      </header>

      {/* Grid View */}
      {certificates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "20px" }}>
          <p style={{ color: "#94a3b8", fontSize: "1.2rem" }}>No certificates issued yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
          {certificates.map((cert) => (
            <div
              key={cert.certificate_id}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "25px",
                boxShadow: "0 10px 30px -5px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0",
                transition: "transform 0.3s, box-shadow 0.3s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 40px -5px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px -5px rgba(0,0,0,0.05)";
              }}
            >
              {/* PDF Icon */}
              <div style={{
                width: "70px",
                height: "70px",
                background: "#fee2e2",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                color: "#ef4444"
              }}>
                <FileText size={32} />
              </div>

              <h3 style={{ fontSize: "1.2rem", color: "#1e293b", fontWeight: "700", marginBottom: "5px" }}>
                {cert.skill || "Skill Certificate"}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "20px" }}>
                Level: {cert.level} • {new Date(cert.issued_date).toLocaleDateString()}
              </p>

              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button
                  onClick={() => setViewedCert(cert)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#1e293b",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                  onMouseLeave={(e) => e.target.style.background = "white"}
                >
                  <Eye size={18} /> View
                </button>
                <button
                  onClick={() => handleDownload(cert)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#1e3a8a",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#1e40af"}
                  onMouseLeave={(e) => e.target.style.background = "#1e3a8a"}
                >
                  <Download size={18} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      {viewedCert && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          {/* Modal Controls */}
          <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "15px" }}>
            <button
              onClick={() => handleDownload(viewedCert)}
              style={{ background: "white", padding: "12px 20px", borderRadius: "50px", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", gap: "8px", alignItems: "center" }}
            >
              <Download size={20} /> Download PDF
            </button>
            <button
              onClick={() => setViewedCert(null)}
              style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "50%", border: "none", cursor: "pointer", color: "white" }}
            >
              <X size={24} />
            </button>
          </div>

          {/* CERTIFICATE TEMPLATE TO RENDER */}
          <div
            ref={certRef}
            style={{
              width: "297mm",
              height: "210mm",
              background: "white",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "15px solid #1e3a8a",
              padding: "40px",
              boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
              transformOrigin: "center",
              // scale removed for full size
            }}
          >
            {/* Decorative Background Shapes */}
            <div style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              overflow: "hidden",
              zIndex: 0
            }}>
              <div style={{
                position: "absolute",
                top: "-200px", left: "-200px",
                width: "600px", height: "600px",
                background: "rgba(239, 246, 255, 0.8)", // Light blue
                borderRadius: "50%"
              }}></div>
              <div style={{
                position: "absolute",
                bottom: "-150px", right: "-100px",
                width: "500px", height: "500px",
                background: "rgba(239, 246, 255, 0.8)",
                borderRadius: "50%"
              }}></div>
            </div>

            {/* Content Layer */}
            <div style={{ zIndex: 1, textAlign: "center", width: "100%", position: "relative" }}>
              <div style={{ marginBottom: "10px", marginTop: "35px" }}> {/* Moved down (increased top margin) */}
                <img src={logo} alt="Logo" style={{ height: "110px", objectFit: "contain" }} /> {/* Enlarged */}
              </div>

              <h1 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "4.5rem",
                color: "#1e3a8a",
                fontWeight: "700",
                letterSpacing: "0.2em",
                margin: "0 0 5px 0", /* Reduced margin */
                textTransform: "uppercase"
              }}>
                Certificate
              </h1>

              <p style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "2.5rem",
                color: "#64748b",
                margin: "-5px 0 30px 0" /* Reduced margin */
              }}>
                of Completion
              </p>

              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1rem",
                fontWeight: "600",
                letterSpacing: "0.2em",
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: "15px" /* Reduced margin */
              }}>
                This Certificate is presented to
              </p>

              <h2 style={{
                fontFamily: "'Playfair Display', serif", // Changed Font
                fontSize: "4.5rem",
                color: "#d97706",
                margin: "0 0 20px 0", /* Reduced margin */
                lineHeight: 1,
                textTransform: "uppercase" // Capitalized
              }}>
                {viewedCert.student_name || "Student Name"}
              </h2>

              <div style={{ width: "150px", height: "2px", background: "#e2e8f0", margin: "0 auto 25px" }}></div>

              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "1.1rem",
                color: "#475569",
                maxWidth: "800px",
                margin: "0 auto 40px", /* Reduced from 60px to move content up */
                lineHeight: "1.6"
              }}>
                This is to certify that the above-named student has successfully completed the skill training in <strong style={{ color: "#1e3a8a" }}>{viewedCert.skill}</strong> at <strong style={{ color: "#1e3a8a" }}>{viewedCert.level}</strong> level through the <strong>Elevare Skill Sharing Platform</strong>. This accomplishment reflects their commitment to learning and skill development.
              </p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0 80px",
                alignItems: "flex-end",
                marginTop: "10px"
              }}>
                {/* LEFT: Signature Image */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ height: "80px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "5px" }}>
                    <img src="/signature.png" alt="Signature" style={{ maxHeight: "150px", maxWidth: "250px", transform: "translateY(20px)" }} /> {/* Enlarged & Adjusted */}
                  </div>
                  <div style={{ width: "200px", borderTop: "1px solid #cbd5e1", paddingTop: "5px" }}>
                    <p style={{
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      margin: 0
                    }}>
                      Signature
                    </p>
                  </div>
                </div>

                {/* Gold Seal */}
                <div style={{
                  width: "120px", height: "120px",
                  background: "linear-gradient(45deg, #d97706, #fbbf24)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: "bold",
                  boxShadow: "0 10px 20px rgba(217, 119, 6, 0.3)",
                  border: "4px solid white",
                  margin: "0 20px"
                }}>
                  <div style={{ border: "1px dashed rgba(255,255,255,0.5)", width: "100px", height: "100px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    VERIFIED
                  </div>
                </div>

                {/* RIGHT: Date */}
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ height: "80px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "5px" }}>
                    <p style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      {new Date(viewedCert.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ width: "200px", borderTop: "1px solid #cbd5e1", paddingTop: "5px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Date Issued</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificate;