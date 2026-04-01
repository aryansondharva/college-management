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
    <div className="container-fluid py-1">
      {/* Top Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-pill p-2">
            <div className="card-body d-flex align-items-center justify-content-between p-1 px-4">
               <div className="d-flex align-items-center">
                  <i className="bi bi-people-fill text-dark me-3 fs-3"></i>
                  <h6 className="m-0 fw-bold text-dark fs-6">Total Students</h6>
               </div>
               <div className="badge-count fs-6" style={{width: '32px', height: '32px'}}>{stats.studentCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-pill p-2">
             <div className="card-body d-flex align-items-center justify-content-between p-1 px-4">
              <div className="d-flex align-items-center">
                 <i className="bi bi-person-badge-fill text-dark me-3 fs-3"></i>
                 <h6 className="m-0 fw-bold text-dark fs-6">Total Teachers</h6>
              </div>
              <div className="badge-count fs-6" style={{width: '32px', height: '32px'}}>{stats.teacherCount}</div>
            </div>
          </div>
        </div>
         <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-pill p-2">
             <div className="card-body d-flex align-items-center justify-content-between p-1 px-4">
              <div className="d-flex align-items-center">
                 <i className="bi bi-diagram-3-fill text-dark me-3 fs-3"></i>
                 <h6 className="m-0 fw-bold text-dark fs-6">Total Classes</h6>
              </div>
              <div className="badge-count fs-6" style={{width: '32px', height: '32px'}}>{stats.classCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Progress Bar */}
      <div className="mb-4 d-flex align-items-center">
          <h6 className="m-0 me-3 fw-bold text-muted small">Students %</h6>
          <span className="badge bg-primary text-white rounded-pill px-3 py-1 me-2 small">Male</span>
          <span className="badge bg-info text-white rounded-pill px-3 py-1 me-4 small">Female</span>
          
          <div className="flex-grow-1 position-relative d-flex bg-info bg-opacity-50 rounded-pill" style={{height: '18px', overflow: 'hidden'}}>
              <div className="h-100 bg-primary d-flex align-items-center justify-content-center text-white small fw-bold" style={{width: `${malePercentage}%`, transition: 'width 0.5s'}}>
                  {malePercentage}%
              </div>
              <div className="h-100 text-white small fw-bold d-flex align-items-center justify-content-center" style={{width: `${femalePercentage}%`}}>
                  {femalePercentage}%
              </div>
          </div>
      </div>

      {/* Main Grid */}
      <div className="row g-3">
        {/* Welcome and Management */}
        <div className="col-lg-7">
           <div className="card welcome-card border-0 p-4 rounded-4 mb-3 shadow-lg overflow-hidden position-relative">
              <div className="position-relative z-1">
                 <h2 className="fw-bolder fs-2 mb-2 letter-spacing-1">Welcome to Unifiedtransform!</h2>
                 <p className="fs-6 opacity-90 fw-medium m-0 flex align-items-center">
                    <i className="bi bi-emoji-smile me-2"></i> Thanks for your love and support.
                 </p>
              </div>
           </div>

           <div className="card bg-white border-0 shadow-sm rounded-4 p-4">
               <div className="d-flex justify-content-between align-items-center">
                  <h3 className="m-0 fw-bolder text-dark opacity-100 letter-spacing-1">Manage school better</h3>
                  <div className="small fw-bold text-muted d-flex align-items-center">
                     with <i className="bi bi-lightning-fill text-dark mx-1"></i> <span className="text-primary">Unifiedtransform</span> <i className="bi bi-lightning-fill text-dark mx-1"></i>
                  </div>
               </div>
           </div>

           <div className="card bg-white mt-3 border-0 shadow-sm rounded-4">
               <div className="card-header border-0 bg-transparent p-3 pb-0 d-flex align-items-center">
                  <i className="bi bi-calendar3 text-dark fs-5 me-2"></i>
                  <h6 className="m-0 fw-bold">Events</h6>
               </div>
               <div className="card-body p-3 pt-2">
                   <div className="text-center p-4 border rounded-4 bg-light bg-opacity-50 mb-2 border-dashed">
                       <h3 className="fw-bolder mb-0 text-dark">December 9, 2021</h3>
                       <p className="text-muted small fw-bold mb-3">Thursday</p>
                       <div className="p-3 bg-info bg-opacity-25 border border-info rounded-4 text-start">
                          <div className="text-info fw-bold small mb-1">11:00 - 3:00</div>
                          <div className="text-dark fw-bold small">Guardian Meeting</div>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* Notices Section */}
        <div className="col-lg-5">
           <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
               <div className="card-header border-0 bg-transparent p-3 d-flex justify-content-between align-items-center border-bottom border-light">
                  <div className="d-flex align-items-center">
                     <i className="bi bi-megaphone text-dark fs-5 me-2"></i>
                     <h6 className="m-0 fw-bold text-dark">Notices</h6>
                  </div>
                  <div className="btn-group shadow-none">
                     <button className="btn btn-outline-light border text-muted px-3 btn-sm fw-bold small">« Prev</button>
                     <button className="btn btn-outline-primary border text-primary px-3 btn-sm fw-bold small">Next »</button>
                  </div>
               </div>
               <div className="card-body p-3">
                   <ul className="list-group list-group-flush">
                       {notices.length > 0 ? notices.map((notice, i) => (
                           <li className="list-group-item border-0 px-0 mb-4 bg-transparent" key={notice.id}>
                               <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="text-muted tiny fw-bold tracking-tight">Published at: {new Date(notice.created_at).toLocaleDateString()}</div>
                                  <i className="bi bi-chevron-down text-muted small"></i>
                               </div>
                               <h5 className="fw-bolder text-dark mb-1 letter-spacing-1">{notice.title}</h5>
                               <p className="text-muted small fw-medium text-justify mb-0 line-height-relaxed border-bottom pb-3">
                                  {notice.content.length > 150 ? notice.content.substring(0, 150) + "..." : notice.content}
                               </p>
                           </li>
                       )) : (
                           <div className="text-center p-5 text-muted small fw-bold bg-light rounded-4">No recent notices.</div>
                       )}
                   </ul>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
