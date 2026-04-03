import React, { useContext, useState } from 'react';
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

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar */}
      <div className="sidebar shadow-sm border-end bg-white" style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 1000, minWidth: '240px' }}>
        <div className="p-3 d-flex align-items-center border-bottom mb-2">
           <img src="/logo.png" alt="Drop Logo" className="me-2" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
           <span className="h6 fw-bolder m-0 tracking-tight text-dark">Drop</span>
        </div>
        
        <div className="nav flex-column py-3 overflow-auto h-75 custom-scrollbar">
          <NavLink to="/dashboard" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-grid-fill me-3 fs-5"></i> Dashboard</div>
          </NavLink>
          
          {(user?.role === 'admin') && (
            <NavLink to="/classes" className={getLinkClass}>
               <div className="d-flex align-items-center"><i className="bi bi-diagram-3 me-3 fs-5"></i> Classes</div>
               <span className="badge bg-light text-dark border small fw-bold px-2 py-1">3</span>
            </NavLink>
          )}

          {(user?.role === 'admin') && (
            <NavLink to="/students" className={getLinkClass}>
               <div className="d-flex align-items-center"><i className="bi bi-people me-3 fs-5"></i> Students</div>
               <i className="bi bi-chevron-down small opacity-50"></i>
            </NavLink>
          )}

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <NavLink to="/attendance" className={getLinkClass}>
               <div className="d-flex align-items-center"><i className="bi bi-calendar-check me-3 fs-5"></i> Attendance</div>
            </NavLink>
          )}

          <NavLink to="/attendance/report" className={getLinkClass}>
             <div className="d-flex align-items-center ps-3 small opacity-75">
               <i className="bi bi-file-earmark-spreadsheet me-3 fs-6"></i> Report
             </div>
          </NavLink>

          {(user?.role === 'admin') && (
            <>
              <NavLink to="/teachers" className={getLinkClass}>
                 <div className="d-flex align-items-center"><i className="bi bi-person-badge me-3 fs-5"></i> Teachers</div>
              </NavLink>

              <NavLink to="/employees" className={getLinkClass}>
                 <div className="d-flex align-items-center"><i className="bi bi-briefcase me-3 fs-5"></i> Employees</div>
              </NavLink>
            </>
          )}

          {(hasPermission('view marks') || hasPermission('save marks')) && (
            <>
              <NavLink to="/exams" className={getLinkClass}>
                 <div className="d-flex align-items-center"><i className="bi bi-pencil-square me-3 fs-5"></i> Exams / Grades</div>
                 <i className="bi bi-chevron-down small opacity-50"></i>
              </NavLink>
              <NavLink to="/admit-cards" className={getLinkClass}>
                 <div className="d-flex align-items-center ps-3 small opacity-75">
                   <i className="bi bi-card-heading me-3 fs-6"></i> Admit Cards
                 </div>
              </NavLink>
              <NavLink to="/payslips" className={getLinkClass}>
                 <div className="d-flex align-items-center ps-3 small opacity-75">
                   <i className="bi bi-receipt me-3 fs-6"></i> Payslips
                 </div>
              </NavLink>
            </>
          )}

          <NavLink to="/notices" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-megaphone me-3 fs-5"></i> Notice</div>
          </NavLink>

          <NavLink to="/calendar" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-calendar-event me-3 fs-5"></i> Event</div>
          </NavLink>

          <NavLink to="/syllabus" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-file-earmark-pdf me-3 fs-5"></i> Syllabus</div>
          </NavLink>

          <NavLink to="/routines" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-calendar3 me-3 fs-5"></i> Routine</div>
          </NavLink>

          <NavLink to="/assignments" className={getLinkClass}>
             <div className="d-flex align-items-center"><i className="bi bi-file-earmark-text me-3 fs-5"></i> Assignments</div>
          </NavLink>

          <hr className="mx-3 opacity-10 my-3" />

          {(user?.role === 'admin') && (
            <NavLink to="/settings" className={getLinkClass}>
               <div className="d-flex align-items-center"><i className="bi bi-tools me-3 fs-5"></i> Academic</div>
            </NavLink>
          )}

          {hasPermission('promote students') && (
            <NavLink to="/promotions" className={getLinkClass}>
               <div className="d-flex align-items-center"><i className="bi bi-arrow-up-circle me-3 fs-5"></i> Promotion</div>
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
