import React, { useEffect, useState, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [attendance, setAttendance] = useState({ overall: [], monthly: [] });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch attendance separately so it's never blocked by other API failures
            const attendanceRes = await api.get('/attendance/my-detailed-attendance');
            console.log('RAW attendance response:', JSON.stringify(attendanceRes.data));
            setAttendance(attendanceRes.data);
        } catch (err) {
            console.error('Attendance fetch error:', err.response?.status, err.response?.data, err.message);
        }

        try {
            const noticeRes = await api.get('/notices');
            setNotices(noticeRes.data.notices.slice(0, 3));
        } catch (err) { console.error('Notices error:', err.message); }

        try {
            const assignmentRes = await api.get('/assignments');
            setAssignments(assignmentRes.data.assignments || []);
        } catch (err) { console.error('Assignments error:', err.message); }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!user || !user.id) return;

        // Connect to socket server
        const socket = io(
            import.meta.env.VITE_API_URL?.replace('/api', '') || 
            (window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''), 
            {
                transports: ['websocket'],
                reconnection: true
            }
        );

        socket.on('connect', () => {
            console.log('Real-time connection established for student:', user.id);
        });

        // Listen for specific class updates (NEW logic)
        if (user.class_id) {
            console.log('Subscribing to real-time updates for class:', user.class_id);
            socket.on(`attendance-updated-class-${user.class_id}`, () => {
                console.log('Class attendance update received! Refreshing data...');
                fetchData();
            });
        }

        // Listen for specific student updates (Fallback)
        socket.on(`attendance-updated-${user.id}`, () => {
            console.log('Individual attendance update received! Refreshing data...');
            fetchData();
        });

        // Listen for general dashboard updates
        socket.on('attendance-dashboard-updated', () => {
            console.log('General attendance update received! Refreshing data...');
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const getMonthName = (m) => {
        return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <div className="text-muted fw-bold small">Loading your dashboard...</div>
            </div>
        </div>
    );

    return (
        <div className="student-dashboard container-fluid px-0">
            <div className="d-flex flex-column mb-5 bg-primary text-white p-4 p-md-5 rounded-4 shadow-sm position-relative overflow-hidden">
                <div className="position-relative" style={{ zIndex: 1 }}>
                    <h2 className="fw-bolder mb-1">Welcome back!</h2>
                    <p className="opacity-75 mb-0 fs-5 fw-medium">Ready to continue your academic journey? Check your allotted tasks below.</p>
                </div>
                {attendance.overall.length > 0 && (() => {
                    const totalAttended = attendance.overall.reduce((sum, sub) => sum + sub.attended, 0);
                    const totalLectures = attendance.overall.reduce((sum, sub) => sum + sub.total, 0);
                    const percent = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0;
                    return (
                        <div className="position-absolute end-0 top-50 translate-middle-y me-4 me-md-5 d-none d-md-flex align-items-center bg-white bg-opacity-25 rounded-4 p-3 border border-white border-opacity-25 backdrop-blur">
                            <div className="me-3 text-end">
                                <div className="text-white text-uppercase small fw-bold tracking-widest" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Overall Semester Aggregate</div>
                                <div className="text-white opacity-75 small">Percentage of classes attended</div>
                            </div>
                            <div className="display-4 fw-bold mb-0">
                                {percent}%
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Mobile View Overall Aggregate Card */}
            {attendance.overall.length > 0 && (() => {
                const totalAttended = attendance.overall.reduce((sum, sub) => sum + sub.attended, 0);
                const totalLectures = attendance.overall.reduce((sum, sub) => sum + sub.total, 0);
                const percent = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0;
                return (
                    <div className="d-md-none card border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white text-center position-relative overflow-hidden">
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" style={{ opacity: 0.1 }}></div>
                        <h6 className="text-uppercase small fw-bold tracking-widest text-white-50 mb-1">Overall Semester Aggregate</h6>
                        <div className="display-3 fw-bold">{percent}%</div>
                        <div className="small text-white-50">Percentage of classes attended ({totalAttended}/{totalLectures})</div>
                    </div>
                );
            })()}

            <div className="row g-4 mb-5">
                <div className="col-12">
                   <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white border-start border-success border-5">
                       <div className="card-header bg-white border-bottom p-4">
                           <h5 className="fw-bold m-0"><i className="bi bi-layers me-2 text-success"></i>Overall Semester Attendance</h5>
                       </div>
                       <div className="card-body p-0">
                           <div className="table-responsive">
                               <table className="table table-bordered align-middle text-center mb-0 border-0">
                                   <thead className="bg-light text-dark">
                                       <tr>
                                           {attendance.overall.map(sub => (
                                               <th key={sub.course_id} className="p-3 border-light border-start-0" style={{ minWidth: '120px' }}>
                                                   {sub.subject_code}
                                                   <div style={{ fontSize: '10px' }} className="text-muted fw-normal mt-1 text-wrap">{sub.subject_name}</div>
                                               </th>
                                           ))}
                                           <th className="p-3 bg-success bg-opacity-10 border-light border-start-0 border-end-0" style={{ minWidth: '150px' }}>Overall Sem Total / %</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       <tr>
                                           {attendance.overall.map(sub => {
                                               const percent = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
                                               return (
                                                   <td key={sub.course_id} className="p-4 border-light border-start-0">
                                                       <div className="fw-bold fs-6">
                                                           <span className={percent >= 75 ? "text-success" : "text-danger"}>{sub.attended}</span>
                                                           <span className="mx-1 text-muted">/</span>
                                                           <span>{sub.total}</span>
                                                       </div>
                                                       <div className={`badge rounded-pill mt-2 ${percent >= 75 ? 'bg-success text-success' : 'bg-danger text-danger'} bg-opacity-10 px-3 py-2 fw-bold`}>
                                                           {percent}%
                                                       </div>
                                                   </td>
                                               );
                                           })}
                                           <td className="p-4 bg-success bg-opacity-10 border-light border-start-0 border-end-0">
                                               {(() => {
                                                    const totalAttended = attendance.overall.reduce((sum, sub) => sum + sub.attended, 0);
                                                    const totalLectures = attendance.overall.reduce((sum, sub) => sum + sub.total, 0);
                                                    const percent = totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0;
                                                    return (
                                                        <>
                                                            <div className="fw-bold fs-5">{totalAttended} <span className="opacity-75 fs-6 fw-medium">/ {totalLectures}</span></div>
                                                            <div className={`badge mt-2 fs-6 ${totalLectures > 0 && percent >= 75 ? 'bg-success' : 'bg-danger'} shadow-sm px-3 py-2`}>
                                                                {percent}%
                                                            </div>
                                                        </>
                                                    );
                                               })()}
                                           </td>
                                       </tr>
                                   </tbody>
                               </table>
                               {attendance.overall.length === 0 && (
                                   <div className="text-center p-5 text-muted border-top border-light">
                                       No attendance data available for the current semester.
                                   </div>
                               )}
                           </div>
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
