import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res, assignmentRes] = await Promise.all([
                    api.get('/users/summary'),
                    api.get('/assignments')
                ]);
                setStats(res.data);
                setAssignments(assignmentRes.data.assignments || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <div className="teacher-dashboard px-2 px-md-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0"><i className="bi bi-mortarboard-fill me-2 text-primary"></i>My Workspace</h4>
                <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" onClick={() => navigate('/assignments')}>+ Allot New Work</button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                        <h6 className="text-muted small fw-bold mb-2">Total Classes</h6>
                        <h2 className="fw-bold mb-0">{stats.classCount || 0}</h2>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white h-100">
                        <h6 className="opacity-75 small fw-bold mb-2">Given Assignments</h6>
                        <h2 className="fw-bold mb-0">{assignments.length}</h2>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold m-0">Recent Delegations</h5>
                            <button className="btn btn-link text-primary fw-bold text-decoration-none small p-0" onClick={() => navigate('/assignments')}>View All <i className="bi bi-arrow-right"></i></button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-borderless align-middle custom-table">
                                <thead className="bg-light text-muted small fw-bold">
                                    <tr>
                                        <th className="px-3">CLASS</th>
                                        <th>SUBJECT</th>
                                        <th>DUE DATE</th>
                                        <th>AUDIENCE</th>
                                        <th className="text-end">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.slice(0, 5).map(task => (
                                        <tr key={task.id} className="border-bottom border-light">
                                            <td className="px-3 fw-bold small text-dark">{task.class_name}</td>
                                            <td className="small text-muted">{task.course_name}</td>
                                            <td className="small text-muted">{new Date(task.deadline).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${task.target_audience === 'failure' ? 'bg-danger' : 'bg-light text-dark'} rounded-pill px-3 py-1 small fw-medium`}>
                                                    {task.target_audience}
                                                </span>
                                            </td>
                                            <td className="text-end text-muted small">Active</td>
                                        </tr>
                                    ))}
                                    {assignments.length === 0 && <tr><td colSpan="5" className="text-center p-5 text-muted small fw-bold">No active assignments assigned yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
