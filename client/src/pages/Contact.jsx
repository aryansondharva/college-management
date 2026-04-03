import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="contact-premium-wrapper">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light py-4 bg-transparent">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="/">
                        <img src="/logo.png" alt="Drop Logo" style={{ height: '45px', width: 'auto' }} />
                    </a>
                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        <ul className="navbar-nav align-items-center gap-3">
                            <li className="nav-item"><a className="nav-link text-dark-emphasis small" href="/">Home</a></li>
                            <li className="nav-item"><a className="nav-link text-dark-emphasis small" href="/overview">Overview</a></li>
                            <li className="nav-item ms-lg-3">
                                <button onClick={() => navigate('/#portals')} className="btn btn-dark rounded-pill px-4 py-2 small fw-medium">
                                    Portal Login
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="container flex-grow-1 d-flex align-items-center py-5">
                <div className="contact-main-card shadow-lg mx-auto w-100 border-0 rounded-5 overflow-hidden bg-white">
                    <div className="row g-0">
                        {/* Info Panel (Dark Side) */}
                        <div className="col-lg-5 p-4 p-md-5 bg-dark text-white d-flex flex-column justify-content-between">
                            <div>
                                <span className="badge bg-white text-dark mb-4 py-2 px-3 rounded-pill x-small fw-bold">CONTACT CENTER</span>
                                <h2 className="display-6 fw-bold mb-3 tracking-tight">Let's talk about <br />your future.</h2>
                                <p className="text-secondary small mb-5">Drop is defining the next generation of academic management. Get in touch to see how we can help you scale.</p>

                                <div className="info-blocks">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="info-icon-sm bg-white bg-opacity-10 rounded-3 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bi bi-geo-alt small"></i>
                                        </div>
                                        <span className="small opacity-75">Tech Assassin Office, Navsari, GJ 396445</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="info-icon-sm bg-white bg-opacity-10 rounded-3 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bi bi-envelope small"></i>
                                        </div>
                                        <span className="small opacity-75">hello@drop.edu</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="info-icon-sm bg-white bg-opacity-10 rounded-3 me-3 d-flex align-items-center justify-content-center">
                                            <i className="bi bi-phone small"></i>
                                        </div>
                                        <span className="small opacity-75">+91 99XXXXXXXX</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-top border-secondary">
                                <div className="d-flex gap-3">
                                    <a href="https://twitter.com/aryansondharva" target="_blank" rel="noopener noreferrer" className="text-white opacity-50 hover-opacity-100 transition-all"><i className="bi bi-twitter-x"></i></a>
                                    <a href="https://github.com/aryansondharva" target="_blank" rel="noopener noreferrer" className="text-white opacity-50 hover-opacity-100 transition-all"><i className="bi bi-github"></i></a>
                                    <a href="https://www.linkedin.com/in/aryan-sondharva" target="_blank" rel="noopener noreferrer" className="text-white opacity-50 hover-opacity-100 transition-all"><i className="bi bi-linkedin"></i></a>
                                </div>
                            </div>
                        </div>

                        {/* Form Panel (Light Side) */}
                        <div className="col-lg-7 p-4 p-md-5">
                            {submitted ? (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5 animate-fade-in">
                                    <div className="success-check mb-4 bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                                        <i className="bi bi-check-lg fs-1"></i>
                                    </div>
                                    <h3 className="fw-bold mb-2">Message Delivered</h3>
                                    <p className="text-muted small mb-0 px-md-5">We've received your inquiry. Our support unit will review and respond within 24 hours.</p>
                                    <button onClick={() => setSubmitted(false)} className="btn btn-outline-dark btn-sm rounded-pill px-4 mt-5">Send another</button>
                                </div>
                            ) : (
                                <>
                                    <h4 className="fw-bold text-dark mb-4">Send a message</h4>
                                    <form onSubmit={handleSubmit} className="row g-3">
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-2 text-uppercase">Full Name</label>
                                            <input type="text" className="form-control premium-input" placeholder="Enter name" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="x-small fw-bold text-muted mb-2 text-uppercase">Email Address</label>
                                            <input type="email" className="form-control premium-input" placeholder="Enter email" required />
                                        </div>
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted mb-2 text-uppercase">Subject Matter</label>
                                            <select className="form-select premium-input">
                                                <option>General Inquiry</option>
                                                <option>Product Sales</option>
                                                <option>Technical Support</option>
                                                <option>Partnerships</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="x-small fw-bold text-muted mb-2 text-uppercase">Detailed Message</label>
                                            <textarea className="form-control premium-input" placeholder="Tell us more about your needs..." rows="5" required></textarea>
                                        </div>
                                        <div className="col-12 mt-4 pt-2">
                                            <button type="submit" className="btn btn-dark w-100 rounded-3 py-3 fw-bold transition-all hover-lift">
                                                Submit Inquiry <i className="bi bi-arrow-right ms-2 fs-6"></i>
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Comprehensive Footer */}
            <footer className="site-footer bg-white border-top py-5 mt-auto">
                <div className="container py-4">
                    <div className="row g-5">
                        <div className="col-lg-4 col-md-6 text-start">
                            <div className="d-flex align-items-center mb-4">
                                <img src="/logo.png" alt="Drop Logo" className="me-2" style={{ height: '42px' }} />
                                <span className="fw-bold fs-4 text-dark">Drop</span>
                            </div>
                            <p className="text-muted small pe-lg-5 mb-4 line-height-lg">
                                Simplifying academic workflows with a minimalist approach. We build tools that help educational institutions focus on what matters most: education.
                            </p>
                        </div>
                        <div className="col-lg-4 col-md-6 text-start">
                            <h6 className="fw-bold mb-4 text-uppercase x-small text-dark letter-spacing-wider">Platform</h6>
                            <ul className="list-unstyled x-small mb-0 row text-muted lh-lg">
                                <div className="col-6">
                                    <li><a href="/overview" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Overview</a></li>
                                    <li><a href="/#features" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Features</a></li>
                                    <li><a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Pricing</a></li>
                                </div>
                                <div className="col-6">
                                    <li><a href="/docs" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark">Documentation</a></li>
                                    <li><a href="/contact" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-dark fw-bold">Contact</a></li>
                                </div>
                            </ul>
                        </div>
                        <div className="col-lg-4 col-md-6 text-start">
                            <h6 className="fw-bold mb-4 text-uppercase x-small text-dark letter-spacing-wider">Stay Updated</h6>
                            <p className="x-small text-muted mb-3">Join our network for the latest institutional updates.</p>
                            <div className="input-group mb-3 custom-input-group shadow-sm rounded-pill">
                                <input type="email" className="form-control border-light-subtle rounded-start-pill shadow-none px-3 font-size-sm" placeholder="Email address" />
                                <button className="btn btn-dark rounded-end-pill px-4 py-2" type="button">Subscribe</button>
                            </div>
                        </div>
                    </div>
                    <div className="border-top mt-5 pt-4 text-center">
                        <p className="m-0 x-small text-muted opacity-50">&copy; 2026 Drop. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Outfit:wght@200;400;600;800&display=swap');
                
                body, html {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background-color: #f7f9fc;
                    height: 100%;
                }

                .contact-premium-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
                
                .contact-main-card {
                    max-width: 1000px;
                    border: 1px solid #eee;
                    transition: all 0.5s ease;
                }

                .x-small { font-size: 0.65rem; letter-spacing: 0.1em; }
                .tracking-tight { letter-spacing: -0.04em; font-family: 'Outfit', sans-serif; }
                
                .info-icon-sm { width: 36px; height: 36px; min-width: 36px; }
                
                .premium-input {
                    background-color: #f8f9fa;
                    border: 1px solid #eee;
                    padding: 12px 16px;
                    font-size: 0.9rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                .premium-input:focus {
                    background-color: #fff;
                    border-color: #212529;
                }

                .success-check { width: 100px; height: 100px; }
                
                .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                .nav-link:hover { color: #000 !important; }
                
                @media (max-width: 991.98px) {
                    .contact-main-card { margin: 1rem; border-radius: 2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Contact;
