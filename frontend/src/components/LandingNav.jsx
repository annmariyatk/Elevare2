import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import "../css/landing.css";

export default function LandingNav() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="landing-nav animate-fade-in">
            <div className="nav-logo">
                <img src={logo} alt="Elevare" style={{ height: '50px' }} />
                <span>Elevare</span>
            </div>

            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                <a href="/#features" onClick={() => setMenuOpen(false)}>Features</a>
                <a href="/#reviews" onClick={() => setMenuOpen(false)}>Reviews</a>
                <div className="nav-buttons">
                    <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/signup" className="btn-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
            </div>

            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X /> : <Menu />}
            </button>
        </nav>
    );
}
