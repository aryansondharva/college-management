import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Documentation = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { 
            id: 'intro', 
            title: 'Introduction', 
            items: [
                { id: 'what-is-drop', title: 'What is Drop?' },
                { id: 'architecture', title: 'Architecture' },
                { id: 'core-values', title: 'Core Values' }
            ] 
        },
        { 
            id: 'getting-started', 
            title: 'Getting Started', 
            items: [
                { id: 'web-setup', title: 'Web Setup' },
                { id: 'mobile-setup', title: 'Mobile App Setup' },
                { id: 'env-vars', title: 'Environment Variables' }
            ] 
        },
        { 
            id: 'student-guide', 
            title: 'Student Portal', 
            items: [
                { id: 'student-dash', title: 'Dashboard Overview' },
                { id: 'student-attendance', title: 'Tracking Attendance' },
                { id: 'student-grades', title: 'Viewing Grades' }
            ] 
        },
        { 
            id: 'teacher-guide', 
            title: 'Teacher Portal', 
            items: [
                { id: 'manage-classes', title: 'Managing Classes' },
                { id: 'mark-attendance', title: 'Marking Attendance' },
                { id: 'grading', title: 'Grading Assignments' }
            ] 
        },
        { 
            id: 'admin-guide', 
            title: 'Admin Controls', 
            items: [
                { id: 'user-management', title: 'User Management' },
                { id: 'academic-settings', title: 'Academic Settings' },
                { id: 'notices', title: 'Broadcasting Notices' }
            ] 
        },
        { 
            id: 'api-reference', 
            title: 'API Reference', 
            items: [
                { id: 'api-auth', title: 'Authentication' },
                { id: 'api-attendance', title: 'Attendance API' },
                { id: 'api-academic', title: 'Academic API' }
            ] 
        }
    ];

    const handleNavClick = (e, id) => {
        e.preventDefault();
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="docs-master">
            {/* Header */}
            <nav className="docs-header border-bottom sticky-top bg-white">
                <div className="container-fluid px-lg-5 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <a className="navbar-brand d-flex align-items-center text-decoration-none" href="/" target="_blank" rel="noopener noreferrer">
                            <img src="/logo.png" alt="Drop Logo" style={{ height: '35px' }} />
                            <span className="ms-2 fw-bold text-dark fs-5">Drop Docs</span>
                        </a>
                        <div className="ms-4 ps-4 border-start d-none d-md-block">
                            <span className="badge bg-light text-muted border px-2 py-1">v2.0.4-stable</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-4">
                        <div className="input-group search-pill d-none d-lg-flex">
                            <span className="input-group-text bg-light border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input type="text" className="form-control bg-light border-0 shadow-none ps-0" placeholder="Quick search..." style={{ width: '250px' }} />
                        </div>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-secondary"><i className="bi bi-github fs-4"></i></a>
                        <button onClick={() => navigate('/')} className="btn btn-dark rounded-pill btn-sm px-4">Exit Docs</button>
                    </div>
                </div>
            </nav>

            <div className="container-fluid px-lg-5">
                <div className="row">
                    {/* Left Navigation */}
                    <aside className="col-lg-3 docs-nav border-end pt-5 d-none d-lg-block sticky-top" style={{ top: '75px', height: 'calc(100vh - 75px)', overflowY: 'auto' }}>
                        <div className="pe-4 mb-5">
                            {sections.map((section, idx) => (
                                <div key={idx} className="mb-4">
                                    <h6 className="text-uppercase text-dark-emphasis fw-bold x-small mb-3 letter-spacing-wider">{section.title}</h6>
                                    <ul className="list-unstyled">
                                        {section.items.map((item, itemIdx) => (
                                            <li key={itemIdx} className="mb-1">
                                                <a 
                                                    href={`#${item.id}`} 
                                                    className={`nav-link-docs transition-all ${activeSection === item.id ? 'active' : ''}`}
                                                    onClick={(e) => handleNavClick(e, item.id)}
                                                >
                                                    {item.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="col-lg-7 col-md-12 py-5 px-lg-5">
                        {/* Intro Section */}
                        <section id="what-is-drop" className="mb-5 pt-4">
                            <h1 className="fw-black display-5 mb-4">Introduction</h1>
                            <p className="lead text-secondary-emphasis mb-5">Experience the new standard of institutional efficiency with Drop.</p>
                            
                            <h3 className="fw-bold mb-3">What is Drop?</h3>
                            <p className="mb-4">
                                Drop is a hyper-efficient, unified academic management system built on the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless experience across desktop and physical mobile devices, providing real-time data synchronization via Socket.io.
                            </p>
                            
                            <div className="row g-4 mb-5">
                                <div className="col-md-4">
                                    <div className="core-box p-4 border rounded-4 h-100">
                                        <i className="bi bi-lightning-charge text-warning fs-3 mb-3 d-block"></i>
                                        <h6 className="fw-bold">High Performance</h6>
                                        <p className="text-muted small mb-0">Sub-100ms response times for critical workflows.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="core-box p-4 border rounded-4 h-100">
                                        <i className="bi bi-shield-check text-primary fs-3 mb-3 d-block"></i>
                                        <h6 className="fw-bold">Supabase Auth</h6>
                                        <p className="text-muted small mb-0">Enterprise-grade security using JWT and OAuth.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="core-box p-4 border rounded-4 h-100">
                                        <i className="bi bi-phone text-success fs-3 mb-3 d-block"></i>
                                        <h6 className="fw-bold">Native Synergy</h6>
                                        <p className="text-muted small mb-0">Perfect sync between web dashboards and app views.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="architecture" className="mb-5">
                            <h3 className="fw-bold mb-3">Platform Architecture</h3>
                            <p>Drop's architecture is built on a clear separation of concerns, enabling high scalability and ease of maintenance.</p>
                            <div className="architecture-diagram p-5 bg-light rounded-5 text-center mb-4 border border-dashed">
                                <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
                                    <div className="arch-node p-3 bg-white border rounded shadow-sm">Client (Web/App)</div>
                                    <i className="bi bi-arrow-left-right fs-4"></i>
                                    <div className="arch-node p-3 bg-dark text-white rounded shadow-sm">Express Server</div>
                                    <i className="bi bi-arrow-left-right fs-4"></i>
                                    <div className="arch-node p-3 bg-white border rounded shadow-sm">MongoDB / Supabase</div>
                                </div>
                            </div>
                        </section>

                        <hr className="my-5 opacity-5" />

                        {/* Setup Section */}
                        <section id="web-setup" className="mb-5 scroll-margin">
                            <h2 className="fw-bold display-6 mb-4">Web Setup</h2>
                            <p className="text-muted">Initialize the web dashboard in your local environment.</p>
                            
                            <div className="setup-steps mb-5">
                                <div className="step-item d-flex gap-4 mb-4">
                                    <div className="step-count rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>1</div>
                                    <div>
                                        <h6 className="fw-bold">Clone and Install</h6>
                                        <p className="text-muted small">Fetch the latest source code from the main branch.</p>
                                        <div className="code-snippet bg-dark text-light p-3 rounded-3 mb-3">
                                            <code className="x-small text-white">git clone repository-url && cd client && npm i</code>
                                        </div>
                                    </div>
                                </div>
                                <div className="step-item d-flex gap-4 mb-4">
                                    <div className="step-count rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>2</div>
                                    <div>
                                        <h6 className="fw-bold">Configure Environment</h6>
                                        <p className="text-muted small">Duplicate the .env.example and populate with your credentials.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="env-vars" className="mb-5">
                            <h4 className="fw-bold mb-4">Environment Configuration</h4>
                            <div className="table-responsive rounded-4 border">
                                <table className="table table-hover mb-0">
                                    <thead className="bg-light">
                                        <tr className="small text-uppercase">
                                            <th className="ps-4">Key</th>
                                            <th>Description</th>
                                            <th>Required</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        <tr>
                                            <td className="ps-4"><code>VITE_API_URL</code></td>
                                            <td>Backend API base URL</td>
                                            <td>Yes</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4"><code>VITE_SUPABASE_URL</code></td>
                                            <td>Supabase project URL</td>
                                            <td>Yes</td>
                                        </tr>
                                        <tr>
                                            <td className="ps-4"><code>VITE_SUPABASE_ANON_KEY</code></td>
                                            <td>Project anonymous key</td>
                                            <td>Yes</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <hr className="my-5 opacity-5" />

                        {/* Feature Guides */}
                        <section id="student-attendance" className="mb-5">
                            <h2 className="fw-bold display-6 mb-4">Student Attendance</h2>
                            <p className="mb-4">Students can track their attendance across all subjects in real-time. The system calculates a percentage and provides color-coded labels for attendance health.</p>
                            <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000" className="img-fluid rounded-4 mb-4 border shadow-sm" alt="Attendance Guide" />
                        </section>

                        <section id="mark-attendance" className="mb-5">
                            <h2 className="fw-bold h4 mb-4">Teacher Controls: Marking Attendance</h2>
                            <div className="caution-box p-4 bg-warning-subtle border-start border-4 border-warning rounded-3 mb-4">
                                <p className="mb-0 small fw-medium text-warning-emphasis">Only verified teachers assigned to the specific subject can mark attendance for it.</p>
                            </div>
                            <ol className="text-muted small lh-lg">
                                <li>Navigate to **Manage Classes**.</li>
                                <li>Select your current subject and section.</li>
                                <li>Click on **Mark Attendance**.</li>
                                <li>The list of students will appear with toggles for Presence.</li>
                                <li>Submit the form to sync with the database via Socket.io.</li>
                            </ol>
                        </section>

                        <hr className="my-5 opacity-5" />

                        {/* API Reference */}
                        <section id="api-auth" className="mb-5">
                            <h2 className="fw-bold display-6 mb-4">Auth API Reference</h2>
                            <p className="text-muted">Dropdown uses Bearer Tokens for authentication.</p>
                            
                            <div className="api-card border rounded-4 overflow-hidden mb-4">
                                <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                                    <span className="badge bg-success-subtle text-success border">POST</span>
                                    <code className="text-dark small">/api/users/login</code>
                                </div>
                                <div className="p-4 bg-white">
                                    <h6 className="fw-bold x-small text-muted mb-3 text-uppercase">Request Body</h6>
                                    <div className="code-json bg-light p-3 rounded-3 mb-3 small">
                                        <pre className="mb-0"><code>{`{
  "email": "user@college.edu",
  "password": "hashed_password",
  "role": "student"
}`}</code></pre>
                                    </div>
                                    <h6 className="fw-bold x-small text-muted mb-3 text-uppercase">Response (200 OK)</h6>
                                    <div className="code-json bg-light p-3 rounded-3 mb-0 small">
                                        <pre className="mb-0"><code>{`{
  "token": "eyJhbG...",
  "user": { "id": "123", "name": "Aryan" }
}`}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="p-5 bg-dark text-white rounded-5 text-center my-5">
                            <h2 className="fw-bold mb-3">Still have questions?</h2>
                            <p className="opacity-75 mb-4">Our community is here to help.</p>
                            <button className="btn btn-outline-light rounded-pill px-5">Join the Community</button>
                        </div>
                    </main>

                    {/* Right Toolbar */}
                    <aside className="col-lg-2 docs-aside border-start d-none d-xl-block pt-5 sticky-top" style={{ top: '75px', height: 'calc(100vh - 75px)' }}>
                        <div className="ps-4 pt-2">
                            <h6 className="text-uppercase x-small fw-bold text-muted letter-spacing-wider mb-4">Quick Links</h6>
                            <ul className="list-unstyled">
                                <li className="mb-3"><a href="/contact" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted small"><i className="bi bi-chat-left-dots me-2"></i>Contact Support</a></li>
                                <li className="mb-3"><a href="#" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted small"><i className="bi bi-file-earmark-pdf me-2"></i>Download PDF</a></li>
                                <li className="mb-3"><a href="#" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted small"><i className="bi bi-bug me-2"></i>Report Issue</a></li>
                            </ul>
                            
                            <hr className="my-5" />
                            
                            <div className="feedback-box bg-light p-3 rounded-3">
                                <p className="x-small text-muted mb-2">Was this page helpful?</p>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-white border rounded shadow-none small px-3">Yes</button>
                                    <button className="btn btn-sm btn-white border rounded shadow-none small px-3">No</button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&family=JetBrains+Mono&display=swap');
                
                :root {
                    --docs-primary: #000;
                    --docs-bg: #fff;
                    --docs-muted: #6c757d;
                }

                .docs-master {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: var(--docs-bg);
                    min-height: 100vh;
                }

                .fw-black { font-weight: 800; }
                .x-small { font-size: 0.7rem; }
                .letter-spacing-wider { letter-spacing: 0.15em; }
                
                .nav-link-docs {
                    padding: 6px 0;
                    display: block;
                    text-decoration: none;
                    color: var(--docs-muted);
                    font-size: 0.88rem;
                    border-left: 2px solid transparent;
                }
                
                .nav-link-docs:hover {
                    color: var(--docs-primary);
                    padding-left: 4px;
                }
                
                .nav-link-docs.active {
                    color: var(--docs-primary);
                    font-weight: 600;
                    border-left-color: var(--docs-primary);
                    padding-left: 12px;
                }

                .search-pill { overflow: hidden; border-radius: 100px; }
                .search-pill .form-control::placeholder { color: #aaa; }

                .core-box { background: #fafafa; border-color: #eee !important; transition: all 0.3s ease; }
                .core-box:hover { background: #fff; border-color: #212529 !important; transform: translateY(-5px); }

                .code-snippet, .code-json {
                    font-family: 'JetBrains Mono', monospace;
                    border: 1px solid #2d2d2d;
                }
                
                .scroll-margin { scroll-margin-top: 100px; }

                .api-card { border-color: #eee !important; }
                
                .step-count { font-size: 0.8rem; font-weight: bold; }

                @media (max-width: 991.98px) {
                    .docs-header .container-fluid { padding: 0 1rem !important; }
                    .docs-content { padding-left: 1rem !important; padding-right: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Documentation;
