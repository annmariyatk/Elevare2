import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/landing.css";

export default function LandingFooter() {
    return (
        <footer className="landing-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <img src={logo} alt="Elevare" style={{ height: '40px' }} />
                    <p style={{ marginTop: '10px', color: '#64748b' }}>Empowering students through shared knowledge.</p>
                </div>
                <div className="footer-links">
                    <h4>Platform</h4>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/signup">Join Now</Link>
                    <Link to="/teacher/report-issue" style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Mentor Support</Link>
                </div>
                <div className="footer-links">
                    <h4>Community</h4>
                    <a href="/#reviews">Success Stories</a>
                    <a href="#">Blog</a>
                    <a href="#">Events</a>
                </div>
                <div className="footer-links">
                    <h4>Contact</h4>
                    <a href="mailto:support@elevare.com">support@elevare.com</a>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>+91 123 456 7890</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Elevare. All rights reserved.</p>
            </div>
        </footer>
    );
}
