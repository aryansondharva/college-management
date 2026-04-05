import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, hasPermission } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = ({ isActive }) => 
    `nav-link px-3 py-2 w-100 mb-1 border-0 rounded-0 d-flex align-items-center justify-content-between small ${isActive ? 'active' : 'text-muted fw-semi-bold'}`;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar */}
      <div 
        className={`sidebar shadow-sm border-end bg-white ${isExpanded ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{ 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          zIndex: 1000, 
          width: isExpanded ? '280px' : '85px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div className="p-3 d-flex align-items-center border-bottom mb-2" style={{ height: '70px', overflow: 'hidden' }}>
           <img 
            src="/logo.png" 
            alt="Drop Logo" 
            style={{ 
              height: '45px', 
              width: 'auto', 
              minWidth: '45px',
              objectFit: 'contain',
              transition: 'all 0.3s'
            }} 
          />
          {isExpanded && <span className="ms-3 fw-bold fs-4 text-primary animate-fade-in">DROP</span>}
        </div>
        
        <div className="nav flex-column py-3 overflow-auto h-75 custom-scrollbar">
          <NavLink to="/dashboard" className={getLinkClass} title={!isExpanded ? "Dashboard" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-grid-fill fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
             </div>
          </NavLink>
          
          {(user?.role === 'admin') && (
            <NavLink to="/classes" className={getLinkClass} title={!isExpanded ? "Classes" : ""}>
               <div className="d-flex align-items-center">
                 <i className="bi bi-diagram-3 fs-5 text-center" style={{ width: '50px' }}></i>
                 <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Classes</span>
               </div>
               {isExpanded && <span className="badge bg-light text-dark border small fw-bold px-2 py-1 animate-fade-in">3</span>}
            </NavLink>
          )}

          {(user?.role === 'admin') && (
            <NavLink to="/students" className={getLinkClass} title={!isExpanded ? "Students" : ""}>
               <div className="d-flex align-items-center">
                 <i className="bi bi-people fs-5 text-center" style={{ width: '50px' }}></i>
                 <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Students</span>
               </div>
               {isExpanded && <i className="bi bi-chevron-down small opacity-50 ms-auto"></i>}
            </NavLink>
          )}

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <NavLink to="/attendance" className={getLinkClass} title={!isExpanded ? "Attendance" : ""}>
               <div className="d-flex align-items-center">
                 <i className="bi bi-calendar-check fs-5 text-center" style={{ width: '50px' }}></i>
                 <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Attendance</span>
               </div>
            </NavLink>
          )}

          <NavLink to="/attendance/report" className={getLinkClass} title={!isExpanded ? "Report" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-file-earmark-spreadsheet fs-6 text-center" style={{ width: '50px', paddingLeft: isExpanded ? '15px' : '0' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Report</span>
             </div>
          </NavLink>

          {(user?.role === 'admin') && (
            <>
              <NavLink to="/teachers" className={getLinkClass} title={!isExpanded ? "Teachers" : ""}>
                 <div className="d-flex align-items-center">
                   <i className="bi bi-person-badge fs-5 text-center" style={{ width: '50px' }}></i>
                   <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Teachers</span>
                 </div>
              </NavLink>

              <NavLink to="/employees" className={getLinkClass} title={!isExpanded ? "Employees" : ""}>
                 <div className="d-flex align-items-center">
                   <i className="bi bi-briefcase fs-5 text-center" style={{ width: '50px' }}></i>
                   <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Employees</span>
                 </div>
              </NavLink>
            </>
          )}

          {(hasPermission('view marks') || hasPermission('save marks')) && (
            <>
              <NavLink to="/exams" className={getLinkClass} title={!isExpanded ? "Exams / Grades" : ""}>
                 <div className="d-flex align-items-center">
                   <i className="bi bi-pencil-square fs-5 text-center" style={{ width: '50px' }}></i>
                   <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Exams / Grades</span>
                 </div>
                 {isExpanded && <i className="bi bi-chevron-down small opacity-50 ms-auto"></i>}
              </NavLink>
              <NavLink to="/admit-cards" className={getLinkClass} title={!isExpanded ? "Admit Cards" : ""}>
                 <div className="d-flex align-items-center">
                   <i className="bi bi-card-heading fs-6 text-center" style={{ width: '50px', paddingLeft: isExpanded ? '15px' : '0' }}></i>
                   <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Admit Cards</span>
                 </div>
              </NavLink>
              <NavLink to="/payslips" className={getLinkClass} title={!isExpanded ? "Payslips" : ""}>
                 <div className="d-flex align-items-center">
                   <i className="bi bi-receipt fs-6 text-center" style={{ width: '50px', paddingLeft: isExpanded ? '15px' : '0' }}></i>
                   <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Payslips</span>
                 </div>
              </NavLink>
            </>
          )}

          <NavLink to="/notices" className={getLinkClass} title={!isExpanded ? "Notice" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-megaphone fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Notice</span>
             </div>
          </NavLink>

          <NavLink to="/calendar" className={getLinkClass} title={!isExpanded ? "Event" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-calendar-event fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Event</span>
             </div>
          </NavLink>

          <NavLink to="/syllabus" className={getLinkClass} title={!isExpanded ? "Syllabus" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-file-earmark-pdf fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Syllabus</span>
             </div>
          </NavLink>

          <NavLink to="/routines" className={getLinkClass} title={!isExpanded ? "Routine" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-calendar3 fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Routine</span>
             </div>
          </NavLink>

          <NavLink to="/assignments" className={getLinkClass} title={!isExpanded ? "Assignments" : ""}>
             <div className="d-flex align-items-center">
               <i className="bi bi-file-earmark-text fs-5 text-center" style={{ width: '50px' }}></i>
               <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Assignments</span>
             </div>
          </NavLink>

          <hr className="mx-3 opacity-10 my-3" />

          {(user?.role === 'admin') && (
            <NavLink to="/settings" className={getLinkClass} title={!isExpanded ? "Academic" : ""}>
               <div className="d-flex align-items-center">
                 <i className="bi bi-tools fs-5 text-center" style={{ width: '50px' }}></i>
                 <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Academic</span>
               </div>
            </NavLink>
          )}

          {hasPermission('promote students') && (
            <NavLink to="/promotions" className={getLinkClass} title={!isExpanded ? "Promotion" : ""}>
               <div className="d-flex align-items-center">
                 <i className="bi bi-arrow-up-circle fs-5 text-center" style={{ width: '50px' }}></i>
                 <span className={`nav-text transition-all ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Promotion</span>
               </div>
            </NavLink>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        <header className="topbar bg-white px-4 border-bottom shadow-none d-flex justify-content-between align-items-center sticky-top" style={{zIndex: 999}}>
           <div className="text-muted small fw-medium">
              Current Academic Session <span className="opacity-75">2025-26</span>
           </div>
           
           <div className="d-flex align-items-center">
              <div className="dropdown">
                <button className="btn dropdown-toggle border-0 d-flex align-items-center p-0" id="user" data-bs-toggle="dropdown">
                   <span className="badge bg-light text-dark me-2 small fw-bold px-2 py-1 text-capitalize">{user?.role}</span>
                   <span className="fw-bold me-2 small text-dark d-none d-sm-inline">{user?.first_name} {user?.last_name}</span>
                   <i className="bi bi-chevron-down small text-muted"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-3 rounded-4">
                  <li><button className="dropdown-item py-2" onClick={() => navigate('/profile')}>My Profile</button></li>
                  <li><button className="dropdown-item py-2 text-danger fw-bold" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
           </div>
        </header>

        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
