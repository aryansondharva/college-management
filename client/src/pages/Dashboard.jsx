import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    maleStudentCount: 0,
  });
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, noticeRes] = await Promise.all([
           api.get('/users/summary'),
           api.get('/notices')
        ]);
        setStats(res.data);
        setNotices(noticeRes.data.notices.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const totalStudents = stats.studentCount || 1;
  const malePercentage = Math.round((stats.maleStudentCount / totalStudents) * 100);
  const femalePercentage = 100 - malePercentage;

  return (
    <div className="container-fluid py-2 dashboard-container">
      {/* Top Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card stat-card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
            <div className="card-body d-flex align-items-center p-2">
               <div className="icon-box bg-dark bg-opacity-10 text-dark rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                   <i className="bi bi-people-fill fs-4"></i>
               </div>
               <div>
                   <h6 className="m-0 text-muted small fw-medium uppercase tracking-wider mb-1">Total Students</h6>
                   <h3 className="m-0 fw-bold text-dark">{stats.studentCount || 0}</h3>
               </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
             <div className="card-body d-flex align-items-center p-2">
                <div className="icon-box bg-dark bg-opacity-10 text-dark rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                    <i className="bi bi-person-workspace fs-4"></i>
                </div>
                <div>
                    <h6 className="m-0 text-muted small fw-medium uppercase tracking-wider mb-1">Total Teachers</h6>
                    <h3 className="m-0 fw-bold text-dark">{stats.teacherCount || 0}</h3>
                </div>
            </div>
          </div>
        </div>
         <div className="col-md-4">
          <div className="card stat-card shadow-sm border-0 rounded-4 p-3 bg-white h-100">
             <div className="card-body d-flex align-items-center p-2">
                <div className="icon-box bg-dark bg-opacity-10 text-dark rounded-3 d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                    <i className="bi bi-diagram-3-fill fs-4"></i>
                </div>
                <div>
                    <h6 className="m-0 text-muted small fw-medium uppercase tracking-wider mb-1">Total Classes</h6>
                    <h3 className="m-0 fw-bold text-dark">{stats.classCount || 0}</h3>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Progress Bar */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-3 gap-2">
              <h6 className="m-0 fw-bold text-dark">Student Demographics</h6>
              <div>
                  <span className="badge bg-dark text-white rounded-pill px-3 py-2 me-2 small fw-normal">Male: {malePercentage}%</span>
                  <span className="badge bg-secondary text-white rounded-pill px-3 py-2 small fw-normal">Female: {femalePercentage}%</span>
              </div>
          </div>
          <div className="progress rounded-pill bg-light overflow-hidden" style={{height: '14px'}}>
              <div className="progress-bar bg-dark" role="progressbar" style={{width: `${malePercentage}%`, transition: 'width 1s ease-in-out'}}></div>
              <div className="progress-bar bg-secondary" role="progressbar" style={{width: `${femalePercentage}%`, transition: 'width 1s ease-in-out'}}></div>
          </div>
      </div>

      {/* Main Grid */}
      <div className="row g-4 mb-4">
        {/* Welcome and Management */}
        <div className="col-lg-7 d-flex flex-column gap-4">
           {/* Welcome banner */}
           <div className="card welcome-card border-0 p-5 rounded-4 shadow-sm position-relative overflow-hidden bg-white">
              <div className="position-relative z-1">
                 <h2 className="fw-bold fs-3 mb-2 text-dark">Welcome to Unitransform, {user?.name || 'User'}!</h2>
                 <p className="text-muted fw-normal m-0 fs-6">
                    <i className="bi bi-stars me-2 text-dark"></i> Monitor and manage your institution efficiently.
                 </p>
              </div>
              <div className="position-absolute end-0 top-0 h-100 opacity-10 pe-4 d-flex align-items-center pointer-events-none">
                 <i className="bi bi-layers-fill" style={{fontSize: '8rem'}}></i>
              </div>
           </div>

           {/* Upcoming Events */}
           <div className="card bg-white mt-0 border-0 shadow-sm rounded-4 flex-grow-1">
               <div className="card-header border-0 bg-transparent p-4 pb-0 d-flex align-items-center justify-content-between">
                  <h6 className="m-0 fw-bold text-dark fs-5">Upcoming Events</h6>
                  <button className="btn btn-sm btn-light rounded-pill px-3 shadow-none text-dark fw-medium btn-hover-dark transition-all">View Calendar</button>
               </div>
               <div className="card-body p-4 pt-3">
                   <div className="d-flex align-items-center p-3 border rounded-3 bg-light mb-3 event-card transition-all">
                       <div className="date-box bg-white border rounded-3 p-2 text-center me-3 shadow-sm min-w-80">
                           <div className="small text-muted fw-bold text-uppercase">Dec</div>
                           <div className="fs-4 fw-bold text-dark">09</div>
                       </div>
                       <div className="flex-grow-1">
                           <h6 className="fw-bold mb-1 text-dark">Guardian Meeting</h6>
                           <p className="text-muted small mb-0"><i className="bi bi-clock me-1 text-secondary"></i> 11:00 AM - 3:00 PM</p>
                       </div>
                       <div className="d-none d-sm-block">
                           <span className="badge bg-white text-dark border rounded-pill px-3 shadow-sm fw-medium">Important</span>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* Notices Section */}
        <div className="col-lg-5">
           <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-white">
               <div className="card-header border-0 bg-transparent p-4 pb-3 d-flex justify-content-between align-items-center border-bottom border-light">
                  <h6 className="m-0 fw-bold text-dark fs-5">Recent Notices</h6>
                  <div className="btn-group shadow-none gap-2">
                     <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center transition-all btn-hover-dark" style={{width:'32px', height:'32px'}}><i className="bi bi-chevron-left small text-dark"></i></button>
                     <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center transition-all btn-hover-dark" style={{width:'32px', height:'32px'}}><i className="bi bi-chevron-right small text-dark"></i></button>
                  </div>
               </div>
               <div className="card-body p-4 pt-2 custom-scrollbar" style={{maxHeight: '400px', overflowY: 'auto'}}>
                   <ul className="list-group list-group-flush">
                       {notices && notices.length > 0 ? notices.map((notice, i) => (
                           <li className="list-group-item border-0 px-0 mb-4 bg-transparent pb-0" key={notice.id || i}>
                               <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="badge bg-light text-dark border px-3 py-1 rounded-pill small fw-medium"><i className="bi bi-megaphone me-1 text-muted"></i> Notice</span>
                                  <div className="text-muted small fw-medium">{new Date(notice.created_at).toLocaleDateString()}</div>
                               </div>
                               <h6 className="fw-bold text-dark mb-2">{notice.title}</h6>
                               <p className="text-muted small fw-normal mb-0 line-height-lg text-truncate-3">
                                  {notice.content}
                               </p>
                           </li>
                       )) : (
                           <div className="text-center p-5 text-muted small fw-medium bg-light rounded-3 mt-2 border border-dashed">No recent notices available</div>
                       )}
                   </ul>
               </div>
           </div>
        </div>
      </div>

      <style>{`
        .tracking-wider { letter-spacing: 0.05em; }
        .uppercase { text-transform: uppercase; }
        .min-w-80 { min-width: 80px; }
        .transition-all { transition: all 0.2s ease; }
        .event-card { border-color: #f1f5f9 !important; border-width: 1.5px !important; }
        .event-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.04) !important; background-color: #fff !important; }
        .line-height-lg { line-height: 1.6; }
        .text-truncate-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .pointer-events-none { pointer-events: none; }
        .border-dashed { border-style: dashed !important; border-width: 1.5px !important; border-color: #dee2e6 !important; }
        .btn-hover-dark:hover { background-color: #212529 !important; color: #fff !important; }
        .btn-hover-dark:hover i { color: #fff !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
