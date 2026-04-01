import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const roles = [
        {
            title: 'Student Portal',
            role: 'student',
            icon: 'bi-person-video3',
            color: 'primary',
            desc: 'Access your coursework, grades, and attendance seamlessly.'
        },
        {
            title: 'Teacher Portal',
            role: 'teacher',
            icon: 'bi-person-badge',
            color: 'success',
            desc: 'Manage your classes, assignments, and grade students.'
        },
        {
            title: 'Admin Portal',
            role: 'admin',
            icon: 'bi-shield-lock',
            color: 'dark',
            desc: 'Complete control over school administrative tasks.'
        }
    ];

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 px-4">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center" href="/">
                        <div className="bg-primary rounded-3 p-2 me-2 shadow-sm">
                            <i className="bi bi-grid-fill text-white fs-4"></i>
                        </div>
                        <span className="fw-bolder fs-3 text-dark tracking-tight">Unified<span className="text-primary text-opacity-75">transform</span></span>
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="container">
                    <div className="text-center mb-5 animate__animated animate__fadeIn">
                        <h6 className="text-primary fw-bold text-uppercase tracking-widest mb-3">Next Generation Management</h6>
                        <h1 className="display-3 fw-black text-dark mb-4">Welcome to <span className="text-primary border-bottom border-4 border-primary">Academic Portal</span></h1>
                        <p className="lead text-muted mx-auto col-lg-8 mb-5">
                            Unifiedtransform provides a modern, intuitive, and secure platform to connect students, teachers, and administrators in one unified ecosystem.
                        </p>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {roles.map((r, i) => (
                            <div key={i} className="col-md-4 col-sm-6 animate__animated animate__fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div 
                                    className="card h-100 border-0 shadow-lg p-4 text-center role-card transition-all"
                                    style={{ 
                                        borderRadius: '24px', 
                                        cursor: 'pointer',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onClick={() => navigate(`/login/${r.role}`)}
                                >
                                    <div className={`bg-${r.color} bg-opacity-10 text-${r.color} rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm`}
                                         style={{ width: '80px', height: '80px' }}>
                                        <i className={`bi ${r.icon} fs-1`}></i>
                                    </div>
                                    <h3 className="fw-bold mb-3">{r.title}</h3>
                                    <p className="text-muted mb-4">{r.desc}</p>
                                    <button className={`btn btn-${r.color} rounded-pill px-4 py-2 fw-bold w-100 mt-auto border-0 shadow`}>
                                        Access Login
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-4 text-center text-muted border-top bg-white">
                <p className="m-0 small fw-medium">&copy; 2026 Unifiedtransform. All rights reserved.</p>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                
                .role-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
                    background: #fff !important;
                }
                .transition-all {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .tracking-tight { letter-spacing: -0.025em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .fw-black { font-weight: 900; }
            `}</style>
        </div>
    );
};

export default Home;
