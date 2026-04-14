import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ManageAssignments = () => {
    const { hasPermission } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    
    const [newAssignment, setNewAssignment] = useState({ 
        title: '', 
        description: '', 
        deadline: '', 
        target_audience: 'everyone', 
        specific_student_ids: '', // as comma separated string
        attachments: []
    });
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchInitial = async () => {
            const sessionRes = await api.get('/sessions');
            setSessions(sessionRes.data.sessions);
            const current = sessionRes.data.sessions.find(s => s.current);
            if (current) {
                setSelectedSession(current.id);
                fetchClasses(current.id);
            }
        };
        fetchInitial();
    }, []);

    const fetchClasses = async (sessionId) => {
        const res = await api.get(`/classes?session_id=${sessionId}`);
        setClasses(res.data.classes);
    };

    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        const res = await api.get(`/courses?class_id=${classId}`);
        setCourses(res.data.courses);
        setAssignments([]);
    };

    const fetchAssignments = async (e) => {
        if(e) e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get('/assignments', { params: { class_id: selectedClassId, course_id: selectedCourseId } });
            setAssignments(res.data.assignments);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        setLoading(true);
        let currentAttachments = [];

        try {
            // 1. Upload files if exist
            if (attachmentFiles.length > 0) {
                setUploading(true);
                const formData = new FormData();
                attachmentFiles.forEach(file => {
                    formData.append('files', file);
                });
                
                const uploadRes = await api.post('/upload/assignment', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                currentAttachments = uploadRes.data.files;
            }

            const studentIds = newAssignment.specific_student_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            
            await api.post('/assignments', { 
                ...newAssignment, 
                attachments: currentAttachments,
                class_id: selectedClassId, 
                course_id: selectedCourseId,
                specific_student_ids: studentIds
            });
            setMessage({ text: 'Assignment published and allotted successfully.', type: 'success' });
            setNewAssignment({ title: '', description: '', deadline: '', target_audience: 'everyone', specific_student_ids: '', attachments: [] });
            setAttachmentFiles([]);
            setShowForm(false);
            fetchAssignments();
        } catch (err) { 
            const errorMsg = err.response?.data?.message || 'Error publishing assignment.';
            setMessage({ text: `${errorMsg} ${err.response?.data?.details || ''}`, type: 'danger' }); 
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0"><i className="bi bi-file-earmark-text me-2 text-primary"></i>Task Allocation</h2>
                {hasPermission('create assignments') && (
                    <button className="btn btn-primary fw-bold" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel Operation' : 'Direct Allot Work'}
                    </button>
                )}
            </div>

            {message.text && <div className={`alert alert-${message.type} border-0 rounded-3 shadow-sm mb-4`}>{message.text}</div>}

            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white">
                <div className="card-body p-4">
                    <form className="row g-3" onSubmit={fetchAssignments}>
                         <div className="col-md-4">
                            <label className="form-label small fw-bold">Class / Semester</label>
                            <select className="form-select bg-light border-0 py-2" value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} required>
                                <option value="">Select Target Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="col-md-4">
                            <label className="form-label small fw-bold">Academic Subject</label>
                            <select className="form-select bg-light border-0 py-2" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                                <option value="">Select Subject</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="col-md-4 d-flex align-items-end">
                            <button type="submit" className="btn btn-dark w-100 py-2 fw-bold">Fetch Allotted Work</button>
                         </div>
                    </form>
                </div>
            </div>

            {showForm && (
                 <div className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden border-top border-primary border-4">
                    <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                        <h5 className="fw-bold mb-0">Publish & Allot New Task</h5>
                        <div className="d-flex gap-2 mt-2">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1 small fw-bold">
                                <i className="bi bi-diagram-2 me-1"></i> 
                                {classes.find(c => c.id == selectedClassId)?.name || 'N/A'}
                            </span>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 small fw-bold">
                                <i className="bi bi-book me-1"></i> 
                                {courses.find(c => c.id == selectedCourseId)?.name || 'All Subjects'}
                            </span>
                        </div>
                    </div>
                    <div className="card-body p-4 pt-3">
                        <form onSubmit={handleAddAssignment}>
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold">Task Title</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" value={newAssignment.title} onChange={(e) => setNewAssignment(p=>({...p, title:e.target.value}))} placeholder="e.g., Mid-Term Project" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Submission Deadline</label>
                                    <input type="date" className="form-control bg-light border-0 py-2" value={newAssignment.deadline} onChange={(e) => setNewAssignment(p=>({...p, deadline:e.target.value}))} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Target Audience</label>
                                    <select className="form-select bg-light border-0 py-2" value={newAssignment.target_audience} onChange={(e) => setNewAssignment(p=>({...p, target_audience:e.target.value}))}>
                                        <option value="everyone">Everyone in Class</option>
                                        <option value="failure">Failure / Remedial Students</option>
                                        <option value="specific">Specific Person(s)</option>
                                    </select>
                                </div>
                                {newAssignment.target_audience === 'specific' && (
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Student IDs (Comma separated)</label>
                                        <input type="text" className="form-control bg-light border-0 py-2" value={newAssignment.specific_student_ids} onChange={(e) => setNewAssignment(p=>({...p, specific_student_ids:e.target.value}))} placeholder="e.g. 101, 105, 210" required />
                                    </div>
                                )}
                                <div className="col-12">
                                    <label className="form-label small fw-bold">Instructions & Details</label>
                                    <textarea className="form-control bg-light border-0 py-2" rows="4" value={newAssignment.description} onChange={(e) => setNewAssignment(p=>({...p, description:e.target.value}))} placeholder="Provide clear steps for the task..." required />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold">Attachments (Max 5 Files)</label>
                                    <div className="input-group mb-2">
                                        <input 
                                            type="file" 
                                            className="form-control bg-light border-0 py-2" 
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (attachmentFiles.length + files.length > 5) {
                                                    alert("You can only upload a maximum of 5 files.");
                                                    return;
                                                }
                                                setAttachmentFiles([...attachmentFiles, ...files]);
                                            }} 
                                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" 
                                            multiple 
                                        />
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {attachmentFiles.map((f, idx) => (
                                            <div key={idx} className="badge bg-light text-dark border p-2 d-flex align-items-center">
                                                <i className="bi bi-file-earmark-check me-2"></i>
                                                <span className="me-2 text-truncate" style={{ maxWidth: '150px' }}>{f.name}</span>
                                                <i className="bi bi-x-circle text-danger cursor-pointer" onClick={() => setAttachmentFiles(attachmentFiles.filter((_, i) => i !== idx))}></i>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-text small">Select up to 5 documents or photos related to this task.</div>
                                </div>
                                <div className="col-12 pt-2">
                                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow-sm" disabled={uploading}>
                                        <i className="bi bi-send-fill me-2"></i> {uploading ? 'Uploading Attachment...' : 'Publish & Allot Work'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                 </div>
            )}

            <div className="row g-4">
                {assignments.map(a => (
                    <div className="col-md-6" key={a.id}>
                        <div className="card shadow-sm border-0 rounded-4 h-100 overflow-hidden border-start border-primary border-5">
                            <div className="card-body p-4">
                                <h5 className="fw-bold">{a.title}</h5>
                                <div className="text-muted small mb-3"><i className="bi bi-clock me-1 text-danger"></i> Deadline: {new Date(a.deadline).toLocaleDateString()}</div>
                                <div className="bg-light p-3 rounded text-secondary mb-3 small">{a.description}</div>
                                {Array.isArray(a.attachments) && a.attachments.length > 0 && (
                                    <div className="mb-3 d-flex flex-wrap gap-2">
                                        {a.attachments.map((file, i) => (
                                            <a 
                                                key={i} 
                                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '')}${file.url}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="btn btn-sm btn-light border small py-1"
                                            >
                                                <i className="bi bi-paperclip me-1"></i> File {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                <button className="btn btn-sm btn-outline-primary fw-bold">View Submissions</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageAssignments;
