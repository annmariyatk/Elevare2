import React from "react";
import { Shield, Lock, FileText, Mail } from "lucide-react";

export default function PrivacySettings() {
  return (
    <div className="animate-fade-in" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', lineHeight: '1.7', color: '#334155' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '15px', borderRadius: '50%', color: '#1e3a8a', marginBottom: '20px' }}>
          <Shield size={40} />
        </div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px' }}>🔐 Elevare – Privacy Policy</h2>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Last Updated: February 09, 2026</p>
      </div>

      <div className="overview-card" style={{ padding: '40px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          Welcome to Elevare, a college skill-sharing and peer learning platform. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and how we keep it safe.
        </p>

        <p style={{ fontWeight: '700', color: '#1e293b', background: '#f8fafc', padding: '12px 20px', borderRadius: '10px', display: 'inline-block' }}>
          By using Elevare, you agree to this Privacy Policy.
        </p>

        <Section title="📌 1. Information We Collect">
          <SubSection title="Personal Information">
            <ul style={listStyle}>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Department</li>
              <li>Year of study</li>
              <li>Profile bio (“About”)</li>
              <li>Skills you list</li>
              <li>Certificates or proof documents you upload</li>
            </ul>
          </SubSection>
          <SubSection title="Usage Information">
            <ul style={listStyle}>
              <li>Login activity</li>
              <li>Pages visited</li>
              <li>Skill posts and interactions</li>
              <li>Messages and collaboration requests</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="🎯 2. How We Use Your Information">
          <p>We use your information to:</p>
          <ul style={listStyle}>
            <li>Create and manage your account</li>
            <li>Display your profile to other students on the platform</li>
            <li>Enable skill sharing and peer connections</li>
            <li>Verify certificates and skills (if required)</li>
            <li>Contact you about platform updates or important notices</li>
            <li>Improve platform features and user experience</li>
            <li>Provide support and resolve issues</li>
          </ul>
        </Section>

        <Section title="👥 3. Who Can See Your Information">
          <ul style={listStyle}>
            <li>Your profile details (name, department, year, skills, about) may be visible to other registered Elevare users.</li>
            <li>Certificates are visible only as per your profile settings or admin verification needs.</li>
            <li>Contact details (email, phone) are not publicly shown unless you choose to share them.</li>
          </ul>
        </Section>

        <Section title="🔄 4. Data Sharing">
          <p>We do not sell or rent your personal information. We may share data only:</p>
          <ul style={listStyle}>
            <li>With authorized college administrators</li>
            <li>With platform moderators for verification</li>
            <li>If required by law or institutional policy</li>
          </ul>
        </Section>

        <Section title="🔐 5. Data Security">
          <p>We take reasonable technical and administrative measures to protect your data, including:</p>
          <ul style={listStyle}>
            <li>Secure servers</li>
            <li>Access controls</li>
            <li>Admin-only data management</li>
            <li>Protected login systems</li>
          </ul>
          <p style={{ fontStyle: 'italic', marginTop: '10px' }}>However, no online system is 100% secure.</p>
        </Section>

        <Section title="🧾 7. Certificates & Uploaded Documents">
          <ul style={listStyle}>
            <li>Certificates and documents uploaded are used only for skill verification and profile credibility.</li>
            <li>They are not shared outside the platform without your permission.</li>
            <li>Admins may review them for authenticity.</li>
          </ul>
        </Section>

        <Section title="🗑️ 8. Your Rights">
          <p>You have the right to:</p>
          <ul style={listStyle}>
            <li>View your stored data</li>
            <li>Edit your profile information</li>
            <li>Remove certificates or skills</li>
            <li>Request correction of incorrect data</li>
          </ul>
          <p>You can do this through your profile settings or by contacting the Elevare admin.</p>
        </Section>

        <Section title="👶 9. Student Use Only">
          <p>Elevare is intended only for registered college students and authorized users. Accounts found to be fake or misused may be removed.</p>
        </Section>

        <Section title="🔄 10. Policy Updates">
          <p>We may update this Privacy Policy from time to time. Updates will be posted on this page with a new revision date.</p>
        </Section>

        <Section title="📧 11. Contact">
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#0369a1' }}>Elevare Platform Admin</p>
            <p style={{ margin: '5px 0 0', color: '#075985' }}>Email: <a href="mailto:elevarewebsite@gmail.com" style={{ color: '#0284c7', textDecoration: 'none' }}>elevarewebsite@gmail.com</a></p>
          </div>
        </Section>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {title}
    </h3>
    <div style={{ color: '#475569', fontSize: '1rem' }}>
      {children}
    </div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div style={{ marginBottom: '15px' }}>
    <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>{title}</h4>
    {children}
  </div>
);

const listStyle = {
  paddingLeft: '20px',
  margin: '10px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};
