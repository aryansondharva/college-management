import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Student',
            role: 'student',
            icon: 'bi-mortarboard',
            desc: 'Access coursework, track grades, and view attendance.'
        },
        {
            title: 'Teacher',
            role: 'teacher',
            icon: 'bi-person-workspace',
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
                        <img src="/logo.png" alt="Drop Logo" className="me-2" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <span className="fw-bold fs-4 text-dark logo-text">Drop</span>
                    </a>
                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav align-items-center gap-3">
                            <li className="nav-item"><a className="nav-link text-dark fw-medium active" href="#home">Home</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="#features">Features</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="#about">About</a></li>
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
                        <h2 className="fw-bold text-dark mb-3">Choose Your Portal</h2>
                        <p className="text-muted">Select your designated role to log into the system.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {roles.map((r, i) => (
                            <div key={i} className="col-lg-4 col-md-6 col-sm-12">
                                <div 
                                    className="portal-card card h-100 p-5 text-center border text-decoration-none text-dark"
                                    onClick={() => navigate(`/login/${r.role}`)}
                                >
                                    <div className="icon-wrapper mx-auto mb-4 text-dark">
                                        <i className={`bi ${r.icon}`}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">{r.title}</h4>
                                    <p className="text-muted mb-0 minimalist-desc">{r.desc}</p>
                                    <div className="mt-4 pt-4 border-top hover-arrow d-flex align-items-center justify-content-center text-dark fw-medium">
                                        Login <i className="bi bi-arrow-right ms-2 transition-transform"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comprehensive Footer */}
            <footer className="site-footer bg-white border-top py-5 mt-auto">
                <div className="container py-4">
                    <div className="row g-5">
                        <div className="col-lg-4 col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <img src="/logo.png" alt="Drop Logo" className="me-2" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                <span className="fw-bold fs-5 text-dark">Drop</span>
                            </div>
                            <p className="text-muted small pe-lg-5 mb-4 line-height-lg">
                                Simplifying academic workflows with a minimalist approach. We build tools that help educational institutions focus on what matters most: education.
                            </p>
                            <div className="social-links d-flex gap-3">
                                <a href="#" className="text-muted hover-text-dark"><i className="bi bi-twitter-x"></i></a>
                                <a href="#" className="text-muted hover-text-dark"><i className="bi bi-github"></i></a>
                                <a href="#" className="text-muted hover-text-dark"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Platform</h6>
                            <ul className="list-unstyled footer-links mb-0">
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Overview</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Features</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Pricing</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Releases</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Resources</h6>
                            <ul className="list-unstyled footer-links mb-0">
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Documentation</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Help Center</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Community</a></li>
                                <li className="mb-2"><a href="#" className="text-muted text-decoration-none hover-text-dark">Contact</a></li>
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
                    border-radius: 16px;
                    background: #ffffff;
                    border-color: #f0f0f0 !important;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
                }
                
                .portal-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
                    transform: translateY(-5px);
                    border-color: #e5e5e5 !important;
                }

                .icon-wrapper {
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background-color: #f8f9fa;
                    font-size: 28px;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }
                
                .portal-card:hover .icon-wrapper {
                    background-color: #212529;
                    color: #ffffff;
                }

                .minimalist-desc {
                    font-size: 0.95rem;
                    line-height: 1.6;
                }
                
                .transition-transform {
                    transition: transform 0.2s ease;
                }
                
                .portal-card:hover .hover-arrow i {
                    transform: translateX(5px);
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
            `}</style>
        </div>
    );
};

export default Home;
