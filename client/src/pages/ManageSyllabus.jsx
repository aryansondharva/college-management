import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const getApiOrigin = () => {
    const configuredBaseUrl = import.meta.env.VITE_API_URL || api.defaults.baseURL || '/api';
    return configuredBaseUrl.replace(/\/api\/?$/, '');
};

const ManageSyllabus = () => {
    const { user } = useContext(AuthContext);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [syllabi, setSyllabi] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newSyllabus, setNewSyllabus] = useState({
        syllabus_name: '',
        file: null
    });

    async function fetchInitialData() {
        try {
            const [classesRes, sessionsRes] = await Promise.all([
                api.get('/classes'),
                api.get('/sessions')
            ]);
            setClasses(classesRes.data.classes);
            setSessions(sessionsRes.data.sessions);
            const currentSession = sessionsRes.data.sessions.find(s => s.is_current);
            if (currentSession) setSelectedSession(currentSession.id);
        } catch {
            setError('Failed to fetch initial data.');
        }
    }

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchCourses = async (classId) => {
        if (!classId) return;
        try {
            const res = await api.get(`/courses?class_id=${classId}`);
            setCourses(res.data.courses);
        } catch {
            setError('Failed to fetch courses.');
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        fetchCourses(classId);
    };

    const fetchSyllabi = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/syllabus?course_id=${selectedCourse}&session_id=${selectedSession}`);
            setSyllabi(res.data.syllabi);
            setLoading(false);
        } catch {
            setError('Failed to fetch syllabi.');
            setLoading(false);
        }
    };

    const handleAddSyllabus = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('syllabus_name', newSyllabus.syllabus_name);
        formData.append('course_id', selectedCourse);
        formData.append('class_id', selectedClass);
        formData.append('session_id', selectedSession);
        formData.append('file', newSyllabus.file);

        try {
            await api.post('/syllabus', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchSyllabi();
            setNewSyllabus({ syllabus_name: '', file: null });
        } catch {
            setError('Failed to upload syllabus.');
        }
    };

    const handleDeleteSyllabus = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/syllabus/${id}`);
            fetchSyllabi();
        } catch {
            setError('Failed to delete syllabus.');
        }
    };

    return (
        <div className="container-fluid py-4">
                <h2 className="mb-4">Course Syllabus</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Session</label>
                                <select className="form-select" value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Class</label>
                                <select className="form-select" value={selectedClass} onChange={handleClassChange}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Course</label>
                                <select className="form-select" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={fetchSyllabi} disabled={!selectedCourse}>Show Syllabus</button>
                            </div>
                        </div>
                    </div>
                </div>

                {user.role === 'admin' && selectedCourse && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-white"><h5 className="mb-0">Upload New Syllabus</h5></div>
                        <div className="card-body">
                            <form onSubmit={handleAddSyllabus} className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label">Syllabus Name</label>
                                    <input type="text" className="form-control" value={newSyllabus.syllabus_name} onChange={(e) => setNewSyllabus({...newSyllabus, syllabus_name: e.target.value})} required />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label">File</label>
                                    <input type="file" className="form-control" onChange={(e) => setNewSyllabus({...newSyllabus, file: e.target.files[0]})} required />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button type="submit" className="btn btn-success w-100">Upload</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Uploaded At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                                    ) : syllabi.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-4">No syllabi found.</td></tr>
                                    ) : syllabi.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.syllabus_name}</td>
                                            <td>{new Date(s.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <a href={`${getApiOrigin()}/${s.file_path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary me-2">Download</a>
                                                {user.role === 'admin' && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSyllabus(s.id)}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default ManageSyllabus;
