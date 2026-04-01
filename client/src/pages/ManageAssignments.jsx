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
    
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', deadline: '' });
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
        try {
            await api.post('/assignments', { ...newAssignment, class_id: selectedClassId, course_id: selectedCourseId });
            setMessage({ text: 'Assignment created.', type: 'success' });
            setNewAssignment({ title: '', description: '', deadline: '' });
            setShowForm(false);
            fetchAssignments();
        } catch (err) { setMessage({ text: 'Error creating assignment.', type: 'danger' }); }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0"><i className="bi bi-file-earmark-text me-2 text-primary"></i>Assignments</h2>
                {hasPermission('create assignments') && (
                    <button className="btn btn-primary fw-bold" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New Task'}
                    </button>
                )}
            </div>

            <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                    <form className="row g-3" onSubmit={fetchAssignments}>
                         <div className="col-md-4">
                            <label className="form-label small fw-bold">Class</label>
                            <select className="form-select bg-light border-0" value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)}>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="col-md-4">
                            <label className="form-label small fw-bold">Subject (Optional)</label>
                            <select className="form-select bg-light border-0" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                                <option value="">All Subjects</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="col-md-4 d-flex align-items-end">
                            <button type="submit" className="btn btn-dark w-100 py-2">Load Tasks</button>
                         </div>
                    </form>
                </div>
            </div>

            {showForm && (
                 <div className="card shadow-sm border-0 rounded-4 mb-4">
                    <div className="card-body p-4">
                        <form onSubmit={handleAddAssignment}>
                            <div className="mb-3"><label className="form-label small fw-bold">Title</label><input type="text" className="form-control" value={newAssignment.title} onChange={(e) => setNewAssignment(p=>({...p, title:e.target.value}))} required /></div>
                            <div className="mb-3"><label className="form-label small fw-bold">Deadline</label><input type="date" className="form-control" value={newAssignment.deadline} onChange={(e) => setNewAssignment(p=>({...p, deadline:e.target.value}))} required /></div>
                            <div className="mb-3"><label className="form-label small fw-bold">Instructions</label><textarea className="form-control" rows="3" value={newAssignment.description} onChange={(e) => setNewAssignment(p=>({...p, description:e.target.value}))} required /></div>
                            <button type="submit" className="btn btn-primary w-100 fw-bold">Publish Assignment</button>
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
