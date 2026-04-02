import React, { useEffect, useState } from 'react';
import api from '../../api';

const StudentDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noticeRes, assignmentRes] = await Promise.all([
                    api.get('/notices'),
                    api.get('/assignments')
                ]);
                setNotices(noticeRes.data.notices.slice(0, 3));
                setAssignments(assignmentRes.data.assignments || []);
                setLoading(true);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="student-dashboard container-fluid px-0">
            <div className="d-flex flex-column mb-5 bg-primary text-white p-4 p-md-5 rounded-4 shadow-sm">
                <h2 className="fw-bolder mb-1">Welcome back! 👋</h2>
                <p className="opacity-75 mb-0 fs-5 fw-medium">Ready to continue your academic journey? Check your allotted tasks below.</p>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 overflow-hidden border-start border-primary border-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0"><i className="bi bi-journal-check me-2 text-primary"></i>My Allotted Work</h5>
                            <span className="badge bg-light text-dark border-0 rounded-pill px-3 py-2 small fw-bold">Active {assignments.length} Tasks</span>
                        </div>
                        <div className="d-flex flex-column gap-3">
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
            `}</style>
        </div>
    );
};

export default StudentDashboard;
