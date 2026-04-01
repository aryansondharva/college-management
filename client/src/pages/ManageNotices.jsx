import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageNotices = () => {
    const { hasPermission } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notices');
            setNotices(res.data.notices);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handlePostNotice = async (e) => {
        e.preventDefault();
        try {
            await api.post('/notices', newNotice);
            setMessage({ text: 'Notice posted successfully!', type: 'success' });
            setNewNotice({ title: '', content: '' });
            setShowForm(false);
            fetchNotices();
        } catch (err) { setMessage({ text: 'Error posting notice.', type: 'danger' }); }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm("Are you sure you want to delete this notice?")) return;
        try {
            await api.delete(`/notices/${id}`);
            fetchNotices();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0"><i className="bi bi-megaphone me-2 text-danger"></i>Noticeboard</h2>
                {hasPermission('create notices') && (
                    <button className="btn btn-danger icon-link fw-bold px-4" onClick={() => setShowForm(!showForm)}>
                       <i className={`bi bi-${showForm ? 'dash-lg' : 'plus-lg'} me-1`}></i> {showForm ? 'Cancel' : 'Post New Notice'}
                    </button>
                )}
            </div>

            {message.text && <div className={`alert alert-${message.type} border-0 shadow-sm mb-4`}>{message.text}</div>}

            {showForm && (
                <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-body p-4">
                        <form onSubmit={handlePostNotice}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Notice Title</label>
                                <input type="text" className="form-control" value={newNotice.title} onChange={(e) => setNewNotice(p => ({...p, title: e.target.value}))} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Content</label>
                                <textarea className="form-control" rows="5" value={newNotice.content} onChange={(e) => setNewNotice(p => ({...p, content: e.target.value}))} required></textarea>
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-dark px-5 py-2 fw-bold">Post Notice Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-danger" role="status"></div></div>
                ): notices.length > 0 ? (
                    notices.map(notice => (
                        <div className="col-md-12" key={notice.id}>
                            <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h4 className="fw-bold mb-1">{notice.title}</h4>
                                        {hasPermission('delete notices') && (
                                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDeleteNotice(notice.id)}>
                                               <i className="bi bi-trash fs-5"></i>
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-muted small mb-3">
                                        <i className="bi bi-clock me-1"></i> Posted on {new Date(notice.created_at).toLocaleDateString()} at {new Date(notice.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="card-text bg-light p-4 rounded-3 text-secondary" style={{whiteSpace: 'pre-wrap'}}>
                                       {notice.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5 text-muted">
                       <i className="bi bi-clipboard-x fs-1 mb-3"></i>
                       <h5>No active notices on the board.</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageNotices;
