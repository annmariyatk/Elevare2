import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Star, ArrowRight, Zap, Users, Award, BookOpen,
    ChevronLeft, ChevronRight, Menu, X, TrendingUp,
    Target, Sparkles, GraduationCap, MessageSquare,
    Mail, Phone, Linkedin, Instagram, Twitter, Search, ShoppingCart,
    Play, CheckCircle2, Video, Rocket, Book, ShieldCheck, HeartHandshake,
    Send, User, BarChart, Globe
} from "lucide-react";
import "../css/landing.css";

function LandingPage() {
    const [reviews, setReviews] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const featuresScrollRef = React.useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) setItemsPerPage(4);
            else if (window.innerWidth > 600) setItemsPerPage(2);
            else setItemsPerPage(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleScroll = () => {
        if (featuresScrollRef.current) {
            const { scrollLeft, clientWidth } = featuresScrollRef.current;
            const scrollIndex = Math.round(scrollLeft / clientWidth);
            setActiveFeatureIndex(scrollIndex);
        }
    };

    const scrollToFeature = (index) => {
        if (featuresScrollRef.current) {
            const { clientWidth } = featuresScrollRef.current;
            featuresScrollRef.current.scrollTo({
                left: index * clientWidth,
                behavior: 'smooth'
            });
            setActiveFeatureIndex(index);
        }
    };

    useEffect(() => {
        document.title = "Elevare | College Skill Sharing";
        axios.get("http://127.0.0.1:8000/api/review/public/")
            .then(res => setReviews(res.data))
            .catch(err => console.error("Failed to fetch reviews", err));
    }, []);

    const features = [
        { id: 1, icon: <Rocket size={30} />, title: "Peer-to-Peer Learning", description: "Connect directly with fellow students who excel in subjects you're looking to master." },
        { id: 2, icon: <HeartHandshake size={30} />, title: "Skill Exchange", description: "Share your own expertise and help others while building your own teaching portfolio." },
        { id: 3, icon: <ShieldCheck size={30} />, title: "Verified Skills", description: "Get recognized for your knowledge with college-verified skill badges and certificates." },
        { id: 4, icon: <Users size={30} />, title: "Collaborative Projects", description: "Find teammates for your next big hackathon or academic group project easily." },
        { id: 5, icon: <Zap size={30} />, title: "Real-time Notifications", description: "Stay updated with instant alerts for new skill requests and messages." }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="landing-container">
            {/* Navbar */}
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
                            <a href="#home" onClick={() => setMobileMenuOpen(false)}>HOME</a>
                            <a href="#features" onClick={() => setMobileMenuOpen(false)}>FEATURES</a>
                            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
                            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</a>
                        </div>

                        <div className="nav-actions">
                            <Link to="/teacher/report-issue" className="hero-btn-medium btn-support" onClick={() => setMobileMenuOpen(false)}>TEACHER SUPPORT</Link>
                            <Link to="/login" className="hero-btn-medium btn-login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="hero-section">
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="hero-tagline">MARIAN COLLEGE KUTTIKKANAM (AUTONOMOUS)</div>
                    <h1>
                        Learn from Peers <br />
                        Share Your Expertise
                    </h1>
                    <p>
                        Elevare is Marian College's exclusive platform for peer-led learning.
                        Connect with talented students, exchange skills, and grow together
                        in a collaborative academic environment. <em>"Inform, Form, Transform"</em>
                    </p>
                    <div className="hero-bullets">
                        <div className="hero-bullet"><CheckCircle2 size={16} /> Campus Exclusive</div>
                        <div className="hero-bullet"><CheckCircle2 size={16} /> Verified Skills</div>
                        <div className="hero-bullet"><CheckCircle2 size={16} /> Peer Mentoring</div>
                    </div>
                    <div className="hero-cta">
                        <Link to="/signup" className="hero-btn-primary">JOIN NOW</Link>
                        <Link to="/login" className="hero-btn-secondary">BROWSE SKILLS</Link>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-image-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="hero-image-mask">
                        <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=800&fit=crop"
                            alt="College students collaborating"
                        />
                    </div>

                    <motion.div
                        className="floating-badge badge-video"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="badge-icon">
                            <Book size={20} />
                        </div>
                        <div className="badge-text">
                            <h4>500+</h4>
                            <p>Skills Shared</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="floating-badge badge-students"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="badge-icon blue">
                            <Users size={20} />
                        </div>
                        <div className="badge-text">
                            <h4>CAMPUS</h4>
                            <p>Wide Community</p>
                        </div>
                    </motion.div>
                </motion.div>
            </header>

            {/* Features Strip */}
            <motion.div
                className="features-strip"
                id="features"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="feature-item">
                    <div className="feature-icon-box"><Zap size={20} /></div>
                    <div className="feature-text-box">
                        <span className="feature-title">Quick Sessions</span>
                        <p className="feature-desc">15-min rapid knowledge transfers</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon-box"><MessageSquare size={20} /></div>
                    <div className="feature-text-box">
                        <span className="feature-title">Direct Chat</span>
                        <p className="feature-desc">Instant peer-to-peer communication</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon-box"><Users size={20} /></div>
                    <div className="feature-text-box">
                        <span className="feature-title">Peer Reviews</span>
                        <p className="feature-desc">Verified feedback from the community</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon-box"><Book size={20} /></div>
                    <div className="feature-text-box">
                        <span className="feature-title">Knowledge Vault</span>
                        <p className="feature-desc">Access curated student resources</p>
                    </div>
                </div>
                <div className="feature-item">
                    <div className="feature-icon-box"><ShieldCheck size={20} /></div>
                    <div className="feature-text-box">
                        <span className="feature-title">Expert Guidance</span>
                        <p className="feature-desc">Professional advice from verified campus teachers</p>
                    </div>
                </div>

            </motion.div>

            {/* About Section */}
            <section id="about" className="about-section">
                <motion.div
                    className="about-images"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop" alt="Campus learning" className="about-img-main" />
                    <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop" alt="Student project" className="about-img-secondary" />
                    <div className="experience-badge" style={{ width: '140px', height: '140px' }}>
                        <span>100%</span>
                        <span>Student Support</span>
                    </div>
                </motion.div>
                <motion.div
                    className="about-content"
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="section-label">GET TO KNOW ABOUT US</div>
                    <h2>Our Mission: Empowering Every Student Through Collaboration</h2>
                    <p>
                        Elevare was born out of the need for a more accessible, student-friendly
                        way to master complex subjects and pick up new technical skills within our campus.
                    </p>
                    <p>
                        We believe that every student has something to teach and something to learn.
                        By facilitating these connections, we're building a stronger, more
                        knowledgeable college community.
                    </p>
                    <Link to="/about" className="hero-btn-primary">LEARN MORE →</Link>
                </motion.div>
            </section>

            {/* Platform Features Section */}
            <section className="courses-section">
                <motion.div
                    className="courses-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="section-label" style={{ justifyContent: 'center' }}>PLATFORM FEATURES</div>
                    <h2>Why Choose Our Skill-Sharing Platform?</h2>
                </motion.div>

                <motion.div
                    className="courses-grid"
                    ref={featuresScrollRef}
                    onScroll={handleScroll}
                    style={{ marginTop: '50px' }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    {features.map(feature => (
                        <motion.div key={feature.id} className="course-card" style={{ padding: '40px', textAlign: 'center' }} variants={fadeInUp} whileHover={{ y: -10 }}>
                            <div className="feature-icon-box" style={{ width: '70px', height: '70px', margin: '0 auto 24px', background: 'var(--navy-soft)', color: 'var(--primary-blue)' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="scroll-dots">
                    {Array.from({ length: Math.ceil(features.length / itemsPerPage) }).map((_, index) => (
                        <button
                            key={index}
                            className={`scroll-dot ${activeFeatureIndex === index ? 'active' : ''}`}
                            onClick={() => scrollToFeature(index)}
                            aria-label={`Scroll to page ${index + 1}`}
                        />
                    ))}
                </div>

            </section>
            {/* How It Works Section */}
            <section className="how-it-works-section" style={{ padding: '80px', background: 'white' }}>
                <motion.div
                    className="section-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp} // Changed from animate-fade-in to use framer-motion variants
                    style={{ textAlign: 'center', marginBottom: '60px' }}
                >
                    <div className="section-label" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-blue)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '15px' }}>HOW IT WORKS</div>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '10px', color: 'var(--navy-dark)', fontWeight: '800' }}>Your Journey to Excellence</h2>
                </motion.div>

                <div className="process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                    {[
                        { id: 1, title: "Create Profile", icon: <User size={30} />, desc: "Sign up with your college ID and build your academic profile." },
                        { id: 2, title: "Discover Skills", icon: <Search size={30} />, desc: "Browse skills offered by peers or request help for specific topics." },
                        { id: 3, title: "Connect & Learn", icon: <MessageSquare size={30} />, desc: "Chat, schedule sessions, and start learning from each other." },
                        { id: 4, title: "Get Certified", icon: <Award size={30} />, desc: "Complete sessions to earn badges and verified certificates." }
                    ].map((step, idx) => (
                        <motion.div
                            key={step.id}
                            className="process-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', padding: '30px', background: '#F8FAFC', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        >
                            <div className="process-icon" style={{
                                width: '60px', height: '60px', background: 'var(--primary-blue)',
                                color: 'white', borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                fontSize: '1.2rem', fontWeight: 'bold'
                            }}>
                                {step.icon}
                            </div>
                            <h3 style={{ marginBottom: '10px', color: 'var(--navy-dark)', fontSize: '1.2rem', fontWeight: '700' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>


            <section className="testimonials-section">
                <div className="section-label" style={{ justifyContent: 'center' }}>TESTIMONIALS</div>
                <h2>What Our Students Say</h2>

                <div className="testimonial-scroll">
                    {reviews.length > 0 ? reviews.map((rev, i) => (
                        <motion.div
                            key={i}
                            className="testimonial-bubble"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <p>"{rev.review}"</p>
                            <div className="testimonial-author">
                                {rev.picture ? (
                                    <img src={rev.picture} alt={rev.username} className="author-img" />
                                ) : (
                                    <div className="author-img" style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#DBEAFE', color: '#1E3A8A'
                                    }}>
                                        <User size={24} />
                                    </div>
                                )}
                                <div className="author-info">
                                    <h4>{rev.username}</h4>
                                    <span>{rev.department}</span>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <p>No testimonials yet. Be the first to share your experience!</p>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="about-section" style={{ background: '#F8FAFC' }}>
                <motion.div
                    className="about-content"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="section-label">CONTACT US</div>
                    <h2>Have Questions? Reach Out to Our Team</h2>
                    <p>
                        Whether you want to report an issue, suggest a feature, or just say hi,
                        we're always here to listen to our fellow students.
                    </p>

                    <div className="contact-form-container" style={{ marginTop: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="top-bar-item" style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
                                <Mail size={20} color="var(--primary-blue)" /> <span>elevarewebsite@gmail.com</span>
                            </div>

                        </div>

                        <div className="hero-cta" style={{ marginTop: '40px' }}>
                            <a href="mailto:support@elevare-campus.in" className="hero-btn-primary">
                                <Send size={18} /> SEND A MESSAGE
                            </a>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    className="about-images"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=800&fit=crop"
                        alt="Contact Support"
                        className="about-img-main"
                        style={{ borderRadius: '24px' }}
                    />
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo-box">
                        <Link to="/" className="nav-logo" style={{ color: 'white', marginBottom: '20px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '50px', filter: 'brightness(0) invert(1)' }} />
                        </Link>
                        <p>Elevare: Empowering students through collective campus knowledge. Build your future through peer-to-peer collaboration.</p>
                        <div className="top-bar-social" style={{ marginTop: '20px' }}>
                            <a href="#"><Linkedin size={20} /></a>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><Link to="/about">About</Link></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Skill Guidelines</a></li>
                            <li><Link to="/teacher/report-issue">Teacher Support</Link></li>
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
        </div >
    );
}

export default LandingPage;
