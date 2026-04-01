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

    // Parse the stored "**Title**\n\nContent" format
    const parseNotice = (noticeText) => {
        if (!noticeText) return { title: 'Notice', body: '' };
        if (noticeText.startsWith('**')) {
            const endBold = noticeText.indexOf('**', 2);
            if (endBold > 2) {
                const title = noticeText.substring(2, endBold);
                const body = noticeText.substring(endBold + 2).replace(/^\n\n/, '');
                return { title, body };
            }
        }
        return { title: 'Notice', body: noticeText };
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0"><i className="bi bi-megaphone-fill me-2 text-dark"></i>Noticeboard</h3>
                {hasPermission('create notices') && (
                    <button className="btn btn-dark fw-medium px-4 py-2 rounded-3 shadow-none" onClick={() => setShowForm(!showForm)}>
                       <i className={`bi bi-${showForm ? 'dash-lg' : 'plus-lg'} me-2`}></i> {showForm ? 'Cancel' : 'Post New Notice'}
                    </button>
                )}
            </div>

            {message.text && <div className={`alert alert-${message.type} border-0 shadow-sm mb-4 rounded-3`}>{message.text}</div>}

            {showForm && (
                <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
                    <div className="card-header bg-white border-bottom p-3 px-4">
                        <h6 className="mb-0 fw-bold">New Notice</h6>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handlePostNotice}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Notice Title</label>
                                <input type="text" className="form-control bg-light border-0 shadow-none" placeholder="e.g. Exam Schedule Update" value={newNotice.title} onChange={(e) => setNewNotice(p => ({...p, title: e.target.value}))} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">Content</label>
                                <textarea className="form-control bg-light border-0 shadow-none" rows="5" placeholder="Write the notice details here..." value={newNotice.content} onChange={(e) => setNewNotice(p => ({...p, content: e.target.value}))} required></textarea>
                            </div>
                            <div className="text-end">
                                <button type="submit" className="btn btn-dark px-5 py-2 fw-medium shadow-none">Post Notice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="row g-3">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-dark" role="status"></div></div>
                ) : notices.length > 0 ? (
                    notices.map(notice => {
                        const { title, body } = parseNotice(notice.notice);
                        const authorName = notice.first_name ? `${notice.first_name} ${notice.last_name}` : 'Admin';
                        return (
                            <div className="col-md-12" key={notice.id}>
                                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-dark text-white rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{width: '40px', height: '40px'}}>
                                                    <i className="bi bi-megaphone-fill"></i>
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-0">{title}</h5>
                                                    <div className="text-muted" style={{fontSize: '12px'}}>
                                                        <i className="bi bi-person me-1"></i>{authorName}
                                                        <span className="mx-2 opacity-50">&middot;</span>
                                                        <i className="bi bi-clock me-1"></i>
                                                        {new Date(notice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {' at '}
                                                        {new Date(notice.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </div>
                                            </div>
                                            {hasPermission('delete notices') && (
                                                <button className="text-danger fs-5 border-0 bg-transparent p-0 ms-2" title="Delete notice" onClick={() => handleDeleteNotice(notice.id)}>
                                                   <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            )}
                                        </div>
                                        {body && (
                                            <div className="mt-3 bg-light p-3 rounded-3 text-secondary" style={{whiteSpace: 'pre-wrap', fontSize: '0.95rem'}}>
                                               {body}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center py-5 text-muted">
                       <i className="bi bi-clipboard-x fs-1 mb-3 d-block"></i>
                       <h6 className="fw-normal">No active notices on the board.</h6>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageNotices;
