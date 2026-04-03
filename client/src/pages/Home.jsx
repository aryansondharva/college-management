import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Student',
            role: 'student',
            icon: 'bi-person-square',
            desc: 'Access coursework, track grades, and view attendance.'
        },
        {
            title: 'Teacher',
            role: 'teacher',
            icon: 'bi-display',
            desc: 'Manage classes, grade assignments, and monitor student progress.'
        },
        {
            title: 'Admin',
            role: 'admin',
            icon: 'bi-shield-check',
            desc: 'Oversight of school operations and administrative tasks.'
        }
    ];

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light py-4">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="/">
                        <img src="/logo.png" alt="Drop Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
                    </a>
                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav align-items-center gap-3">
                            <li className="nav-item"><a className="nav-link text-dark fw-medium active" href="#home" target="_blank" rel="noopener noreferrer">Home</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="#features" target="_blank" rel="noopener noreferrer">Features</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="#about" target="_blank" rel="noopener noreferrer">About</a></li>
                            <li className="nav-item ms-lg-3">
                                <button onClick={() => document.getElementById('portals').scrollIntoView({ behavior: 'smooth' })} className="btn btn-dark rounded-pill px-4 py-2 fw-medium">
                                    Portal Login
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="hero-section d-flex align-items-center" id="home">
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            <span className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-4 fw-normal text-uppercase tracking-wider shadow-sm">
                                Simplistic Education Management
                            </span>
                            <h1 className="display-4 fw-bold text-dark mb-4 hero-title">
                                Streamline your academic experience effortlessly.
                            </h1>
                            <p className="lead text-muted mb-5 hero-subtitle">
                                A simple, elegant, and powerful platform connecting students, teachers, and administrators in one unified ecosystem.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

             {/* Portals Section */}
            <section className="portals-section py-5 bg-white" id="portals">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-dark mb-2 hero-title">Choose Your Portal</h2>
                        <p className="text-muted small">Select your designated role to log into the system.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {roles.map((r, i) => (
                            <div key={i} className="col-lg-4 col-md-6 col-sm-12">
                                <div 
                                    className="portal-card h-100 p-5 text-center d-flex flex-column"
                                    onClick={() => navigate(`/login/${r.role}`)}
                                >
                                    <div className="icon-wrapper-minimal mx-auto mb-4">
                                        <i className={`bi ${r.icon}`}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">{r.title}</h4>
                                    <p className="text-muted small mb-4 flex-grow-1 px-3">{r.desc}</p>
                                    <div className="divider-minimal mb-4"></div>
                                    <div className="portal-action-link d-flex align-items-center justify-content-center text-dark">
                                        Login <i className="bi bi-arrow-right ms-2 fs-6"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section py-5 bg-light" id="features">
                <div className="container py-5">
                    <div className="row align-items-center mb-5">
                        <div className="col-lg-6">
                            <h2 className="fw-bold text-dark mb-4">Powerful tools for a <br/>seamless education.</h2>
                            <p className="text-muted lead fw-light">We've built everything you need to manage your institution efficiently, without the clutter of traditional systems.</p>
                        </div>
                    </div>
                    <div className="row g-4">
                        {[
                            { title: 'Attendance', desc: 'Real-time tracking and automated reporting for every subject.', icon: 'bi-check2-circle' },
                            { title: 'Academic Hub', desc: 'Centralized access to syllabus, assignments, and study materials.', icon: 'bi-book' },
                            { title: 'Smart Exams', desc: 'Streamlined exam scheduling and instant result publication.', icon: 'bi-journal-check' },
                            { title: 'Notifications', desc: 'Stay updated with instant notices and campus-wide announcements.', icon: 'bi-bell' }
                        ].map((f, i) => (
                            <div key={i} className="col-lg-3 col-md-6">
                                <div className="feature-item p-4 rounded-4 bg-white border h-100 transition-all">
                                    <div className="feature-icon mb-3">
                                        <i className={`bi ${f.icon} fs-3 text-dark`}></i>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-3">{f.title}</h5>
                                    <p className="text-muted small mb-0">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section py-5 bg-white overflow-hidden" id="about">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <div className="about-image-container position-relative">
                                <div className="about-image-bg"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                                    alt="About Drop" 
                                    className="img-fluid rounded-4 shadow-lg position-relative z-1"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6 ps-lg-5">
                            <span className="badge bg-dark-subtle text-dark px-3 py-2 rounded-pill mb-4 fw-normal text-uppercase tracking-wider">
                                Our Mission
                            </span>
                            <h2 className="display-6 fw-bold text-dark mb-4">Empowering the next generation of learners.</h2>
                            <p className="text-muted mb-4 lead fw-light">
                                "Drop" was founded on the belief that educational management doesn't have to be complicated. We focus on creating a digital environment that feels natural and intuitive.
                            </p>
                            <div className="row g-4 pt-3">
                                <div className="col-sm-6">
                                    <h4 className="fw-bold text-dark">Minimalism</h4>
                                    <p className="text-muted small">Design that removes distractions and focuses on core tasks.</p>
                                </div>
                                <div className="col-sm-6">
                                    <h4 className="fw-bold text-dark">Efficiency</h4>
                                    <p className="text-muted small">Automated workflows that save time for teachers and admins.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Comprehensive Footer */}
            <footer className="site-footer bg-white border-top py-5 mt-auto">
                <div className="container py-4">
                    <div className="row g-5">
                        <div className="col-lg-4 col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <img src="/logo.png" alt="Drop Logo" className="me-2" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                                <span className="fw-bold fs-4 text-dark">Drop</span>
                            </div>
                            <p className="text-muted small pe-lg-5 mb-4 line-height-lg">
                                Simplifying academic workflows with a minimalist approach. We build tools that help educational institutions focus on what matters most: education.
                            </p>
                            <div className="social-links d-flex gap-3">
                                <a href="https://x.com/aryansondharva" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-twitter-x"></i></a>
                                <a href="https://github.com/aryansondharva" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-github"></i></a>
                                <a href="https://www.linkedin.com/in/aryan-sondharva/" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Platform</h6>
                            <ul className="list-unstyled footer-links mb-0">
                                <li className="mb-2"><a href="/overview" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Overview</a></li>
                                <li className="mb-2"><a href="#" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Features</a></li>
                                <li className="mb-2"><a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Pricing</a></li>
                                <li className="mb-2"><a href="#" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Releases</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Resources</h6>
                            <ul className="list-unstyled footer-links mb-0">
                                <li className="mb-2"><a href="/docs" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Documentation</a></li>
                                <li className="mb-2"><a href="#" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Help Center</a></li>
                                <li className="mb-2"><a href="#" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Community</a></li>
                                <li className="mb-2"><a href="/contact" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Contact</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Stay Updated</h6>
                            <p className="text-muted small mb-3">Subscribe to our newsletter for the latest updates.</p>
                            <div className="input-group mb-3 newsletter-input">
                                <input type="email" className="form-control border-light-subtle shadow-none bg-light" placeholder="Email address" />
                                <button className="btn btn-dark px-3" type="button">Subscribe</button>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-5 pt-4 border-top">
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            <p className="m-0 text-muted small">&copy; 2026 Drop. All rights reserved.</p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <ul className="list-inline m-0 small">
                                <li className="list-inline-item me-3"><a href="#" className="text-muted text-decoration-none hover-text-dark">Privacy Policy</a></li>
                                <li className="list-inline-item"><a href="#" className="text-muted text-decoration-none hover-text-dark">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                body, html {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                }
                
                .home-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #fdfdfd;
                }

                .logo-icon {
                    width: 32px;
                    height: 32px;
                    font-size: 14px;
                }

                .tracking-wider { letter-spacing: 0.05em; }
                .fs-7 { font-size: 0.8rem; }
                .line-height-lg { line-height: 1.7; }
                
                .hero-section {
                    min-height: 55vh;
                    padding: 80px 0;
                    background: radial-gradient(circle at 50% -20%, #f4f6f9 0%, #fdfdfd 100%);
                }
                
                .hero-title {
                    letter-spacing: -0.02em;
                    line-height: 1.15;
                }
                
                .hero-subtitle {
                    font-weight: 300;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                 .portal-card {
                    border: 1px solid #f1f3f5;
                    border-radius: 20px;
                    background: #ffffff;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    cursor: pointer;
                    box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.02);
                }
                
                .portal-card:hover {
                    box-shadow: 0 40px 60px -10px rgba(0, 0, 0, 0.06);
                    transform: translateY(-8px);
                    border-color: #212529 !important;
                }

                .icon-wrapper-minimal {
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background-color: #f8f9fa;
                    font-size: 28px;
                    color: #212529;
                    transition: all 0.3s ease;
                }
                
                .portal-card:hover .icon-wrapper-minimal {
                    background-color: #212529;
                    color: #ffffff;
                }

                .divider-minimal {
                    height: 1px;
                    width: 80%;
                    margin: 0 auto;
                    background: #f1f3f5;
                }

                .portal-action-link {
                    font-weight: 500;
                    letter-spacing: -0.01em;
                    transition: all 0.2s ease;
                }

                .portal-card:hover .portal-action-link {
                    transform: translateX(4px);
                    font-weight: 700;
                }

                .minimalist-desc {
                    font-size: 0.95rem;
                    line-height: 1.6;
                }

                .hover-text-dark {
                    transition: color 0.2s;
                }
                .hover-text-dark:hover {
                    color: #212529 !important;
                }
                
                .newsletter-input .form-control {
                    border-radius: 8px 0 0 8px;
                }
                .newsletter-input .btn {
                    border-radius: 0 8px 8px 0;
                }

                /* New Styles */
                .feature-item {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .feature-item:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.05);
                    border-color: #212529 !important;
                }
                .feature-icon {
                    width: 54px;
                    height: 54px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .feature-item:hover .feature-icon {
                    background: #212529;
                }
                .feature-item:hover .feature-icon i {
                    color: #ffffff !important;
                }
                
                .about-image-container {
                    padding: 20px;
                }
                .about-image-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 80%;
                    height: 80%;
                    background: #f8f9fa;
                    border-radius: 24px;
                    z-index: 0;
                }
                
                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 991.98px) {
                    .about-image-container {
                        max-width: 500px;
                        margin: 0 auto;
                    }
                }

             `}</style>
        </div>
    );
};

export default Home;
