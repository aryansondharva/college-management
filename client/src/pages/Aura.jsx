import React, { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Aura = () => {
    const { user } = useContext(AuthContext);
    const [unlocked, setUnlocked] = useState(false);
    const [auraToken, setAuraToken] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState({});

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/aura/unlock', { user_id: userId, password });
            setAuraToken(res.data.auraToken);
            setUnlocked(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Aura unlock failed.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuraData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/auth/aura/data', {
                headers: { 'x-aura-token': auraToken }
            });
            setLogs(res.data.logs);
        } catch (err) {
            if (err.response?.status === 401) {
                setUnlocked(false);
                setAuraToken('');
                setError('Aura session expired. Please unlock again.');
            } else {
                setError(err.response?.data?.message || 'Failed to fetch Aura data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (unlocked && auraToken) {
            fetchAuraData();
        }
    }, [unlocked, auraToken]);

    const togglePassword = (id) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLock = () => {
        setUnlocked(false);
        setAuraToken('');
        setUserId('');
        setPassword('');
        setLogs([]);
        setShowPasswords({});
    };

    if (user?.role !== 'admin') {
        return (
            <div className="container py-5 text-center">
                <div className="card border-0 shadow-sm rounded-4 p-5 bg-white">
                    <i className="bi bi-shield-lock fs-1 text-danger mb-3 d-block"></i>
                    <h4 className="fw-bold">Access Denied</h4>
                    <p className="text-muted">Aura is only accessible by administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">
                    <i className="bi bi-shield-lock-fill me-2 text-danger"></i>Aura
                    <span className="badge bg-danger bg-opacity-10 text-danger ms-2 rounded-pill px-3 py-2 small fw-bold">Privacy Mode</span>
                </h2>
                {unlocked && (
                    <button className="btn btn-outline-danger rounded-pill px-4 fw-bold" onClick={handleLock}>
                        <i className="bi bi-lock-fill me-1"></i>Lock Aura
                    </button>
                )}
            </div>

            {!unlocked ? (
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-body p-5 bg-white">
                                <div className="text-center mb-4">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-3" style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-shield-lock text-danger fs-1"></i>
                                    </div>
                                    <h4 className="fw-bold">Aura Privacy Lock</h4>
                                    <p className="text-muted small">Enter your Aura credentials to access student password data. This access is logged and time-limited.</p>
                                </div>

                                {error && (
                                    <div className="alert alert-danger rounded-3 py-2 px-3 small d-flex align-items-center mb-4 border-0">
                                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUnlock}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Aura User ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Aura user ID"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Aura Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter Aura password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-danger w-100 py-3 rounded-3 fw-bold" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Unlocking...</>
                                        ) : (
                                            <><i className="bi bi-unlock me-2"></i>Unlock Aura</>
                                        )}
                                    </button>
                                </form>
                            </div>
                            <div className="card-footer bg-dark text-white p-3 text-center small">
                                <i className="bi bi-info-circle me-1"></i> Access is time-limited to 15 minutes. All access is logged.
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="alert alert-warning border-0 rounded-3 d-flex align-items-center mb-4 shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                        <div>
                            <strong>Aura Privacy Mode Active.</strong> Student passwords are visible. This session expires in 15 minutes. Handle with care.
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status"></div>
                            <div className="text-muted small mt-2">Loading Aura data...</div>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold m-0"><i className="bi bi-key me-2 text-danger"></i>Student Password Activity</h5>
                                <div>
                                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold me-2" onClick={fetchAuraData}>
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-bold">{logs.length} Records</span>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4 border-0 small fw-bold text-muted text-uppercase">Student</th>
                                                <th className="border-0 small fw-bold text-muted text-uppercase">Enrollment No</th>
                                                <th className="border-0 small fw-bold text-muted text-uppercase">Action</th>
                                                <th className="border-0 small fw-bold text-muted text-uppercase">New Password</th>
                                                <th className="border-0 small fw-bold text-muted text-uppercase">Date & Time</th>
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
                                                        <span className={`badge rounded-pill px-3 py-2 fw-bold ${log.action === 'PASSWORD_RESET' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                            <i className={`bi me-1 ${log.action === 'PASSWORD_RESET' ? 'bi-key' : 'bi-pencil'}`}></i>{log.action}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {log.new_password ? (
                                                            <div className="d-flex align-items-center gap-2">
                                                                <code className="bg-light px-2 py-1 rounded small">
                                                                    {showPasswords[log.id] ? log.new_password : '••••••••'}
                                                                </code>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary border-0 p-1"
                                                                    onClick={() => togglePassword(log.id)}
                                                                    title={showPasswords[log.id] ? 'Hide' : 'Show'}
                                                                >
                                                                    <i className={`bi ${showPasswords[log.id] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {new Date(log.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}<br />
                                                        <span className="text-dark fw-bold">{new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                        <div className="text-muted" style={{ fontSize: '11px' }}>IST</div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {logs.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        <i className="bi bi-shield-check fs-1 d-block opacity-25 mb-2"></i>
                                                        No student password activity recorded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Aura;
