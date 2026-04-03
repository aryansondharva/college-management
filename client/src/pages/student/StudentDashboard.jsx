import React, { useEffect, useState } from 'react';
import api from '../../api';

const StudentDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [attendance, setAttendance] = useState({ overall: [], monthly: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noticeRes, assignmentRes, attendanceRes] = await Promise.all([
                    api.get('/notices'),
                    api.get('/assignments'),
                    api.get('/attendance/my-detailed-attendance')
                ]);
                setNotices(noticeRes.data.notices.slice(0, 3));
                setAssignments(assignmentRes.data.assignments || []);
                setAttendance(attendanceRes.data);
                setLoading(true);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const getMonthName = (m) => {
        return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });
    };

    return (
        <div className="student-dashboard container-fluid px-0">
            <div className="d-flex flex-column mb-5 bg-primary text-white p-4 p-md-5 rounded-4 shadow-sm">
                <h2 className="fw-bolder mb-1">Welcome back!</h2>
                <p className="opacity-75 mb-0 fs-5 fw-medium">Ready to continue your academic journey? Check your allotted tasks below.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-12">
                   <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-success border-5">
                       <h5 className="fw-bold mb-4"><i className="bi bi-graph-up-arrow me-2 text-success"></i>Subject-wise Attendance</h5>
                       <div className="row g-3">
                           {attendance.overall.map(sub => {
                               const percent = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
                               return (
                                   <div key={sub.course_id} className="col-md-4 col-lg-3">
                                       <div className="p-3 rounded-4 bg-light border-0 shadow-hover transition-all h-100">
                                           <div className="d-flex justify-content-between align-items-start mb-2">
                                               <span className="badge bg-white text-dark border small fw-bold px-2 py-1 rounded-pill">{sub.subject_code}</span>
                                               <span className={`fw-bold ${percent < 75 ? 'text-danger' : 'text-success'}`}>{percent}%</span>
                                           </div>
                                           <h6 className="fw-bold mb-3">{sub.subject_name}</h6>
                                           <div className="progress mb-2" style={{ height: '6px' }}>
                                               <div 
                                                   className={`progress-bar ${percent < 75 ? 'bg-danger' : 'bg-success'}`} 
                                                   role="progressbar" 
                                                   style={{ width: `${percent}%` }}
                                               ></div>
                                           </div>
                                           <div className="text-muted small fw-bold d-flex justify-content-between">
                                               <span>Attended: {sub.attended}</span>
                                               <span>Total: {sub.total}</span>
                                           </div>
                                       </div>
                                   </div>
                               );
                           })}
                           {attendance.overall.length === 0 && (
                               <div className="col-12 text-center p-4 text-muted border border-dashed rounded-4">
                                   No attendance data available.
                               </div>
                           )}
                       </div>
                   </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 overflow-hidden border-start border-primary border-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0"><i className="bi bi-journal-check me-2 text-primary"></i>My Allotted Work</h5>
                            <span className="badge bg-light text-dark border-0 rounded-pill px-3 py-2 small fw-bold">Active {assignments.length} Tasks</span>
                        </div>
                        {/* Table for monthly view */}
                        <div className="mb-4">
                            <h6 className="fw-bold text-muted small text-uppercase mb-3">Monthly Breakdown</h6>
                            <div className="table-responsive">
                                <table className="table table-sm table-hover align-middle border-0 mb-0">
                                    <thead className="bg-light border-0">
                                        <tr>
                                            <th className="border-0 ps-3">Subject</th>
                                            <th className="border-0">Month</th>
                                            <th className="border-0 text-center">Attendance</th>
                                            <th className="border-0 text-end pe-3">Ratio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {attendance.monthly.slice(0, 8).map((m, idx) => (
                                            <tr key={idx} className="border-bottom border-light">
                                                <td className="ps-3 fw-bold small py-3">{m.subject_name}</td>
                                                <td className="text-muted small">{getMonthName(m.month)} {m.year}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${Math.round((m.attended / m.total) * 100) < 75 ? 'bg-soft-danger text-danger' : 'bg-soft-success text-success'} rounded-pill px-3 fw-bold`}>
                                                        {Math.round((m.attended / m.total) * 100)}%
                                                    </span>
                                                </td>
                                                <td className="text-end pe-3 small fw-bold">{m.attended} / {m.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-3 mt-4">
                            <h6 className="fw-bold text-muted small text-uppercase">Assignments</h6>
                            {assignments.map(task => (
                                <div key={task.id} className="p-4 rounded-4 bg-light border-0 transition-all hover-translate-x shadow-hover">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge ${task.target_audience === 'failure' ? 'bg-danger' : 'bg-dark'} rounded-pill px-3 py-1 small fw-bold`}>
                                                {task.target_audience === 'failure' ? 'Remedial Task' : 'General Task'}
                                            </span>
                                            <div className="badge bg-white text-dark border small fw-bold px-3 py-1 rounded-pill">{task.course_name}</div>
                                        </div>
                                        <div className="text-muted small fw-bold"><i className="bi bi-clock me-1 text-danger"></i> {new Date(task.deadline).toLocaleDateString()}</div>
                                    </div>
                                    <h6 className="fw-bold mb-2 fs-5 mt-3">{task.title}</h6>
                                    <p className="text-muted small mb-3 line-height-lg">{task.description}</p>
                                    <div className="d-flex align-items-center justify-content-between pt-3 border-top border-2 border-white">
                                        <div className="text-muted small fw-semi-bold">Assigned by: {task.teacher_first} {task.teacher_last}</div>
                                        <button className="btn btn-primary btn-sm px-4 fw-bold rounded-pill shadow-sm">Submit Work</button>
                                    </div>
                                </div>
                            ))}
                            {assignments.length === 0 && (
                                <div className="text-center p-5 text-muted small fw-bold bg-light rounded-4 mt-2 border border-dashed">
                                    <i className="bi bi-check2-circle fs-1 mb-3 text-success d-block opacity-25"></i>
                                    All caught up! No active tasks allotted.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 overflow-hidden border-start border-warning border-5">
                       <h5 className="fw-bold mb-4">Notices / Circulars</h5>
                       <div className="d-flex flex-column gap-4">
                           {notices.map(notice => (
                               <div key={notice.id} className="pb-3 border-bottom border-light last-child-no-border">
                                   <div className="text-muted small fw-bold mb-1">{new Date(notice.created_at).toLocaleDateString()}</div>
                                   <h6 className="fw-bold mb-1 fs-6 text-dark">{notice.title}</h6>
                                   <p className="text-muted small mb-0 fw-medium line-clamp-2">{notice.content}</p>
                               </div>
                           ))}
                       </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .hover-translate-x:hover { transform: translateX(10px); }
                .shadow-hover:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.05); background-color: #fff !important; cursor: pointer; }
                .line-height-lg { line-height: 1.65; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .bg-soft-success { background-color: #e6f7ec; }
                .bg-soft-danger { background-color: #fbe9e9; }
                .table-sm th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
