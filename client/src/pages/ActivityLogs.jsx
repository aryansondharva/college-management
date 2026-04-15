import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ActivityLogs = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/auth/activity-logs');
                setLogs(res.data.logs);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load activity logs.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0"><i className="bi bi-clipboard-data me-2 text-warning"></i>Student Activity Logs</h2>
                <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-bold">{logs.length} Records</span>
            </div>

            {error && (
                <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4">{error}</div>
            )}

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="card-header bg-white py-3 border-0">
                    <h5 className="fw-bold m-0"><i className="bi bi-shield-lock me-2 text-primary"></i>Password Reset Activity</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 border-0 small fw-bold text-muted text-uppercase">Student</th>
                                    <th className="border-0 small fw-bold text-muted text-uppercase">Enrollment No</th>
                                    <th className="border-0 small fw-bold text-muted text-uppercase">Action</th>
                                    <th className="border-0 small fw-bold text-muted text-uppercase">Description</th>
                                    <th className="pe-4 border-0 small fw-bold text-muted text-uppercase">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-bottom border-light">
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{log.first_name} {log.last_name}</div>
                                            <div className="small text-muted">{log.email}</div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-bold">
                                                {log.enrollment_no || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 fw-bold">
                                                <i className="bi bi-key me-1"></i>{log.action}
                                            </span>
                                        </td>
                                        <td className="small text-muted" style={{ maxWidth: '300px' }}>{log.description}</td>
                                        <td className="pe-4 small text-muted">
                                            {new Date(log.created_at).toLocaleDateString()}<br />
                                            <span className="text-dark fw-bold">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="bi bi-clipboard-check fs-1 d-block opacity-25 mb-2"></i>
                                            No activity logs yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
