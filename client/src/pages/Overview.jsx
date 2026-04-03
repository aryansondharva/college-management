import React from 'react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
    const navigate = useNavigate();

    return (
        <div className="overview-page-container">
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
                            <li className="nav-item"><a className="nav-link text-muted" href="/" target="_blank" rel="noopener noreferrer">Home</a></li>
                            <li className="nav-item"><a className="nav-link text-dark fw-medium active" href="/overview" target="_blank" rel="noopener noreferrer">Overview</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="/#features" target="_blank" rel="noopener noreferrer">Features</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="/#about" target="_blank" rel="noopener noreferrer">About</a></li>
                            <li className="nav-item ms-lg-3">
                                <button onClick={() => navigate('/#portals')} className="btn btn-dark rounded-pill px-4 py-2 fw-medium">
                                    Portal Login
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Overview Hero Section */}
            <header className="overview-hero py-5 bg-white border-bottom">
                <div className="container py-4 text-center">
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-4 fw-normal text-uppercase tracking-wider shadow-sm">
                        Platform Overview
                    </span>
                    <h1 className="display-4 fw-bold text-dark mb-4">A Unified Academic Ecosystem.</h1>
                    <p className="lead text-muted max-w-700 mx-auto fw-light">
                        Explore how Drop transforms institutional workflows through simplicity, speed, and elegance.
                    </p>
                            </div>
            </header>

            {/* Main Content */}
            <main className="overview-content py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                            <div className="col-lg-6">
                            <h2 className="display-6 fw-bold text-dark mb-4">Connecting education, simplified.</h2>
                            <p className="lead text-muted fw-light mb-4">
                                Drop is more than just a management system. It's a cohesive digital environment built specifically to address the modern challenges of educational institutions.
                            </p>
                            <div className="overview-features mt-5">
                                {[
                                    { title: 'Centralized Data', desc: 'One source of truth for students, teachers, and admins.', icon: 'bi-database-check' },
                                    { title: 'Cloud-Powered', desc: 'Access your dashboard from anywhere, on any device.', icon: 'bi-cloud-check' },
                                    { title: 'Secure & Private', desc: 'Enterprise-grade security for sensitive academic records.', icon: 'bi-shield-lock' }
                                ].map((item, idx) => (
                                    <div key={idx} className="d-flex align-items-start mb-4">
                                        <div className="overview-icon-small me-3">
                                            <i className={`bi ${item.icon} text-dark`}></i>
                                    </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{item.title}</h6>
                                            <p className="text-muted small mb-0">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="overview-visual p-5 bg-light rounded-5 border text-center">
                                <div className="ecosystem-graphic position-relative">
                                    <div className="main-node bg-dark text-white rounded-circle d-flex align-items-center justify-content-center shadow-lg mx-auto mb-4" style={{ width: '120px', height: '120px', fontSize: '28px' }}>
                                        Drop
                                    </div>
                                    <div className="row g-4 pt-4">
                                        <div className="col-4">
                                            <div className="p-4 bg-white border rounded-4 shadow-sm hover-up">
                                                <i className="bi bi-mortarboard fs-3"></i>
                                                <p className="small fw-bold mb-0 mt-2">Students</p>
                                    </div>
                                </div>
                                        <div className="col-4">
                                            <div className="p-4 bg-white border rounded-4 shadow-sm hover-up">
                                                <i className="bi bi-person-workspace fs-3"></i>
                                                <p className="small fw-bold mb-0 mt-2">Teachers</p>
                            </div>
                                                </div>
                                        <div className="col-4">
                                            <div className="p-4 bg-white border rounded-4 shadow-sm hover-up">
                                                <i className="bi bi-shield-check fs-3"></i>
                                                <p className="small fw-bold mb-0 mt-2">Admins</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5 pt-5 text-center g-4">
                        <div className="col-md-4">
                            <div className="stats-card p-4 border rounded-4">
                                <h2 className="fw-bold text-dark mb-2">99.9%</h2>
                                <p className="text-muted mb-0">Uptime Reliability</p>
                                    </div>
                                </div>
                        <div className="col-md-4">
                            <div className="stats-card p-4 border rounded-4">
                                <h2 className="fw-bold text-dark mb-2">10k+</h2>
                                <p className="text-muted mb-0">Active Students</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stats-card p-4 border rounded-4">
                                <h2 className="fw-bold text-dark mb-2">24/7</h2>
                                <p className="text-muted mb-0">System Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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
                                <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-twitter-x"></i></a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-github"></i></a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted hover-text-dark"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-4 text-uppercase text-dark fs-7 tracking-wider">Platform</h6>
                            <ul className="list-unstyled footer-links mb-0">
                                <li className="mb-2"><a href="/overview" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Overview</a></li>
                                <li className="mb-2"><a href="/#features" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Features</a></li>
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
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                body, html {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .overview-page-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #fdfdfd;
                }

                .max-w-700 { max-width: 700px; }
                .tracking-wider { letter-spacing: 0.05em; }
                .fs-7 { font-size: 0.8rem; }
                .line-height-lg { line-height: 1.7; }
                
                .overview-icon-small {
                    width: 44px;
                    height: 44px;
                    min-width: 44px;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    background: #f8f9fa;
                    border-radius: 12px;
                    font-size: 1.4rem;
                    transition: all 0.3s ease;
                }
                
                .overview-icon-small:hover {
                    background: #212529;
                    color: #fff;
                }

                .overview-visual { transition: transform 0.4s ease; }
                .overview-visual:hover { transform: translateY(-5px); }

                .main-node { animation: pulse 3s infinite; transition: transform 0.3s ease; }
                .main-node:hover { transform: scale(1.1); }

                .hover-up { transition: all 0.3s ease; }
                .hover-up:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08) !important;
                    border-color: #212529 !important;
                }

                .stats-card { background: #fff; transition: all 0.3s ease; }
                .stats-card:hover { border-color: #212529; transform: translateY(-5px); }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(33, 37, 41, 0.4); }
                    70% { box-shadow: 0 0 0 25px rgba(33, 37, 41, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(33, 37, 41, 0); }
                }

                @media (max-width: 991.98px) {
                    .overview-hero h1 { font-size: 2.5rem; }
                    .overview-content { padding-top: 2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Overview;
