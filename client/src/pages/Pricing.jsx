import React from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <div className="pricing-page-container">
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
                            <li className="nav-item"><a className="nav-link text-muted" href="/overview" target="_blank" rel="noopener noreferrer">Overview</a></li>
                            <li className="nav-item"><a className="nav-link text-muted" href="/#features" target="_blank" rel="noopener noreferrer">Features</a></li>
                            <li className="nav-item ms-lg-3">
                                <button onClick={() => navigate('/#portals')} className="btn btn-dark rounded-pill px-4 py-2 fw-medium">
                                    Portal Login
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Pricing Hero */}
            <header className="pricing-hero py-5 bg-white border-bottom">
                <div className="container py-5 text-center">
                    <span className="badge bg-light text-dark border px-3 py-2 rounded-pill mb-4 fw-normal text-uppercase tracking-wider shadow-sm">
                        Simple & Transparent
                    </span>
                    <h1 className="display-4 fw-bold text-dark mb-4">Pricing for every institution.</h1>
                    <p className="lead text-muted max-w-700 mx-auto fw-light">
                        No hidden fees. No complicated contracts. Just elegant tools for education.
                    </p>
                </div>
            </header>

            {/* Pricing Section */}
            <section className="pricing-section py-5 bg-white">
                <div className="container py-5">
                    <div className="row g-4 justify-content-center">
                        {[
                            { name: 'Starter', price: 'Free', desc: 'Perfect for local workshops and small squads.', features: ['Up to 50 Students', 'Basic Attendance', 'Email Support'] },
                            { name: 'Pro', price: '$49', desc: 'Advanced tools for growing colleges.', features: ['Unlimited Students', 'Full Academic Suite', 'Priority Support'], popular: true },
                            { name: 'Institutional', price: 'Custom', desc: 'Enterprise-grade features for large universities.', features: ['Custom Integration', 'Dedicated Manager', 'API Access'] }
                        ].map((plan, i) => (
                            <div key={i} className="col-lg-4 col-md-6">
                                <div className={`pricing-card p-5 rounded-4 bg-white border h-100 position-relative ${plan.popular ? 'border-dark shadow-lg' : ''} transition-all`}>
                                    {plan.popular && <span className="badge bg-dark position-absolute top-0 start-50 translate-middle">Most Popular</span>}
                                    <h4 className="fw-bold text-dark mb-2">{plan.name}</h4>
                                    <div className="d-flex align-items-baseline mb-3">
                                        <span className="h1 fw-bold text-dark mb-0">{plan.price}</span>
                                        {plan.price !== 'Free' && plan.price !== 'Custom' && <span className="text-muted ms-1">/mo</span>}
                                    </div>
                                    <p className="text-muted small mb-4">{plan.desc}</p>
                                    <ul className="list-unstyled mb-5">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="mb-2 small text-muted">
                                                <i className="bi bi-check2 text-dark me-2"></i>{f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button className={`btn w-100 rounded-pill py-2 fw-medium ${plan.popular ? 'btn-dark' : 'btn-outline-dark'}`}>
                                        Get Started
                                    </button>
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
                                <li className="mb-2"><a href="/pricing" target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none hover-text-dark fw-bold">Pricing</a></li>
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
                
                .pricing-page-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #fdfdfd;
                }

                .max-w-700 { max-width: 700px; }
                .tracking-wider { letter-spacing: 0.05em; }
                .fs-7 { font-size: 0.8rem; }
                .line-height-lg { line-height: 1.7; }
                
                .pricing-card {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                
                .pricing-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                    border-color: #212529 !important;
                }

                @media (max-width: 991.98px) {
                    .pricing-hero h1 { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Pricing;
