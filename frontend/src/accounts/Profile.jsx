import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, Book, Calendar, Award, Edit3, Save, Trash2, Plus, X, Globe, Shield, FileText } from "lucide-react";
import Swal from 'sweetalert2';
import "../css/profile.css";

const API_URL = "http://127.0.0.1:8000/api/student-profile/";

const Profile = () => {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone_number: "",
    department: "",
    year: "",
    skills: "",
    about_me: "",
    picture: null,
    uploaded_certificates: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New files before uploading
  const [newCertificates, setNewCertificates] = useState([]);

  const fetchProfile = () => {
    setLoading(true);
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setImagePreview(
          res.data.picture ? `http://127.0.0.1:8000${res.data.picture}` : null
        );
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        Swal.fire('Error', 'Could not load profile data', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfile((prev) => ({ ...prev, picture: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSelectCertificates = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewCertificates((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveNewCertificate = (index) => {
    setNewCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteCertificate = (id) => {
    Swal.fire({
      title: 'Delete Certificate?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append("certificate_id", id);

        axios
          .delete(API_URL, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            data: formData,
          })
          .then(() => {
            setProfile((prev) => ({
              ...prev,
              uploaded_certificates: prev.uploaded_certificates.filter(
                (c) => c.id !== id
              ),
            }));
            Swal.fire('Deleted!', 'Certificate has been removed.', 'success');
          })
          .catch((err) => {
            console.error(err);
            Swal.fire('Error', 'Failed to delete certificate', 'error');
          });
      }
    });
  };

  const handleSave = () => {
    setSaving(true);
    const formData = new FormData();

    [
      "username",
      "email",
      "phone_number",
      "department",
      "year",
      "about_me",
      "skills",
    ].forEach((field) => formData.append(field, profile[field] || ""));

    if (profile.picture instanceof File) {
      formData.append("picture", profile.picture);
    }

    newCertificates.forEach((file) => {
      formData.append("uploaded_certificates", file);
    });

    axios
      .put(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your changes have been saved successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        setProfile(res.data);
        setEditMode(false);
        setNewCertificates([]);
        setImagePreview(
          res.data.picture ? `http://127.0.0.1:8000${res.data.picture}` : null
        );
      })
      .catch((err) => {
        console.error(err);
        Swal.fire('Update Failed', 'An error occurred while saving your profile.', 'error');
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* PROFILE HEADER CARD */}
      <div className="overview-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        padding: '40px',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #f1f5f9',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <User size={64} />
              </div>
            )}
          </div>
          {editMode && (
            <button
              onClick={() => imageInputRef.current.click()}
              style={{
                position: 'absolute', bottom: '5px', right: '5px',
                background: '#2563eb', color: 'white', border: 'none',
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Edit3 size={16} />
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>{profile.username}</h2>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '1.1rem' }}>{profile.department} • Year {profile.year}</p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: '10px 20px', background: '#f1f5f9', color: '#475569',
                  border: 'none', borderRadius: '8px', fontWeight: '600',
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    padding: '10px 20px', background: 'white', color: '#64748b',
                    border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 24px', background: '#2563eb', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* LEFT COLUMN: PERSONAL INFO */}
        <div className="overview-card animate-slide-up">
          <h3 style={{ marginTop: 0, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e3a8a' }}>
            <User size={20} /> Personal Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ProfileField
              label="Username"
              name="username"
              value={profile.username}
              editMode={editMode}
              icon={<User size={18} />}
              onChange={handleChange}
            />
            <ProfileField
              label="Email Address"
              name="email"
              value={profile.email}
              editMode={editMode}
              icon={<Mail size={18} />}
              onChange={handleChange}
            />
            <ProfileField
              label="Phone Number"
              name="phone_number"
              value={profile.phone_number}
              editMode={editMode}
              icon={<Phone size={18} />}
              onChange={handleChange}
            />
            <ProfileField
              label="Department"
              name="department"
              value={profile.department}
              editMode={editMode}
              icon={<Book size={18} />}
              onChange={handleChange}
            />
            <ProfileField
              label="Year of Study"
              name="year"
              value={profile.year}
              editMode={editMode}
              type="number"
              icon={<Calendar size={18} />}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: SKILLS & CERTIFICATES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="overview-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e3a8a' }}>
              <Award size={20} /> Skills & Bio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ProfileField
                label="My Skills"
                name="skills"
                value={profile.skills}
                editMode={editMode}
                placeholder="React, Design, Python..."
                onChange={handleChange}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>About Me</label>
                {editMode ? (
                  <textarea
                    name="about_me"
                    value={profile.about_me || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    rows="4"
                  />
                ) : (
                  <p style={{ margin: 0, color: '#1e293b', lineHeight: '1.6' }}>{profile.about_me || "No bio added yet."}</p>
                )}
              </div>
            </div>
          </div>

          <div className="overview-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1e3a8a' }}>
                <Shield size={20} /> My Certificates
              </h3>
              {editMode && (
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    background: '#f1f5f9', color: '#2563eb', border: 'none',
                    padding: '8px 12px', borderRadius: '6px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  <Plus size={16} /> Add Multiple
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleSelectCertificates}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.uploaded_certificates.length === 0 && newCertificates.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                  No certificates uploaded yet.
                </p>
              )}

              {/* EXISTING CERTIFICATES */}
              {profile.uploaded_certificates.map((cert) => (
                <div key={cert.id} style={certItemStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                      <FileText size={18} color="#64748b" />
                    </div>
                    <a href={cert.file} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '500', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cert.file.split("/").pop()}
                    </a>
                  </div>
                  {editMode && (
                    <button onClick={() => handleDeleteCertificate(cert.id)} style={deleteBtnStyle}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* NEW CERTIFICATES (STAGED) */}
              {newCertificates.map((file, idx) => (
                <div key={idx} style={{ ...certItemStyle, borderColor: '#3b82f6', background: '#f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '8px' }}>
                      <FileText size={18} color="white" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: '600', display: 'block' }}>{file.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700' }}>STAGED FOR UPLOAD</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveNewCertificate(idx)} style={{ ...deleteBtnStyle, color: '#3b82f6' }}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, name, value, editMode, icon, onChange, placeholder, type = "text" }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{label}</label>
    {editMode ? (
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>{icon}</div>}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingLeft: icon ? '40px' : '15px' }}
        />
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
        {icon && <div style={{ color: '#94a3b8' }}>{icon}</div>}
        <span style={{ color: '#1e293b', fontWeight: '500' }}>{value || "Not set"}</span>
      </div>
    )}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '0.95rem',
  background: '#f8fafc',
  transition: 'all 0.2s'
};

const certItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

const deleteBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s'
};

export default Profile;
