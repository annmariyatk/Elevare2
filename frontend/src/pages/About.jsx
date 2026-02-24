import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Linkedin, Instagram, Twitter, Mail, Phone,
    Linkedin as LinkedinIcon, Play, Github,
    Globe, Heart, Sparkles, Award, Zap, Menu, X
} from "lucide-react";
import "../css/landing.css";

function About() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        document.title = "About | Elevare Skill Sharing";
        window.scrollTo(0, 0);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const images = [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=350&fit=crop",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=350&fit=crop",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=350&fit=crop",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=350&fit=crop"
    ];

    return (
        <div className="landing-container">
            {/* Navbar (Same as Landing) */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <img src="/logo.png" alt="Elevare Logo" style={{ height: '50px' }} />
                        <span className="logo-text">ELEVARE</span>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    <div className={`nav-links-wrapper ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <div className="nav-links">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
                            <a href="/#features" onClick={() => setMobileMenuOpen(false)}>FEATURES</a>
                            <Link to="/about" className="active" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
                            <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</a>
                        </div>
                        <div className="nav-actions">
                            <Link to="/login" className="hero-btn-medium btn-login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* About Hero Section - Blue Theme */}
            <section className="about-hero">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <Sparkles color="white" size={32} />
                    </div>
                    <h1>About us</h1>
                    <p>
                        Elevare is a mini skill-sharing platform dedicated to fostering a
                        collaborative learning culture at <strong>Marian College Kuttikkanam (Autonomous)</strong>.
                        We believe in the power of peer-to-peer knowledge exchange.
                    </p>
                </motion.div>
            </section>

            {/* Image Grid */}
            <div className="about-image-grid">
                {images.map((img, idx) => (
                    <motion.div
                        key={idx}
                        className="grid-item"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <img src={img} alt={`Campus life ${idx}`} />
                    </motion.div>
                ))}
            </div>

            {/* Mission Section */}
            <section className="mission-split">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="section-label">OUR MISSION</div>
                    <h2 style={{ fontSize: '2.8rem', color: 'var(--navy-dark)', marginBottom: '24px' }}>
                        We make sure your idea & creation delivered properly
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '30px' }}>
                        Our platform connects students with unique talents to those eager to learn.
                        Whether it's coding, design, or public speaking, we provide the space
                        for knowledge to grow and inspiration to spark.
                    </p>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <h4 style={{ color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} color="var(--primary-blue)" /> Impact</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Creating real academic value.</p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={18} color="var(--primary-blue)" /> Community</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Building lasting bonds.</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="vid-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    style={{ height: '400px' }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                        alt="College collaboration"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
                    />
                </motion.div>
            </section>

            {/* College Information Section */}
            <section style={{ padding: '100px 0', background: 'white' }}>
                <div className="section-label" style={{ justifyContent: 'center' }}>ABOUT MARIAN COLLEGE</div>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--navy-dark)', marginBottom: '50px', maxWidth: '800px', margin: '0 auto 50px' }}>
                    Marian College Kuttikkanam (Autonomous)
                </h2>

                <motion.div
                    style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '50px' }}>
                        <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <Award size={32} color="var(--primary-blue)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--navy-dark)', marginBottom: '12px' }}>Established 1995</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Founded by the Catholic Diocese of Kanjirappally, affiliated with Mahatma Gandhi University, Kottayam.</p>
                        </div>
                        <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <Sparkles size={32} color="var(--primary-blue)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--navy-dark)', marginBottom: '12px' }}>Autonomous Since 2016</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Youngest college to achieve autonomous status within 21 years of founding.</p>
                        </div>
                        <div style={{ padding: '30px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <Award size={32} color="var(--primary-blue)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'var(--navy-dark)', marginBottom: '12px' }}>NAAC A++ Accredited</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Recognized as a "College with Potential for Excellence" by UGC in 2009 and 2014.</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: '40px', background: 'linear-gradient(135deg, #10357A 0%, #0A2351 100%)', borderRadius: '20px', color: 'white' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '16px', fontStyle: 'italic' }}>"Inform, Form, Transform"</h3>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '8px' }}>Our Motto | Making Complete</p>
                        <p style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: '600px', margin: '20px auto 0' }}>
                            Located at Kuttikkanam P.O, Peermade, Idukki District, Kerala - 685 531
                        </p>
                        <a href="https://mariancollege.org" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: '600', marginTop: '20px', padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)' }}>
                            <Globe size={20} /> Visit College Website
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Founder Section */}
            <section style={{ background: '#F8FAFC', padding: '100px 0' }}>
                <div className="section-label" style={{ justifyContent: 'center' }}>THE FOUNDER</div>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: 'var(--navy-dark)', marginBottom: '50px' }}>The Visionary Behind Elevare</h2>

                <motion.div
                    className="founder-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img src="/ann.jpeg" alt="Ann Mariya T K" className="founder-img" />
                    <div className="founder-info">
                        <h3>Ann Mariya T K</h3>
                        <span className="founder-role">Founder & Lead Developer</span>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Ann Mariya T K is a dedicated **BCA student at Marian College Kuttikkanam (Autonomous)**.
                            With a passion for technology and community building, she envisioned Elevare as a
                            solution to bridge the skill gap among college students through collaborative learning.
                        </p>
                        <div className="top-bar-social" style={{ color: 'var(--primary-blue)' }}>
                            <a href="#"><LinkedinIcon size={20} /></a>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Github size={20} /></a>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Footer (Same as Landing) */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo-box">
                        <Link to="/" className="nav-logo" style={{ color: 'white', marginBottom: '20px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '50px', filter: 'brightness(0) invert(1)' }} />
                        </Link>
                        <p>Elevare: Empowering students through collective campus knowledge. Build your future through peer-to-peer collaboration.</p>
                        <div className="top-bar-social" style={{ marginTop: '20px' }}>
                            <a href="#"><LinkedinIcon size={20} /></a>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><a href="/#features">Features</a></li>
                            <li><Link to="/about">About</Link></li>
                            <li><a href="/#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Skill Guidelines</a></li>
                            <li><a href="#">Report Issue</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Marian College Kuttikkanam</h4>
                        <p style={{ opacity: 0.7, marginBottom: '10px', fontSize: '0.95rem' }}>Kuttikkanam P.O, Peermade</p>
                        <p style={{ opacity: 0.7, marginBottom: '10px', fontSize: '0.95rem' }}>Idukki District, Kerala - 685 531</p>
                        <p style={{ opacity: 0.7, marginBottom: '10px', fontSize: '0.95rem' }}>Affiliated to Mahatma Gandhi University</p>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '15px' }}>NAAC A++ Accredited | Autonomous</p>
                        <a href="https://mariancollege.org" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' }}>
                            <Globe size={18} /> Visit College Website →
                        </a>
                    </div>
                </div>
                <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p>&copy; 2026 Elevare Platform. Built for Students, By Students.</p>
                </div>
            </footer>
        </div>
    );
}

export default About;
